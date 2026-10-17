This repair restores the reviewed dependency bytes and changes the static Kubernetes configuration back to `privileged: false`.

It keeps the approved lockfile and the same checks. It does not bless the changed archive with a new lock or suppress the Trivy finding.

Expected results to verify in the latest completed runs:

- **Protected install** is green, produces the expected page, and records no fake-token capture.
- **Trivy config** is green, with an actual parsed configuration report and no HIGH/CRITICAL findings.
- Dependency Review and both CodeQL analyses complete; inspect Code scanning findings too.

This PR targets the attack branch so the repair diff is easy to review. It does **not** target `main` and does not demonstrate `main`'s merge rule. Keep both teaching PRs unmerged for the recording.

[Compare the unsafe contribution in PR #1](https://github.com/adilshehzad786/hacktoberfest-supply-chain-demo/pull/1). No Kubernetes resource is applied in either version.
