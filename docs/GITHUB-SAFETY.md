# Safety and the exact lesson

This public teaching repository demonstrates a deliberately weakened dependency policy, an unsafe static cloud configuration, and the checks that reject them. Its package, hook, token, and page change are authored training fixtures. No real malware sample is used.

## What actually happens

The attack PR substitutes a local npm archive while retaining the package name, version, and reviewed lockfile. The unsafe job deliberately discards that lock before installing. The changed package's install hook records a fixed fake token in a local evidence file, and the package's imported code changes the generated HTML. The hook makes no network request. Actions uploads the authored fake-token evidence to GitHub with the other public artifacts.

The protected job installs the same candidate archive using the retained lock and `npm ci`. Unexpected package bytes produce an actual npm integrity failure before the hook or build runs. The job is red because the release candidate was rejected. The control job separately builds the reviewed package, showing that valid input can pass.

The unsafe job's green check means its configured commands completed. It is not a security verdict. The protected job's red check on the attack PR is the useful result the audience should inspect.

## Boundaries of this exercise

- The demonstration uses an explicit fake credential. It does not read real account tokens, cloud credentials, SSH keys, browser data, or home-directory secrets.
- The training npm operations use local archives, fresh local configuration and caches, and offline installation. GitHub Actions itself still uses GitHub's network services to check out code, obtain its runtime, and upload artifacts.
- The changed page is an artifact. This workflow has no deployment, package publishing, release creation, or cloud access step.
- The fixture, Trivy, and Dependency Review jobs give the GitHub token only `contents: read`. The separate CodeQL analysis job has `security-events: write` to upload findings and never executes the fixture. Checkout uses `persist-credentials: false`. No secrets are passed to the fixture, and no OIDC permission is requested.
- All jobs use GitHub-hosted runners. This repository is not intended for self-hosted runners or machines holding deployment credentials.
- Actions are pinned to exact commits, dependency caching is disabled, and jobs have bounded time limits. Only the site and evidence folders are uploaded; npm caches, configurations, and installed dependency trees are excluded.
- The workflow uses `pull_request`, `push` to `main`, and `workflow_dispatch`. It has no `pull_request_target` or privileged follow-up workflow.
- This is not a sandbox for arbitrary hostile code. Review code and workflow changes before approving a contributor's Actions run. Clearing a child environment does not create an operating-system sandbox.

## What the control does not prove

A lockfile can faithfully pin unsafe code. A pull request that changes both the package and its approved lock can pass an integrity check. Human review of dependencies, lockfile changes, and build policies remains necessary.

A contributor can also propose changes to the workflow or verifier. CODEOWNERS requests review of those files; it does not enforce review by itself. A failed check becomes a merge gate only when an applicable protection rule requires it. The intended required check names are exactly **Protected install** and **Trivy config**. Confirm the active rule and the attack PR's merge status before telling an audience that GitHub blocks merging. Owners with an authorized bypass may still have different capabilities.

Dependabot is configured to propose updates for GitHub Actions. It is not the detector in this demo, and this custom fixture should not be presented as a known-vulnerability alert. The package integrity check detects the changed bytes; Trivy separately detects risky cloud configuration.

Finally, there is no independent signed-delivery verification in this short GitHub exercise. The generated page illustrates the consequence at delivery. Provenance verification, cloud trust restrictions, and production deployment approval are additional controls to discuss in the slides, not capabilities claimed by this repository.

## Added security tools

Trivy scans only the authored `deploy/` manifest. The image name uses `example.invalid`; no image is pulled, no Kubernetes command runs, and there is no cluster access. The attack variant sets `privileged: true` so a real built-in Trivy rule can reject it. This is configuration scanning, not malicious-package detection or an image CVE scan.

The Trivy binary is a current official immutable release, verified against an embedded SHA-256 before execution on a GitHub-hosted runner. The action wrapper is pinned and its automatic setup is skipped. Built-in checks are used without downloading a changing check bundle. Checksums establish the selected bytes; they do not independently prove the producer was uncompromised.

Dependency Review reads the dependency graph and known advisories. CodeQL analyzes JavaScript and workflow source without installing the teaching dependency. Secret scanning and push protection are native GitHub settings, not claims that this fixed fake token is a detected real secret. No compromised Trivy release or real malware is downloaded or replayed.

GitHub Pages serves reviewed copies of completed artifacts. That hosting is separate from the PR jobs, which have no deployment permission.
