This teaching fix restores the reviewed dependency bytes while retaining the approved lockfile. It repairs the changed package instead of regenerating a lockfile to approve it.

Its base is the attack branch, so the diff shows the repair directly. It does not target `main` and does not demonstrate `main`'s merge rule. Keep both PRs unmerged for the before/after teaching comparison.

**Protected install** should now pass and produce the expected page, with no fake-token capture. Inspect the completed Actions summary and artifact to confirm those outcomes.

Compare this result with the attack PR: both use the same installation control; only the candidate package bytes differ. The lockfile and enforcement workflow still need review whenever they change.
