# What each security check proves

The demo keeps one audience question: **would you merge a successful build?** The dependency replacement and unsafe Kubernetes setting are authored teaching changes. Their checks should reject the attack PR and accept its repair. No Kubernetes resources are applied.

| Control | Question it answers here | What it does not establish |
|---|---|---|
| **Protected install** | Do the candidate archive bytes match the reviewed npm lockfile? | That the approved code is harmless, or that a newly approved lockfile is trustworthy |
| **Trivy config** | Does supported configuration in `deploy/` violate the selected misconfiguration policies at HIGH or CRITICAL severity? | Malware detection, container image vulnerability scanning, or the security of a running cluster |
| **CodeQL** | Do the configured JavaScript and GitHub Actions analyses find supported vulnerability patterns? | Complete behavior coverage, every workflow risk, or a malware verdict |
| **Dependency review** | Do recognized dependency changes introduce known vulnerabilities or violate configured dependency policy? | Detection of this same-version local archive replacement or unknown malicious behavior |
| **Dependabot** | Are GitHub Actions version-update PRs needed on the configured schedule? | That a proposed update is safe, reviewed, merged, or deployed |
| **Secret scanning / push protection** | Do supported secret patterns appear in repository content or a push? | Detection of every secret, revocation of exposed credentials, or a demonstrated rejection in this session |
| **Required checks on main** | Have the configured merge requirements passed for this PR? | That a similarly named check is trustworthy if its enforcement can be edited or bypassed |

Read workflow configuration and completed results together. Configuration means a check is set up; an actual successful run establishes that it ran. A clean result is bounded by its inputs, rules, severity threshold, and coverage. The repository's current rule settings establish whether a failure blocks merging.

## The Trivy moment

In the attack PR, show the container's `securityContext.privileged: true` and the scanner's actual file/line finding. In the repair, show the restricted configuration and the completed scan. The policy is equivalent to:

```bash
trivy config --exit-code 1 --severity HIGH,CRITICAL deploy/
```

Use the report's actual rule ID and severity; do not relabel an installation/network error as a successful detection. Do not say “no vulnerabilities” when the result means “no HIGH/CRITICAL configuration findings.” Some other important settings, including `allowPrivilegeEscalation` and `runAsNonRoot`, have MEDIUM findings in Trivy's documented examples and would not alone fail this threshold. [Trivy misconfiguration documentation](https://trivy.dev/docs/latest/scanner/misconfiguration/)

This check never pulls or scans the image named in the manifest, starts a container, or applies the file to Kubernetes. It examines configuration. Add a separate image scan when you need evidence about the image's packages.

## The two merge gates

The intended required checks on `main` are **Protected install** and **Trivy config**. Confirm both are listed in the effective repository rule and inspect attack PR #1's merge status before saying they block merging. CodeQL and Dependency review provide additional analysis; whether their results are separately required is a repository policy decision. [GitHub required checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)

Fix PR #2 targets the attack branch, not `main`. Its passing checks demonstrate repaired inputs, not application of the `main` rule. Keep both PRs unmerged for the teaching comparison.

## Use the complementary tools honestly

This repository configures CodeQL for JavaScript/TypeScript and GitHub Actions static analysis with no application build. Its isolated analysis jobs have the `security-events: write` permission needed to submit results, not deployment access. A green analysis job means that scan completed; inspect Code scanning for findings and confirm both language analyses ran. These analyses are not the two required merge gates. [CodeQL queries](https://docs.github.com/en/code-security/reference/code-scanning/codeql/codeql-queries)

Dependency review uses the dependency graph's base/head changes and known vulnerability data, with configurable policy. Our invented local package has no known advisory, and substituting bytes without changing its version is not a promised detection path for that tool. The lock integrity check demonstrates that boundary. [Dependency review](https://docs.github.com/en/code-security/concepts/supply-chain-security/dependency-review)

Dependabot's three roles differ: alerts report known dependency vulnerabilities, security updates attempt supported fixes, and version updates propose scheduled changes. This repository configures **GitHub Actions version updates**. Repository settings were also read back on 17 October 2026 to confirm vulnerability alerts and unpaused Dependabot security updates are enabled. That confirms configuration, not that a vulnerability was found or a fix PR created. Show an actual bot PR when available; review the upstream changes before accepting a new pin. [Keeping Actions current](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/secure-your-dependencies/auto-update-actions)

Secret scanning and repository push protection were likewise confirmed enabled through GitHub's settings API. No real credential was introduced and no push-protection acceptance test was performed. The fixed demo canary is not a claim of a supported secret pattern. Detected exposure still requires investigation and credential revocation or rotation; deleting text is insufficient. [Secret scanning](https://docs.github.com/en/code-security/concepts/secret-security/secret-scanning) · [Push protection](https://docs.github.com/en/code-security/concepts/secret-security/push-protection)

## The scanner is a dependency too

The [Trivy incident](TRIVY-INCIDENT.md) connects the checks back to the talk's real-world case. Review and pin the action's full commit SHA, inspect nested actions and downloads, choose an explicit reviewed scanner version, and verify the downloaded artifact according to the release's supported verification method. A top-level SHA does not freeze a nested mutable reference or a `latest` binary. A verified identity does not prove the code is safe.

This workflow pins `trivy-action` v0.36.0 to its full commit SHA, skips its nested setup action, and selects Trivy v0.76.0 explicitly. It checks the Linux archive against a committed expected SHA-256 before execution and uses that binary's embedded configuration checks. Review the expected hash and version changes together. Checksum verification proves matching bytes, not harmless behavior.

The fake-token hook writes locally and makes no network request. GitHub uploads the resulting evidence as an artifact. Public Pages serves reviewed static copies of selected run artifacts; untrusted PR code has no Pages deployment step. Those copies are historical evidence and do not automatically change when Actions reruns.
