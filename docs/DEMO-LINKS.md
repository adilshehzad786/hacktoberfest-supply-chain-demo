# Verified rehearsal links

**Presentation:** [Securing Open Source — GitHub to the Cloud (Google Slides)](https://docs.google.com/presentation/d/1d1fScxREJQrt-N4-4fp8geq0TF1BYOD6NcHGcW47ETQ/edit?usp=sharing)

Start at the [presentation launch page](https://adilshehzad786.github.io/hacktoberfest-supply-chain-demo/). The completed runs below were checked on 17 October 2026.

| Show this | Link | Observed result |
|---|---|---|
| Unsafe contribution | [Attack PR #1](https://github.com/adilshehzad786/hacktoberfest-supply-chain-demo/pull/1) | Blocked from merging into main |
| Successful build, rejected bytes | [Attack run](https://github.com/adilshehzad786/hacktoberfest-supply-chain-demo/actions/runs/38987904715) | Unsafe build green; Protected install red with EINTEGRITY; no protected hook/build |
| Cloud configuration rejection | [Trivy attack run](https://github.com/adilshehzad786/hacktoberfest-supply-chain-demo/actions/runs/38987904750) | One HIGH KSV-0017 finding: Privileged |
| Repair diff | [Fix PR #2](https://github.com/adilshehzad786/hacktoberfest-supply-chain-demo/pull/2) | Targets attack branch; all eight reported checks successful |
| Reviewed dependency restored | [Repair run](https://github.com/adilshehzad786/hacktoberfest-supply-chain-demo/actions/runs/38987927964) | Expected page; no hook or fake-token capture |
| Restricted configuration restored | [Trivy repair run](https://github.com/adilshehzad786/hacktoberfest-supply-chain-demo/actions/runs/38987927994) | 22 evaluated checks passed; zero HIGH/CRITICAL findings |
| Complementary analysis | [CodeQL and Dependency Review](https://github.com/adilshehzad786/hacktoberfest-supply-chain-demo/actions/runs/38987927912) | Both CodeQL language jobs and Dependency Review succeeded |
| Real incident | [Official Trivy advisory](https://github.com/aquasecurity/trivy/security/advisories/GHSA-69fq-xp46-6x23) | Read-only case study; no malware replay |

Attack head: `b782b8790ef6c2862498cf2f4bc853d3e905cee0`. Repair head: `0def6c58d3b3e7b621b6be61e038f6c098eb962d`.

The effective main-branch protection requires **Protected install** and **Trivy config**, both from GitHub Actions. Admin enforcement is enabled. PR #2 targets the attack branch, so its results demonstrate repaired inputs, not main's merge rule. Keep both teaching PRs open and unmerged.

## Saved evidence and offline backup

The before/after HTML previews are byte-for-byte copies of the baseline-release and unsafe-release artifacts from the attack run above. Pages serves reviewed static copies from main/docs; PR jobs have no deployment step. Rerunning Actions does not silently replace these saved previews.

- [Trivy attack JSON](evidence/trivy-attack.json) and [summary](evidence/trivy-attack-summary.md)
- [Trivy repair JSON](evidence/trivy-fix.json) and [summary](evidence/trivy-fix-summary.md)

Actions artifacts expire after seven days. These committed reports, static previews, and the downloaded rehearsal bundle preserve the session evidence. A saved report is historical evidence, not a new scan.

Use the [7-minute presenter script](PRESENTER.md) and its physical-page/printed-footer slide mapping. CodeQL analysis completion is not a blanket malware verdict; inspect Code scanning findings as described in the [tool map](SECURITY-TOOLS.md).
