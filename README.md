# Deploy API documentation at each code commit, and review diffs

<p align="center">
  <img width="20%" src="https://bump.sh/icon-default-large.png" />
</p>

<p align="center">
  <a href="https://help.bump.sh/">Help</a> |
  <a href="https://bump.sh/users/sign_up">Sign up</a>
</p>

Bump.sh helps you build a branded single source of truth, cataloging all your APIs. We’ve created the reference point for teams consuming and building APIs, no matter which technology they rely on.

Bump.sh keeps your API docs always synchronized with your codebase. With this [Github Action](https://github.com/actions) your API reference is automatically generated - with changelog and diff - on [Bump.sh](https://bump.sh) from any [OpenAPI](https://github.com/OAI/OpenAPI-Specification) or [AsyncAPI](https://github.com/asyncapi/asyncapi) file.

## Table of contents

* [Usage](#usage)
* [Inputs](#inputs)
* [Contributing](#contributing)
* [License](#license)
* [Code Of Conduct](#code-of-conduct)

## Usage

Start with creating a documentation on [Bump.sh](https://bump.sh). 

Once you've got an API Documentation set up, go to Settings > CI Deployment, copy the access token, then add it to GitHub Settings > Secrets > Actions as a new environment variable called `BUMP_TOKEN`.

Then you can pick from one of the three following API workflow files.

- **Recommended:** [Deploy Documentation & Diff on Pull Requests](#deploy-documentation--diff-on-pull-requests)
- [Deploy Documentation only](#deploy-documentation-only)
- [Diff on Pull Requests only](#diff-on-pull-requests-only)

### Deploy Documentation & Diff on Pull Requests

This is the most common worklow that we [recommend using](https://help.bump.sh/continuous-integration#integrate-with-your-ci), which will create two steps in your automation flow: a validation & diff step on code reviews, followed by a deployment step on merged changes.

`.github/workflows/bump.yml`

```yaml
name: Check & deploy API documentation

on:
  push:
    branches:
      - main

  pull_request:
    branches:
      - main

permissions:
  contents: read
  pull-requests: write

jobs:
  deploy-doc:
    if: ${{ github.event_name == 'push' }}
    name: Deploy API documentation on Bump.sh
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Deploy API documentation
        uses: bump-sh/github-action@v1
        with:
          doc: <BUMP_DOC_ID>
          token: ${{secrets.BUMP_TOKEN}}
          file: doc/api-documentation.yml

  api-diff:
    if: ${{ github.event_name == 'pull_request' }}
    name: Check API diff on Bump.sh
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Comment pull request with API diff
        uses: bump-sh/github-action@v1
        with:
          doc: <BUMP_DOC_ID>
          token: ${{secrets.BUMP_TOKEN}}
          file: doc/api-documentation.yml
          command: diff
        env:
          GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
```

**Important:** make sure to change your destination branch name (`main` in the example above), replace `<BUMP_DOC_ID>` with your Bump.sh documentation slug or id, and point `file:` to your local API description document (`doc/api-documentation.yml`).

### Deploy Documentation only

If you only need to deploy documentation changes on push then you can use this workflow instead:

`.github/workflows/bump.yml`

```yaml
name: Deploy documentation

on:
  push:
    branches:
      - main

jobs:
  deploy-doc:
    name: Deploy API doc on Bump.sh
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Deploy API documentation
        uses: bump-sh/github-action@v1
        with:
          doc: <BUMP_DOC_ID>
          token: ${{secrets.BUMP_TOKEN}}
          file: doc/api-documentation.yml
```

**Important:** make sure to change your destination branch name (`main` in the example above), replace `<BUMP_DOC_ID>` with your Bump.sh documentation slug or id, and point `file:` to your local API description document (`doc/api-documentation.yml`).


### Diff on Pull Requests only

If you only want to have API diff posted on pull requests use this workflow:

`.github/workflows/bump.yml`

```yaml
name: API diff

permissions:
  contents: read
  pull-requests: write

on:
  pull_request:
    branches:
      - main

jobs:
  api-diff:
    name: Check API diff on Bump.sh
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Comment pull request with API diff
        uses: bump-sh/github-action@v1
        with:
          doc: <BUMP_DOC_ID>
          token: ${{secrets.BUMP_TOKEN}}
          file: doc/api-documentation.yml
          command: diff
        env:
          GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
```

**Important:** make sure to change your destination branch name (`main` in the example above), replace `<BUMP_DOC_ID>` with your Bump.sh documentation slug or id, and point `file:` to your local API description document (`doc/api-documentation.yml`).

## Inputs

* `doc` (required): Documentation slug or id. Can be found in the documentation settings on https://bump.sh/docs

* `token` (required): Do not add your documentation token here, but create an [encrypted secret](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets) that holds your documentation token.

  * Your Bump.sh token can be found in the documentation settings on [your API dashboard](https://bump.sh/docs). Copy it for later usage.
  * In your GitHub repository, go to your “Settings”, and then “Secrets”.
  * Click the button “New repository secret”, name the secret `BUMP_TOKEN` and paste your Bump.sh token in the value field.

* `file`: Relative path to the documentation file. _Default: `api-contract.yml`_

* `hub` (optional): Hub slug or id. Needed when deploying to a documentation attached to a Hub. Can be found in the hub settings on https://bump.sh

* `branch` (optional): Branch name used during `deploy` or `diff` commands. This can be useful to maintain multiple API reference history and make it available in your API documentation.

* `command`: Bump.sh command to execute. _Default: `deploy`_

  * `deploy`: deploy a new version of the documentation
  * `diff`: automatically comment your pull request with the API diff
  * `dry-run`: dry-run a deployment of the documentation file
  * `preview`: create a temporary preview

* `expires` (optional): Specify a longer expiration date for **public diffs** (defaults to 1 day). Use iso8601 format to provide a date, or you can use `never` to keep the result live indefinitely.

* `fail_on_breaking` (optional): Mark the action as failed when a breaking change is detected with the diff command. This is only valid with `diff` command.

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/bump-sh/github-action. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](http://contributor-covenant.org) code of conduct.

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE).

## Code of Conduct

Everyone interacting in the Bump `github-action` project’s codebases, issue trackers, chat rooms and mailing lists is expected to follow the [code of conduct](https://github.com/bump-sh/github-action/blob/master/CODE_OF_CONDUCT.md).
