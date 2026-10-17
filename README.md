# Would you merge a green build?

**Presentation:** [Securing Open Source — GitHub to the Cloud](https://docs.google.com/presentation/d/1d1fScxREJQrt-N4-4fp8geq0TF1BYOD6NcHGcW47ETQ/edit?usp=sharing)

**Open the demo:** [before/after pages](https://adilshehzad786.github.io/hacktoberfest-supply-chain-demo/) · [attack PR #1](https://github.com/adilshehzad786/hacktoberfest-supply-chain-demo/pull/1) · [fixed PR #2](https://github.com/adilshehzad786/hacktoberfest-supply-chain-demo/pull/2) · [all rehearsal links](docs/DEMO-LINKS.md)

A six-to-eight-minute GitHub demo for Hacktoberfest: a tiny dependency change produces a successful build, captures a **fake** token into a local file, and changes the website. The same package is then rejected by a check that preserves the reviewed lockfile.

**Start with the pull request, not the terminal.** Ask the audience to judge the change, reveal its effect, then show the prevention working.

[Presenter script](docs/PRESENTER.md) · [Run and rehearse](docs/SETUP.md) · [Security tools and slide mapping](docs/SECURITY-TOOLS.md) · [Trivy incident](docs/TRIVY-INCIDENT.md)

## The incident

```text
SOURCE                       BUILD                         DELIVERY
Changed dependency  ──────►  Install hook runs  ─────────►  Website changes
Same name + version          Fake token copied locally     Build can still be green
         │
         └── Reviewed lockfile + npm ci ──► changed bytes rejected
```

| Check | Reviewed dependency | Changed dependency |
|---|---|---|
| **Baseline control** | Builds the expected page | Still uses the independent reviewed fixture |
| **Unsafe install · teaching only** | Builds the expected page | Green build; fake token captured and page changed |
| **Protected install** | Green | Red: integrity mismatch; no dependency hook or page build |

These are the **expected teaching outcomes**. Confirm the actual run's checks and evidence before presenting. A successful unsafe job only means its install/build commands finished successfully; it does not mean the output is safe.

## What the prevention proves

The protected path keeps the approved lockfile and uses `npm ci` with a fresh cache. A different archive cannot silently replace the locked bytes. `npm ci` preserves the lockfile rather than updating it during installation. [npm documentation](https://docs.npmjs.com/cli/v11/commands/npm-ci/)

The lockfile is a trust decision too. A reviewer who approves both an unsafe dependency and its new integrity value can still introduce unsafe code. Review dependency and lockfile changes together. Protect the check and the workflow that enforces it.

Make **Protected install** a required check on the target branch to enforce that decision at merge time. A red check by itself is evidence of rejection, not proof that repository settings block merging. [GitHub branch protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)

## What is real, and what is a teaching fixture?

- **Real:** a GitHub pull request, Actions jobs, npm installation, an install hook, lockfile integrity rejection, generated HTML, and saved evidence.
- **Authored for teaching:** both dependency variants, the page change, and the fixed fake token. The “capture” writes only to a local demo file. It does not send data to a receiver on the internet.
- **Reviewed static previews:** GitHub Pages hosts copies of completed HTML artifacts. The PR jobs do not deploy anything. The Kubernetes manifest is scanned as text; its example image is not pulled and no cluster is used.

The unsafe job is intentionally a bad installation pattern for comparison. Its protections and fixed inputs make this a bounded teaching exercise; they do not turn arbitrary third-party code into safe code.

## Add the cloud security decision

The same teaching PR also changes `deploy/contributor-card.yaml` to request a privileged container. **Trivy config** scans that manifest and rejects HIGH/CRITICAL misconfigurations. The fix PR restores the restricted configuration. Nothing is deployed.

This is a second, explicit risk in the PR: Trivy detects a cloud configuration mistake, while `npm ci` detects the changed dependency bytes. Neither result is presented as a general malware detector.

| Layer | What this repository checks |
|---|---|
| Trivy | HIGH/CRITICAL configuration findings in `deploy/`; JSON evidence and readable job summary |
| Dependency Review | New dependencies with known high/critical advisories |
| CodeQL | JavaScript and GitHub Actions analysis, with results in Code scanning |
| Dependabot | Weekly proposed Actions updates; native security updates enabled |
| Secret scanning + push protection | Native GitHub features enabled; no real credential is used as a test |

The [Trivy incident notes](docs/TRIVY-INCIDENT.md) link the official malware advisory and explain why the scanner itself must be reviewed and pinned. Read the [tool boundaries and slide map](docs/SECURITY-TOOLS.md) before presenting a passing check as a security guarantee.

## One useful Hacktoberfest contribution

Open `.github/dependabot.yml`: this repository asks Dependabot to propose **GitHub Actions** updates weekly. Review those update PRs and keep full commit pins current. This is dependency maintenance; it is not a detector for this hand-authored attack package. [Dependabot configuration](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference)

Good contributions include making a build reproducible, reviewing a dependency update, reducing workflow permissions, documenting a release check, or adding a test that catches the wrong output. Discuss changes with maintainers and contribute to repositories you actually understand.

## Reading the files

| File | Use it to explain |
|---|---|
| `.github/workflows/` | The independent control, unsafe install, and protected check |
| `.github/dependabot.yml` | How Actions updates become reviewable PRs |
| `scripts/ci.mjs` | How each job runs and records its observed result |
| `output/<mode>/site/index.html` | What the audience sees after a build |
| `output/<mode>/evidence/result.json` | The observed outcome behind the Actions summary |

The source → build → delivery framing follows the structure of [Nemo's *Around the Supply Chain in 80 Slides*](https://captnemo.in/talks/2025/around-scs-nemo-with-notes.pdf). This repository's package fixtures and demonstration are original teaching material.
