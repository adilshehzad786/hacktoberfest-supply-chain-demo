# Run and rehearse

Use the public repository's prepared attack PR and fix PR for the session. First confirm their current check results; a queued or incomplete run is not a completed demonstration.

## The three jobs

Workflow: **Attack then prevention**.

| Job | Artifact | Page after a successful build |
|---|---|---|
| **Baseline control** | `baseline-release` | `site/index.html` |
| **Unsafe install · teaching only** | `unsafe-release` | `site/index.html` |
| **Protected install** | `protected-evidence` | `site/index.html` only when installation is accepted |

Each artifact also contains `evidence/result.json`. The protected artifact for the attack run should contain rejection evidence and **no built site**. Inspect the actual artifact instead of treating its presence alone as proof of success.

The baseline always uses the independent reviewed fixture. The unsafe and protected paths use the candidate package, but differ in whether they preserve the approved lockfile. That comparison is the core of the demonstration.

## Before the audience arrives

1. Open the attack PR. Confirm **Unsafe install · teaching only** is green and **Protected install** is red for the integrity mismatch. Unexpected errors, such as a runner failure, are not a successful prevention result.
2. Open the completed run's job summaries. Download the baseline and unsafe evidence artifacts, extract them, and open each `site/index.html` in a browser tab.
3. Open the prepared fix PR and confirm **Protected install** is green and its page is the expected page. The fix PR targets the attack branch so its diff shows the repair. It does not target `main`; the `main` merge rule is not demonstrated by this PR.
4. If describing the PR as blocked from merging, verify the repository rule requires **Protected install** and inspect the PR's merge status. Do not infer branch protection from a red check alone.
5. Follow the [presenter script](PRESENTER.md). Keep the raw logs closed unless someone asks a technical question.

Use the [public launch page](https://adilshehzad786.github.io/hacktoberfest-supply-chain-demo/) for reviewed copies of the actual artifacts, or use the downloaded HTML as an offline backup. The PR jobs do not deploy these previews.

## Running the same checks locally

From the repository directory with Node.js and npm available:

```bash
node scripts/ci.mjs baseline
node scripts/ci.mjs unsafe
node scripts/ci.mjs protected
```

Results are written under `output/<mode>/`. On a candidate with changed bytes, `protected` should exit nonzero after identifying the integrity mismatch; the other two jobs can still succeed. On the repaired candidate, the protected check should succeed.

The workflow uses Node.js 24 on Ubuntu 24.04. Use Node.js 24 for a faithful local rehearsal. No top-level `npm install` is needed: the authored package archives are local fixtures, and the runner manages its own offline npm installation. GitHub Actions itself uses GitHub infrastructure and the pinned actions listed in the workflow.

## Keeping the prevention meaningful

- Preserve the reviewed lockfile when replaying the attack. Replacing it with a new lock that approves the changed archive changes the experiment.
- Review changes to the workflow and enforcement scripts as well as package files. A PR must not be able to quietly remove the check you depend on.
- Keep real credentials out of this training repository. The hook has a fixed fake-token demonstration and writes locally.
- Do not copy the deliberately unsafe job into a production pipeline. Its purpose is to show why a successful build is insufficient.

For a GitHub merge gate, require **Protected install** on the target branch using branch protection or a repository ruleset, and verify the rule against the attack PR. GitHub documents how required status checks affect merging in [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).

## Dependabot follow-up

`.github/dependabot.yml` configures **GitHub Actions** updates every Monday at 09:00 Asia/Karachi. Show its real configuration; only show an update PR if one actually exists. The toy local package is not an advisory-backed dependency and this demo does not claim Dependabot detects it. [Dependabot configuration reference](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference)

## Trivy and the other security checks

Before the call, inspect **Trivy config** on the attack PR and fix PR. The attack must fail because the parsed `deploy/contributor-card.yaml` report contains a HIGH/CRITICAL finding, not because a download or runner failed. The fixed configuration must pass with a parsed, nonempty configuration result and no findings at the selected threshold. Open the `trivy-config-evidence` artifact and the job summary for the actual rule ID and line.

Keep **Protected install** and **Trivy config** required on `main`. Dependency Review and CodeQL demonstrate complementary checks; a successful analysis job is not itself a proof that the code is safe. Show the Security tab for CodeQL findings. The fixed PR targets the attack branch for its readable repair diff.

Trivy runs in GitHub Actions; you do not need to install a scanner or run Kubernetes on your laptop. No insecure deployment is started. Follow the [tool map](SECURITY-TOOLS.md) for exact presentation page references and the [incident notes](TRIVY-INCIDENT.md) for the official malware report.
