# Would you merge a green build?

**Length:** 6–8 minutes inside a 20–30 minute talk. **Audience:** students and developers. **Format:** one unsafe contribution, two concrete prevention checks, and its repair.

Start from [the demo links](DEMO-LINKS.md). Keep the attack PR, its completed Actions run, and the fix PR open. Open the reviewed and changed page previews in separate tabs. The Pages previews are saved, reviewed copies of completed HTML artifacts; the PR job does not deploy them. Download the artifacts as an offline fallback.

Use a completed run that includes the new **Trivy config** check. Earlier npm-only run links remain historical evidence, not evidence that Trivy ran. Confirm the attack run has the intended integrity rejection and configuration finding, and that the repaired run passes both checks. Show a live rerun only if time permits.

## 0:00–0:40 — Ask for a decision

**Screen:** Attack PR → **Files changed**. Show the readable dependency change and `deploy/` manifest. The dependency archive is binary; do not pretend its contents are visible in GitHub's text diff.

**Say:** “You are reviewing a contribution before a release. The application code is unchanged, but a dependency has new bytes and the deployment settings changed. Would a green build be enough to approve it?”

Pause for hands, then open **Checks**.

**Say:** “Our ordinary build succeeds. The checks that ask different security questions reject the change. Let's see what each result means.”

## 0:40–2:00 — Show the attack's effect

**Screen:** **Unsafe install · teaching only** → Actions summary. Show the reviewed page, then the changed page.

Point to **“Your first contribution belongs here”**, then **“A dependency changed this page.”**

**Say:** “The build finished, but the dependency changed what we produced. No one had to edit our application to change its output.”

Return to the summary's fake-token capture evidence.

**Say:** “The package also ran code during installation. Our authored hook copies a fixed fake token into a local file. The hook makes no network request. GitHub then stores that file as teaching evidence. Code running in a build can reach the inputs we give it.”

**Audience prompt:** “Which part of a successful build checks that this was the output we intended?”

## 2:00–3:05 — Reject the changed dependency

**Screen:** **Protected install** → summary. Point to `EINTEGRITY` once.

**Say:** “This path keeps our reviewed lockfile. npm compares the supplied archive with the bytes we approved. They differ, so installation stops before the dependency hook or page build.”

**Say:** “This red check is prevention working. It is not a malware verdict. If we approve unsafe code and its new lockfile together, the checksum can match perfectly.”

## 3:05–4:20 — Reject unsafe deployment settings

**Screen:** `deploy/` diff → the container's `securityContext.privileged: true` → **Trivy config** finding and file/line.

**Say:** “The same contribution also asks Kubernetes to run a privileged container. We do not apply this manifest. Trivy reads the configuration and flags the unsafe setting before it reaches a cluster.”

Point to the actual finding's severity and the configured **HIGH,CRITICAL** failure threshold.

**Say:** “Here Trivy is checking configuration. It is not scanning an image for vulnerable packages, and it is not deciding whether our npm fixture is malware. Different checks answer different questions.”

If verified repository settings require both **Protected install** and **Trivy config** on `main`, show PR #1's blocked merge status: “These checks are required, so this PR cannot merge while they fail.” Otherwise explain that making them required is the remaining enforcement step; a red check alone does not prove a merge gate is active.

## 4:20–5:15 — Repair and finish green

**Screen:** Fix PR #2 → **Files changed** → **Checks** → expected page.

**Say:** “The fix restores the reviewed dependency and the restricted deployment configuration. We do not replace the lockfile to bless the changed package, or suppress the infrastructure finding. The same checks now accept the repaired input.”

Show the green protected install and Trivy results from the completed repaired run. A green Trivy result means no findings crossed this configured threshold in these files; it does not certify a live cluster.

PR #2 targets the attack branch so its repair diff stays visible. It does **not** target `main`, so it does not demonstrate the `main` merge rule. Keep both teaching PRs unmerged.

## 5:15–6:05 — Explain the other security layers

**Screen:** The check list and `.github/dependabot.yml`. Keep this to one sentence per tool; use [the tool map](SECURITY-TOOLS.md) for questions.

- **CodeQL:** “Our configured analyses check JavaScript source and GitHub Actions workflows without running the application build. Completed scans and their findings tell us more than an enabled badge.”
- **Dependency review:** “Checks recognized dependency changes against vulnerability and policy data. Our same-version local archive is not a known-advisory demonstration.”
- **Dependabot:** “Proposes GitHub Actions updates for review; a scheduled update is not proof of safety.”

If asked about secrets, show the enabled secret-scanning and push-protection settings. Their settings were verified, but this session does not stage a push-protection test or use real credentials.

Say “configured” until a completed run is visible. A successful analysis job is not a blanket declaration that the repository is safe. Only show a Dependabot PR if one exists.

## 6:05–7:15 — Close with the real incident and the slides

**Screen:** [Trivy's official incident account](https://github.com/aquasecurity/trivy/discussions/10462), then the presentation's source → build → delivery graphic.

**Say:** “In February and March 2026, Trivy's own supply chain was compromised. A vulnerable workflow exposed credentials, surviving access enabled malicious releases, and existing action tags were redirected. Security tools are dependencies too.”

Point to this repository's reviewed full action SHAs and explicit scanner version.

**Say:** “Pin and review the action, its nested actions, and the tool it downloads. A fixed identity still needs a trust decision. Limit credentials so one compromised component has less reach.”

Close with the three connections: **Source:** review dependency bytes. **Build:** restrict what dependency code can access. **Delivery:** check configuration and verify the release before deploying. Our scan never applies Kubernetes resources, and our Pages preview is a reviewed copy of an artifact, not deployment by untrusted PR code.

**Final prompt:** “Which one of these checks could you contribute to an open-source project?”

## Placement in the selected presentation

The selected PDF has **23 physical pages** and retains footer numbers from the larger deck. These are different numbering systems. For one continuous demo, preview the incident on page 5, introduce the dependency example on page 7, then run this full story after page 17. Alternatively, show the npm segment at page 7 and the 75-second Trivy segment at page 17 without replaying the whole story.

| Physical PDF page | Printed footer | Slide | Demo connection |
|---|---|---|---|
| 3–4 | 03–04 | Software journey / attack path | Map the single PR through source, build, and output |
| 5 | 05 | Trivy, February–March 2026 | Use the official dated incident account, not malware samples |
| 6 | 06 | Source: the package name is a trust decision | Inspect the dependency change in PR #1 |
| 7 | 12 | Demo: npm ci rejects the changed package | Replace the terminal sequence with PR, page change, and protected check |
| 8 | 14 | Dependabot has three different jobs | Show this repo's Actions version-update configuration |
| 10 | 21 | Secret scanning and push protection | Show verified settings; do not claim an unperformed rejection test |
| 11 | 22 | CodeQL checks code and workflow patterns | Show completed analysis and explain coverage |
| 13 | 24 | Build: PR checks have no deployment access | Explain the fake token and limited PR-job permissions |
| 14–15 | 25–26 | Workflow identities / workflow checks | Explain full SHAs, nested dependencies, and linting |
| 16 | 27 | Cloud: only the approved job gets a credential | Discuss the boundary; do not claim this demo tests live cloud identity |
| 17 | 28 | Infrastructure checks should fail before apply | Show Trivy rejecting `privileged: true`, then accepting the repair |
| 18–19 | 42–43 | Security PRs / each tool needs a working check | Separate observed rejection, required gates, and tool ownership |

For recording, use readable browser zoom and pre-opened tabs. If GitHub is slow, use saved run summaries and downloaded artifacts, identified as recorded evidence. Do not present an earlier run as proof of newly added checks.
