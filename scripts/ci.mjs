import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = process.argv[2];
assert(['baseline', 'unsafe', 'protected'].includes(mode) && process.argv.length === 3,
  'Usage: node scripts/ci.mjs baseline|unsafe|protected');
const fake = 'DEMO_ONLY_NOT_A_REAL_CREDENTIAL';
const npmCli = fs.realpathSync(path.join(path.dirname(process.execPath), 'npm'));
assert(/^#![^\n]*\bnode\b/.test(fs.readFileSync(npmCli, 'utf8')), 'npm must be its installed Node CLI');
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const write = (file, data) => { fs.mkdirSync(path.dirname(file), {recursive: true}); fs.writeFileSync(file, data); };
const root = path.join(repo, 'work', mode);
const out = path.join(repo, 'output', mode);
for (const parent of [path.join(repo, 'work'), path.join(repo, 'output')]) {
  if (fs.existsSync(parent)) assert(fs.lstatSync(parent).isDirectory() && !fs.lstatSync(parent).isSymbolicLink(), 'Refusing redirected work/output');
}
for (const dir of [root, out]) { fs.rmSync(dir, {recursive: true, force: true}); fs.mkdirSync(dir, {recursive: true}); }
const app = path.join(root, 'app');
const evidence = path.join(out, 'evidence');
const userConfig = path.join(root, 'empty.npmrc');
const globalConfig = path.join(root, 'empty-global.npmrc');
write(userConfig, ''); write(globalConfig, '');
let calls = 0, stopping = false, active;
const stop = () => { stopping = true; active?.(); };
process.on('SIGINT', stop); process.on('SIGTERM', stop);
const running = () => { if (stopping) throw new Error('Demonstration interrupted'); };
async function child(args, env) {
  running();
  return new Promise(resolve => {
    const p = spawn(process.execPath, args, {cwd: app, env, detached: true, stdio: ['ignore', 'pipe', 'pipe']});
    let stdout = '', stderr = '', error, grace;
    const kill = sig => { try { process.kill(-p.pid, sig); } catch (e) { if (e.code !== 'ESRCH') error ||= e; } };
    active = () => { kill('SIGTERM'); grace ||= setTimeout(() => kill('SIGKILL'), 1000); };
    const timer = setTimeout(() => { error = new Error('Child exceeded 45 seconds'); active(); }, 45000);
    for (const [stream, label] of [[p.stdout, 'stdout'], [p.stderr, 'stderr']]) {
      stream.setEncoding('utf8'); stream.on('data', text => {
        if (stdout.length + stderr.length + text.length > 1024 * 1024) { error = new Error('Child output limit'); active(); }
        else if (label === 'stdout') stdout += text; else stderr += text;
      });
    }
    p.on('error', e => { error = e; });
    p.on('close', (status, signal) => { clearTimeout(timer); clearTimeout(grace); active = undefined; resolve({status, signal, stdout, stderr, error}); });
  });
}
async function npm(args) {
  const cache = path.join(root, 'cache', String(++calls));
  fs.mkdirSync(cache, {recursive: true});
  const env = {PATH: `${path.dirname(process.execPath)}:/usr/bin:/bin`};
  if (mode === 'unsafe') Object.assign(env, {DEMO_CANARY: fake, DEMO_WORK_ROOT: root});
  const result = await child([npmCli, ...args, '--offline', '--no-audit', '--no-fund', '--update-notifier=false',
    '--registry=https://registry.invalid', '--cache', cache, '--userconfig', userConfig,
    '--globalconfig', globalConfig, '--prefix', app, '--loglevel=error', '--color=false'], env);
  running();
  return result;
}
function summary(result) {
  const changed = result.outcome === 'changed-release';
  const blocked = result.outcome === 'blocked';
  const title = blocked ? 'The same replacement was blocked' : changed ? 'The build is green. The page has changed.' : result.outcome === 'trusted-release' ? 'The reviewed page was built' : 'The rehearsal needs attention';
  const text = [`# ${title}`, '',
    blocked ? 'The retained lock rejected the changed package before installation code or the app build could run.'
      : changed ? 'The application source did not change. Installing the replacement dependency changed what the build shipped.'
      : result.outcome === 'trusted-release' ? 'This is the working control: the reviewed dependency produced the expected contribution page.'
      : 'An unexpected failure occurred. Inspect the evidence; do not present it as prevention.', '',
    '| What happened | Observed result |', '| --- | --- |',
    `| Install command | \`${mode === 'unsafe' ? 'npm install (reviewed lock deliberately removed)' : 'npm ci (reviewed lock retained)'}\` |`,
    `| Fake credential copied by hook | ${result.fakeTokenCaptured ? 'Yes — fixed teaching value, local file only' : 'No'} |`,
    `| Application built | ${result.buildStarted ? 'Yes' : 'No'} |`,
    `| Release artifact produced | ${result.delivered ? 'Yes' : 'No'} |`,
    `| Package name/version | @workshop/contributor-card@1.0.0 |`, '',
    result.delivered ? `**Page headline:** ${result.release.headline}` : `**Reason:** ${result.reason}`, '',
    changed ? `**Captured fake value:** \`${fake}\`` : '',
    blocked ? '**This red check is the successful defense.** A required `Protected install` check prevents this PR from merging while it fails.'
      : changed ? '**Audience question:** would you merge this PR based only on the green build?' : '', '',
    result.delivered ? '**Next:** open the workflow artifact. `site/index.html` is the actual static build; `evidence/result.json` records this run.'
      : '**Next:** open `protected-evidence`. Its `evidence/result.json` and `install.log` record the rejection; no site was built.', '',
    'Teaching fixture only. No real credential, malware, external package download or cloud deployment.', '',
    'A reviewed lock checks expected bytes. It does not prove approved code is harmless.', ''].join('\n');
  write(path.join(evidence, 'summary.md'), text);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, text);
  console.log(title);
}
let result = {mode, outcome: 'error', installExit: null, hookRan: false, fakeTokenCaptured: false,
  buildStarted: false, delivered: false, reason: 'Run incomplete'};
try {
  fs.cpSync(path.join(repo, 'app'), app, {recursive: true});
  const manifest = JSON.parse(fs.readFileSync(path.join(repo, 'package.json'), 'utf8'));
  manifest.scripts = {build: 'node build.mjs'};
  write(path.join(app, 'package.json'), JSON.stringify(manifest, null, 2) + '\n');
  const source = mode === 'baseline' ? 'approved' : 'packages';
  const archive = fs.readFileSync(path.join(repo, source, 'contributor-card-1.0.0.tgz'));
  const approvedArchive = fs.readFileSync(path.join(repo, 'approved/contributor-card-1.0.0.tgz'));
  const lock = fs.readFileSync(path.join(repo, mode === 'baseline' ? 'approved/package-lock.json' : 'package-lock.json'));
  write(path.join(app, 'packages/contributor-card-1.0.0.tgz'), archive);
  write(path.join(app, 'package-lock.json'), lock);
  result.expectedSha256 = digest(approvedArchive); result.receivedSha256 = digest(archive);
  if (mode === 'unsafe') fs.unlinkSync(path.join(app, 'package-lock.json'));
  const install = await npm(mode === 'unsafe' ? ['install', '--foreground-scripts'] : ['ci', '--foreground-scripts']);
  result.installExit = install.status;
  write(path.join(evidence, 'install.log'), `Exit: ${install.status}\n${install.stdout}\n${install.stderr}`);
  assert(!install.error && !install.signal && Number.isInteger(install.status), 'Install must finish normally');
  const captured = path.join(root, 'captured-canary.txt');
  result.hookRan = fs.existsSync(captured);
  if (result.hookRan) {
    assert.equal(fs.readFileSync(captured, 'utf8'), fake + '\n');
    result.fakeTokenCaptured = true;
    write(path.join(evidence, 'captured-fake-canary.txt'), fake + '\n');
  }
  if (install.status !== 0) {
    assert(mode === 'protected' && /\bEINTEGRITY\b/.test(install.stderr), 'Unexpected installation failure');
    assert(!result.hookRan && !fs.existsSync(path.join(app, 'site')), 'Rejected bytes must not execute/build');
    assert(fs.readFileSync(path.join(app, 'package-lock.json')).equals(lock), 'Reviewed lock changed');
    result.outcome = 'blocked'; result.reason = 'EINTEGRITY: changed archive does not match reviewed lock';
    result.lockUnchanged = true;
    process.exitCode = 1; // Deliberate real red GitHub check: no continue-on-error.
  } else {
    result.buildStarted = true;
    const built = await child(['build.mjs'], {PATH: `${path.dirname(process.execPath)}:/usr/bin:/bin`});
    assert(built.status === 0 && !built.signal && !built.error, `Build failed: ${built.stderr}`);
    running();
    result.release = JSON.parse(fs.readFileSync(path.join(app, 'site/result.json'), 'utf8'));
    assert(['reviewed', 'changed'].includes(result.release.status));
    if (mode !== 'unsafe') assert.equal(result.release.status, 'reviewed', 'Protected/control build must be reviewed');
    if (mode === 'unsafe' && result.receivedSha256 !== result.expectedSha256) {
      assert(result.fakeTokenCaptured && result.release.status === 'changed', 'Changed teaching package must show both harmless effects');
    } else assert(!result.fakeTokenCaptured && result.release.status === 'reviewed');
    fs.cpSync(path.join(app, 'site'), path.join(out, 'site'), {recursive: true});
    result.delivered = true;
    result.outcome = result.release.status === 'changed' ? 'changed-release' : 'trusted-release';
    result.reason = result.outcome === 'changed-release' ? 'Reviewed lock removed: replacement code ran and changed the page' : 'Approved package built the expected page';
    if (mode !== 'unsafe') {
      assert(fs.readFileSync(path.join(app, 'package-lock.json')).equals(lock));
      result.lockUnchanged = true;
    }
  }
} catch (error) {
  result.outcome = 'error'; result.reason = error.message;
  process.exitCode = stopping ? 130 : 1;
} finally {
  result.completedAt = new Date().toISOString();
  write(path.join(evidence, 'result.json'), JSON.stringify(result, null, 2) + '\n');
  summary(result);
  process.removeListener('SIGINT', stop); process.removeListener('SIGTERM', stop);
}
