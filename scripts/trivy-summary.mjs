import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportPath = path.join(repo, 'output/security/trivy.json');
const summaryPath = path.join(repo, 'output/security/summary.md');
const expectedTargets = new Set(['contributor-card.yaml', 'deploy/contributor-card.yaml']);
const severities = new Set(['UNKNOWN', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
const statuses = new Set(['PASS', 'FAIL', 'EXCEPTION']);
const markdown = value => String(value).replace(/[\\`*_{}\[\]()#+.!|<>]/g, '\\$&').replace(/[\r\n]+/g, ' ');
const text = (value, label) => {
  assert(typeof value === 'string' && value.length > 0 && value.length < 2000, `Invalid ${label}`);
  return value;
};

// Reject an empty report or a skipped/failed scan instead of inventing a pass.
// Exported so parser controls can be tested without executing a scanner.
export function summarize(report, scanOutcome) {
  assert(['success', 'failure'].includes(scanOutcome), 'The Trivy scan did not complete');
  assert(report && typeof report === 'object' && !Array.isArray(report), 'Invalid Trivy report');
  assert(report.SchemaVersion === 2, 'Unexpected Trivy report schema');
  assert(/^v?0\.76\.0$/.test(report.Trivy?.Version ?? ''), 'Unexpected or missing Trivy version');
  assert(Array.isArray(report.Results) && report.Results.length === 1, 'Expected one scanned Kubernetes manifest');
  const result = report.Results[0];
  assert(result.Class === 'config' && result.Type === 'kubernetes', 'The expected Kubernetes scan is missing');
  assert(expectedTargets.has(result.Target), 'Unexpected scanned target');
  const count = result.MisconfSummary;
  assert(count && Number.isInteger(count.Successes) && count.Successes >= 0
    && Number.isInteger(count.Failures) && count.Failures >= 0
    && count.Successes + count.Failures > 0, 'No evaluated checks were reported');
  assert(Array.isArray(result.Misconfigurations) && result.Misconfigurations.length > 0,
    'The report must contain evaluated checks, including passing controls');
  for (const finding of result.Misconfigurations) {
    assert(finding && typeof finding === 'object', 'Malformed scanner finding');
    text(finding.ID, 'check ID');
    text(finding.Title, 'check title');
    assert(severities.has(finding.Severity) && statuses.has(finding.Status), 'Unknown finding severity or status');
    assert(finding.Status !== 'EXCEPTION', 'Unexpected ignored finding in this teaching scan');
  }
  const failures = result.Misconfigurations.filter(item => item.Status === 'FAIL'
    && ['HIGH', 'CRITICAL'].includes(item.Severity));
  assert(scanOutcome !== 'failure' || failures.length > 0,
    'Scanner failed without a HIGH/CRITICAL finding; inspect the job logs');
  const blocked = failures.length > 0;
  const rows = failures.map(item => {
    const line = Number.isInteger(item.CauseMetadata?.StartLine) && item.CauseMetadata.StartLine > 0
      ? item.CauseMetadata.StartLine : '—';
    const resolution = typeof item.Resolution === 'string' && item.Resolution.length < 2000
      ? item.Resolution : 'Read the scanner report for the recommended configuration.';
    return `| ${markdown(item.ID)} | ${item.Severity} | ${markdown(item.Title)} | ${line} | ${markdown(resolution)} |`;
  });
  const lines = [
    `# ${blocked ? 'Cloud configuration rejected' : 'The restricted configuration passed this guard'}`, '',
    blocked ? `Trivy reported **${failures.length} HIGH/CRITICAL finding(s)** in the proposed Kubernetes configuration.`
      : 'Trivy evaluated the manifest and reported **no HIGH/CRITICAL findings** under this configured policy.', '',
    '**Scanned:** `deploy/contributor-card.yaml` · **Scanner:** Trivy 0.76.0 · **Policy:** embedded Kubernetes checks', '',
    ...(blocked ? ['| Check | Severity | Finding | Line | Prevention |', '| --- | --- | --- | --- | --- |', ...rows, '',
      '**Audience question:** should a small website be allowed to run as a privileged container?', '',
      'Restore the restricted settings and run this same check again. A required check can gate the PR when the branch rule includes it.']
      : ['The working control makes it possible to compare a later change against a passing configuration.']), '',
    'This is a static file scan. Nothing was deployed, no container image was pulled, and no cluster or cloud credential was used.', '',
    'Passing this severity threshold is not proof that an application or container image is free of vulnerabilities.', '',
    '**Evidence:** download `trivy-config-evidence` and inspect `trivy.json`.', '',
  ];
  return {blocked, markdown: lines.join('\n')};
}

function safeOutput(file, create = false) {
  let current = repo;
  const segments = path.relative(repo, file).split(path.sep);
  for (let i = 0; i < segments.length; i++) {
    current = path.join(current, segments[i]);
    let info;
    try { info = fs.lstatSync(current); }
    catch (error) { if (error.code === 'ENOENT' && create) continue; throw error; }
    assert(!info.isSymbolicLink(), 'Refusing redirected scanner evidence');
    assert(i < segments.length - 1 ? info.isDirectory() : info.isFile() && info.nlink === 1,
      'Scanner evidence must use ordinary local files');
  }
}

function readReport() {
  safeOutput(reportPath);
  // Validate and read the opened file itself. O_NOFOLLOW rejects replacement
  // symlinks; O_NONBLOCK lets the regular-file check reject FIFOs without waiting.
  const fd = fs.openSync(reportPath,
    fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
  try {
    const info = fs.fstatSync(fd);
    assert(info.isFile() && info.nlink === 1, 'Scanner report must be an ordinary local file');
    assert(info.size > 0 && info.size <= 4 * 1024 * 1024, 'Missing, empty, or oversized Trivy report');
    const bytes = Buffer.alloc(info.size + 1);
    let length = 0;
    while (length < bytes.length) {
      const count = fs.readSync(fd, bytes, length, bytes.length - length, null);
      if (count === 0) break;
      length += count;
    }
    assert(length === info.size, 'Scanner report changed size while being read');
    return JSON.parse(bytes.subarray(0, length).toString('utf8'));
  } finally {
    fs.closeSync(fd);
  }
}

function writeSummary(rendered) {
  safeOutput(summaryPath, true);
  fs.mkdirSync(path.dirname(summaryPath), {recursive: true});
  // Do not truncate until this descriptor has passed the ownership checks.
  const fd = fs.openSync(summaryPath,
    fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK, 0o600);
  try {
    const info = fs.fstatSync(fd);
    assert(info.isFile() && info.nlink === 1, 'Scanner summary must be an ordinary local file');
    fs.ftruncateSync(fd, 0);
    fs.writeFileSync(fd, rendered);
  } finally {
    fs.closeSync(fd);
  }
}

function main() {
  let rendered;
  try {
    assert(process.argv.length === 2, 'Usage: node scripts/trivy-summary.mjs');
    const report = readReport();
    const summary = summarize(report, process.env.TRIVY_SCAN_OUTCOME);
    rendered = summary.markdown;
    if (summary.blocked) process.exitCode = 1;
  } catch (error) {
    rendered = '# The configuration scan needs attention\n\n'
      + `${markdown(error.message)}. This is not a verified pass or a demonstrated prevention result.\n\n`
      + 'Inspect the Trivy step and the uploaded evidence before presenting this run.\n';
    process.exitCode = 1;
  }
  writeSummary(rendered);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, rendered);
  console.log(rendered);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
