Would you merge this contribution because the ordinary build is green?

This teaching PR makes two reviewable changes:

1. Replaces a local dependency archive while preserving its name, version, and reviewed lockfile. The authored replacement changes the page and copies a fixed fake token into a local evidence file during installation.
2. Changes the static Kubernetes manifest to `privileged: true`.

| Check | Expected result | What to show |
|---|---|---|
| Unsafe install · teaching only | Green | Changed page and fake-token evidence |
| Protected install | Red | `EINTEGRITY` before the hook or build |
| Trivy config | Red | HIGH finding for the privileged container |
| Dependency review / CodeQL | Inspect actual results | Complementary checks; they do not certify package behavior |

Open the current job summaries for observed evidence. A download failure is not a successful prevention demo. On `main`, required checks turn the two rejections into a merge gate; verify the current blocked state.

This uses harmless authored fixtures and a fixed fake credential. The package hook has no network receiver. The cloud configuration is scanned as text and never applied; no image is pulled. Pages hosts reviewed historical HTML copies, separately from PR jobs.

Keep this PR unmerged. [PR #2](https://github.com/adilshehzad786/hacktoberfest-supply-chain-demo/pull/2) restores the reviewed dependency and restricted configuration. [Presenter guide](https://github.com/adilshehzad786/hacktoberfest-supply-chain-demo/blob/main/docs/PRESENTER.md) · [Official Trivy incident](https://github.com/aquasecurity/trivy/security/advisories/GHSA-69fq-xp46-6x23).
