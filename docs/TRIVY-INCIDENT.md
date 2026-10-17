# When the security tool became the supply-chain risk

On 27 February 2026, attackers exploited a vulnerable Trivy GitHub workflow and obtained credentials. Incomplete revocation left access available. On 19 March, stolen credentials enabled a malicious Trivy release. The official advisory also records redirection of existing action tags and compromised Docker Hub images on 22 March. This is a dated incident account, not a claim about current releases.

The lesson: a scanner is executable software inside the build's trust boundary. Review its identity and access like any other dependency. Pin a reviewed full action SHA, inspect nested actions, select an explicit reviewed binary version, and verify downloaded artifacts. The advisory documents cases where an older SHA-pinned wrapper still used a mutable nested setup action; pinning only the wrapper was insufficient.

In this demo, Trivy evaluates harmless Kubernetes configuration. We do not obtain or run the incident's malware. The deliberately unsafe manifest is scanned, never applied.

Primary sources: [maintainers' final incident account, 30 March](https://github.com/aquasecurity/trivy/discussions/10462) · [official security advisory](https://github.com/aquasecurity/trivy/security/advisories/GHSA-69fq-xp46-6x23).
