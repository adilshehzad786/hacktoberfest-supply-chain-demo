# Would you merge a green build?

A six-minute GitHub demo for Hacktoberfest: a tiny dependency change produces a successful build, captures a **fake** token into a local file, and changes the website. The same package is then rejected by a check that preserves the reviewed lockfile.

**Start with the pull request, not the terminal.** Ask the audience to judge the change, reveal its effect, then show the prevention working.

[Presenter script](docs/PRESENTER.md) · [Run and rehearse](docs/SETUP.md)

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
- **No live deployment:** the HTML is a build artifact opened locally. No cloud account, real credential, malware sample, or npm package publication is needed.

The unsafe job is intentionally a bad installation pattern for comparison. Its protections and fixed inputs make this a bounded teaching exercise; they do not turn arbitrary third-party code into safe code.

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
