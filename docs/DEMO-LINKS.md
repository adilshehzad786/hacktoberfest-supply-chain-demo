# Live demo links

## Start here

- [Presentation launch page](https://adilshehzad786.github.io/hacktoberfest-supply-chain-demo/)
- [Attack PR #1 — dependency replacement](https://github.com/adilshehzad786/hacktoberfest-supply-chain-demo/pull/1)
- [Fix PR #2 — restores reviewed bytes, targets the attack branch](https://github.com/adilshehzad786/hacktoberfest-supply-chain-demo/pull/2)
- [Attack rehearsal — ordinary build green, Protected install red](https://github.com/adilshehzad786/hacktoberfest-supply-chain-demo/actions/runs/38986660088)
- [Repaired rehearsal — all three checks green](https://github.com/adilshehzad786/hacktoberfest-supply-chain-demo/actions/runs/38986736058)
- [Clean baseline rehearsal](https://github.com/adilshehzad786/hacktoberfest-supply-chain-demo/actions/runs/38986590866)

The before/after HTML previews are byte-for-byte copies of the baseline-release and unsafe-release artifacts from the attack rehearsal. They are labelled historical run artifacts, not a live deployment by untrusted PR code. GitHub Pages only serves these reviewed static copies from main/docs. The exercise workflow has no deployment permission.

Keep both pull requests open and unmerged for the recording. PR #2 targets the attack branch so the repair diff stays visible. Artifacts expire after seven days; the static previews and local downloaded evidence remain available.
