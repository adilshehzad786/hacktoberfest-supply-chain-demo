# Safety and the exact lesson

This public teaching repository demonstrates one deliberately weakened dependency policy and one prevention control. Its package, hook, token, and page change are authored training fixtures. No real malware sample is used.

## What actually happens

The attack PR substitutes a local npm archive while retaining the package name, version, and reviewed lockfile. The unsafe job deliberately discards that lock before installing. The changed package's install hook records a fixed fake token in a local evidence file, and the package's imported code changes the generated HTML. Nothing is sent to an external receiver.

The protected job installs the same candidate archive using the retained lock and `npm ci`. Unexpected package bytes produce an actual npm integrity failure before the hook or build runs. The job is red because the release candidate was rejected. The control job separately builds the reviewed package, showing that valid input can pass.

The unsafe job's green check means its configured commands completed. It is not a security verdict. The protected job's red check on the attack PR is the useful result the audience should inspect.

## Boundaries of this exercise

- The demonstration uses an explicit fake credential. It does not read real account tokens, cloud credentials, SSH keys, browser data, or home-directory secrets.
- The training npm operations use local archives, fresh local configuration and caches, and offline installation. GitHub Actions itself still uses GitHub's network services to check out code, obtain its runtime, and upload artifacts.
- The changed page is an artifact. This workflow has no deployment, package publishing, release creation, or cloud access step.
- The workflow gives the GitHub token only `contents: read`. Checkout uses `persist-credentials: false`. No secrets are passed to the fixture, and no OIDC permission is requested.
- All jobs use GitHub-hosted runners. This repository is not intended for self-hosted runners or machines holding deployment credentials.
- Actions are pinned to exact commits, dependency caching is disabled, and jobs have a five-minute limit. Only the site and evidence folders are uploaded; npm caches, configurations, and installed dependency trees are excluded.
- The workflow uses `pull_request`, `push` to `main`, and `workflow_dispatch`. It has no `pull_request_target` or privileged follow-up workflow.
- This is not a sandbox for arbitrary hostile code. Review code and workflow changes before approving a contributor's Actions run. Clearing a child environment does not create an operating-system sandbox.

## What the control does not prove

A lockfile can faithfully pin unsafe code. A pull request that changes both the package and its approved lock can pass an integrity check. Human review of dependencies, lockfile changes, and build policies remains necessary.

A contributor can also propose changes to the workflow or verifier. CODEOWNERS requests review of those files; it does not enforce review by itself. A failed check becomes a merge gate only when an applicable protection rule requires it. The intended required check name is exactly **Protected install**. Confirm the active rule and the attack PR's merge status before telling an audience that GitHub blocks merging. Owners with an authorized bypass may still have different capabilities.

Dependabot is configured to propose updates for GitHub Actions. It is not the detector in this demo, and this custom fixture should not be presented as a known-vulnerability alert. The package integrity check is the detector being demonstrated.

Finally, there is no independent signed-delivery verification in this short GitHub exercise. The generated page illustrates the consequence at delivery. Provenance verification, cloud trust restrictions, and production deployment approval are additional controls to discuss in the slides, not capabilities claimed by this repository.
