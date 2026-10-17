# Would you merge a green build?

**Length:** 5–7 minutes inside a 20–30 minute talk. **Audience:** students and developers. **Format:** one incident, then a prevention replay.

Keep three things ready: the attack PR, its completed Actions run, and the fix PR. Download the clean and unsafe HTML artifacts before the session and open both locally in browser tabs. The setup guide explains which files to use. Show a completed run first; a live rerun is optional.

## 0:00–0:40 — Ask for a decision

**Screen:** Attack PR → **Files changed**. Start on its short readable change; mention that the archive is a binary change if GitHub cannot show its contents. Do not imply a hidden payload is visible in a tiny text diff.

**Say:** “You are reviewing a contribution before a release. Our application code has not changed. A dependency has the same package name and version, but its bytes changed. Would a green build be enough for you to approve this?”

Pause for a show of hands. Then open the PR's **Checks**.

**Say:** “One build is green. Another check is red. Let's see why those results can both be correct.”

## 0:40–2:10 — Show the attack's effect

**Screen:** **Unsafe install · teaching only** → its Actions summary. Show the clean page for a few seconds, then the unsafe page.

Point to the clean headline, **“Your first contribution belongs here,”** then the changed headline, **“A dependency changed this page.”**

**Say:** “The ordinary build completed. But the page we produced changed. A dependency became part of our release without anyone editing our application.”

Return to the unsafe job summary and point to the evidence that the install hook copied the fake token. The website shows the page change; the summary shows the capture evidence.

**Say:** “This package also ran code during installation. In our training example, it copied a fixed fake token into a local file. Nothing is sent to the internet. The lesson is that code running inside a build can reach the inputs that build gives it.”

**Audience prompt:** “Which part of the green result checked that the output was the output we intended?”

Do not read raw logs. Use the summary and visible page. If someone asks how the hook works, show the small authored fixture after the main story.

## 2:10–3:35 — Stop the same package

**Screen:** Return to **Protected install** → summary, then the failing install step only if needed.

**Say:** “Now we send the same changed package through a build that keeps our reviewed lockfile. It asks npm to install the bytes we approved. The bytes do not match, so installation stops before the package hook or website build.”

Point to `EINTEGRITY` once.

**Say:** “This red result is our prevention working. We did not teach a scanner this package's name. We preserved a decision about which bytes we trust.”

If the repository's required-check rule has been configured and verified, return to the PR and point to the blocked merge status:

**Say:** “This check is required on the target branch, so this PR cannot merge while it is failing.”

If no such rule is active, say only: “The check rejects the package. Making this check required is what turns that signal into a merge gate.”

## 3:35–4:35 — Repair and finish green

**Screen:** Prepared fix PR → **Files changed** → **Checks** → corrected output.

This PR targets the attack branch, making the repair visible as its own diff. It is a comparison of before/after check results, not a demonstration of the `main` merge rule.

**Say:** “We restore the reviewed dependency bytes. We do not regenerate the lockfile just to make the warning disappear. The protected install now passes and the expected page comes back.”

Point to the passing protected check and the clean artifact.

**Say:** “Green is useful when we know what the check actually guarantees.”

Keep both teaching PRs unmerged. Their preserved before/after runs are part of the demonstration.

## 4:35–5:35 — Connect it to the slides

Return to the presentation's source → build → delivery graphic.

| Stage | What the audience just saw | Habit to take away |
|---|---|---|
| **Source** | Dependency bytes changed | Review dependencies, archives, and lockfiles together |
| **Build** | Installation ran dependency code | Keep credentials and write permissions out of untrusted build paths |
| **Delivery** | A successful build produced the wrong page | Check the output and enforce release verification before deployment |

**Say:** “We followed one dependency all the way through. The main prevention in this demo is the reviewed lockfile plus the required install check. In a real pipeline, also restrict credentials and verify the release you deliver. Today's artifact is local HTML, not a cloud deployment.”

Keep the distinction clear: this demo does not prove a live cloud identity policy, deploy an attested release, or detect every malicious package.

## 5:35–6:20 — Give attendees one useful contribution

**Screen:** `.github/dependabot.yml`, then an existing Dependabot Actions update PR if one is available.

**Say:** “Here is a small open-source contribution: keep workflow dependencies reviewed and current. Dependabot can open update PRs for our GitHub Actions. A person still reviews what changed. It would not magically identify our invented package as malware.”

**Final audience prompt:** “Before you merge your next dependency change, which trust decision will you check?”

Close on: **Review the bytes. Limit the build. Verify the release.**

## Short recording plan

Record the same six-minute order with pre-opened tabs. Keep browser zoom readable from the back of the room. Use the PR diff, two check summaries, and two page views; skip scrolling through installation logs. Pause briefly after the first audience question so the recording also works with live narration.

If Actions is slow or unavailable, use the saved run's summaries and the downloaded HTML files. State that these are results from the recorded run. Never substitute a screenshot for a live result without saying so.
