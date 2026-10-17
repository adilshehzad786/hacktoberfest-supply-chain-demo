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

## Connection to the talk

Nemo's [Around the Supply Chain in 80 Slides, with notes](https://captnemo.in/talks/2025/around-scs-nemo-with-notes.pdf) supplies the talk's Source → Build → Delivery structure. This repository is an original, small exercise: changed dependency bytes enter at Source, the install hook and imported module affect Build, and the generated HTML shows what could reach Delivery. It does not reproduce a real malware sample or a cloud compromise.

GitHub documentation and action release metadata were checked on 17 October 2026. Action pins should be maintained through reviewed updates, not treated as permanently safe versions.

## Action versions used

The release tags were resolved through GitHub's API to commit objects in the official action repositories before committing these pins.

| Action | Release | Commit pin |
| --- | --- | --- |
| Checkout | [v7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1) | `3d3c42e5aac5ba805825da76410c181273ba90b1` |
| Set up Node | [v7.1.0](https://github.com/actions/setup-node/releases/tag/v7.1.0) | `949feb2413d6458794dcd2491c4babbbce0c15c1` |
| Upload artifact | [v7.0.2](https://github.com/actions/upload-artifact/releases/tag/v7.0.2) | `cf430e030ddbb5b0abf93d22962f4752f3646cd9` |
