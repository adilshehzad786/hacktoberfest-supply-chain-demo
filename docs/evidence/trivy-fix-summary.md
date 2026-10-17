# The restricted configuration passed this guard

Trivy evaluated the manifest and reported **no HIGH/CRITICAL findings** under this configured policy.

**Scanned:** `deploy/contributor-card.yaml` · **Scanner:** Trivy 0.76.0 · **Policy:** embedded Kubernetes checks

The working control makes it possible to compare a later change against a passing configuration.

This is a static file scan. Nothing was deployed, no container image was pulled, and no cluster or cloud credential was used.

Passing this severity threshold is not proof that an application or container image is free of vulnerabilities.

**Evidence:** download `trivy-config-evidence` and inspect `trivy.json`.
