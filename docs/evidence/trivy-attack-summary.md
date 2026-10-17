# Cloud configuration rejected

Trivy reported **1 HIGH/CRITICAL finding(s)** in the proposed Kubernetes configuration.

**Scanned:** `deploy/contributor-card.yaml` · **Scanner:** Trivy 0.76.0 · **Policy:** embedded Kubernetes checks

| Check | Severity | Finding | Line | Prevention |
| --- | --- | --- | --- | --- |
| KSV-0017 | HIGH | Privileged | 31 | Change 'containers\[\]\.securityContext\.privileged' to 'false'\. |

**Audience question:** should a small website be allowed to run as a privileged container?

Restore the restricted settings and run this same check again. A required check can gate the PR when the branch rule includes it.

This is a static file scan. Nothing was deployed, no container image was pulled, and no cluster or cloud credential was used.

Passing this severity threshold is not proof that an application or container image is free of vulnerabilities.

**Evidence:** download `trivy-config-evidence` and inspect `trivy.json`.
