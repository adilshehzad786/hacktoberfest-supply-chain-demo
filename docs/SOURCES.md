# Why these controls are in the demo

These are reference materials, not proof that a repository setting is enabled.
Use the live Actions run and repository settings for that evidence.

| Control or teaching point | Primary reference |
| --- | --- |
| Keep the reviewed lockfile and use a frozen install in CI. `npm ci` does not rewrite the package lock. | [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/) |
| A lockfile records package integrity, not a judgement that its code is trustworthy. | [npm package-lock.json](https://docs.npmjs.com/cli/v11/configuring-npm/package-lock-json/) |
| Do not hand unnecessary credentials to dependency code. Set the GitHub token to the permissions each job needs. | [GitHub workflow permissions](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#permissions) |
| Pin actions to full commit SHAs, review changes to workflows, and avoid direct interpolation of untrusted event data into shell scripts. | [GitHub secure use reference](https://docs.github.com/en/actions/reference/security/secure-use) |
| Checkout can avoid persisting its authentication credentials. | [actions/checkout](https://github.com/actions/checkout#usage) |
| Dependency caching is explicitly disabled in this exercise so an earlier cache cannot conceal the substituted archive. | [actions/setup-node](https://github.com/actions/setup-node#usage) |
| Actions job summaries let the audience read the outcome without following every log line. | [GitHub workflow commands: job summaries](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-commands#adding-a-job-summary) |
| Make a successful check a merge requirement, then verify that the intended rule applies to the target branch. | [GitHub protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) |
| Dependabot proposes updates to GitHub Actions used in workflow files. | [Dependabot options](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference) |
| Dependabot alerts concern known vulnerable dependencies; a custom teaching fixture is not a known-advisory detection test. | [Dependabot alerts](https://docs.github.com/en/code-security/concepts/supply-chain-security/dependabot-alerts) |
| Scan supported Kubernetes configuration for policy violations before applying it. A configuration scan is distinct from an image vulnerability scan. | [Trivy misconfiguration scanning](https://trivy.dev/docs/latest/scanner/misconfiguration/) |
| CodeQL analyzes selected languages and query suites, including JavaScript/TypeScript and GitHub Actions workflows. Confirm the completed analysis's coverage. | [CodeQL queries](https://docs.github.com/en/code-security/reference/code-scanning/codeql/codeql-queries) |
| Dependency review compares recognized dependency changes and known vulnerability/policy data. A failed check needs a required-check rule to block merging. | [GitHub Dependency review](https://docs.github.com/en/code-security/concepts/supply-chain-security/dependency-review) |
| GitHub Actions version updates propose reviewable workflow dependency changes. | [Keeping Actions up to date with Dependabot](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/secure-your-dependencies/auto-update-actions) |
| Trivy's February–March 2026 incident involved exposed credentials, surviving access, malicious releases, and action-tag substitution. | [Final maintainer account](https://github.com/aquasecurity/trivy/discussions/10462), [official advisory](https://github.com/aquasecurity/trivy/security/advisories/GHSA-69fq-xp46-6x23) |
| Secret scanning reports supported credential patterns; push protection can reject supported secrets before a push. Enabled settings do not substitute for an observed acceptance test. | [Secret scanning](https://docs.github.com/en/code-security/concepts/secret-security/secret-scanning), [Push protection](https://docs.github.com/en/code-security/concepts/secret-security/push-protection) |

## Connection to the talk

Nemo's [Around the Supply Chain in 80 Slides, with notes](https://captnemo.in/talks/2025/around-scs-nemo-with-notes.pdf) supplies the talk's Source → Build → Delivery structure. This repository is an original, small exercise: changed dependency bytes enter at Source, the install hook and imported module affect Build, and the generated HTML shows what could reach Delivery. It does not reproduce a real malware sample or a cloud compromise.

The selected 23-page presentation retains old footer numbers. The [presenter script](PRESENTER.md#placement-in-the-selected-presentation) maps physical page 5/footer 05 to the Trivy incident, page 7/footer 12 to the npm demo, and page 17/footer 28 to Trivy configuration scanning. The [tool map](SECURITY-TOOLS.md) explains which claims each check supports; the [incident note](TRIVY-INCIDENT.md) supplies the dated real-world context.

GitHub documentation and action release metadata were checked on 17 October 2026. Action pins should be maintained through reviewed updates, not treated as permanently safe versions.

Action pins and explicit tool versions are recorded in workflow files. The Trivy advisory specifically shows why a reviewed top-level action SHA alone is insufficient when nested actions or binary downloads remain mutable.

## Action versions used

The release tags were resolved through GitHub's API to commit objects in the official action repositories before committing these pins.

| Action | Release | Commit pin |
| --- | --- | --- |
| Checkout | [v7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1) | `3d3c42e5aac5ba805825da76410c181273ba90b1` |
| Set up Node | [v7.1.0](https://github.com/actions/setup-node/releases/tag/v7.1.0) | `949feb2413d6458794dcd2491c4babbbce0c15c1` |
| Upload artifact | [v7.0.2](https://github.com/actions/upload-artifact/releases/tag/v7.0.2) | `cf430e030ddbb5b0abf93d22962f4752f3646cd9` |
| Dependency review | [v5.0.0](https://github.com/actions/dependency-review-action/releases/tag/v5.0.0) | `a1d282b36b6f3519aa1f3fc636f609c47dddb294` |
| CodeQL | [v4.39.0](https://github.com/github/codeql-action/releases/tag/v4.39.0) | `6f2ac81f5cd81fe351a197ba0b00d91d03cd2aee` |
| Trivy action | [v0.36.0](https://github.com/aquasecurity/trivy-action/releases/tag/v0.36.0) | `ed142fd0673e97e23eac54620cfb913e5ce36c25` |

The Trivy workflow explicitly downloads [Trivy v0.76.0](https://github.com/aquasecurity/trivy/releases/tag/v0.76.0), verifies the Linux-64bit archive against the committed SHA-256 `e24b1c51293c1b15e4ba8d45bbc7891ba053f90278ec2698f3562c993e145fe7`, and skips the action's nested setup. This is a selected, reviewed version and checksum, not a permanent safety guarantee or a claim that a version pin alone authenticates a download.
