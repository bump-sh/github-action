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

Start with creating a documentation on [Bump.sh](https://bump.sh). Then add one of the following workflow file to your GitHub project.

_Important: [actions/checkout](https://github.com/actions/checkout) has to be called **before this action**._

### API diff on pull requests

If you only want to have API diff summary sent as a comment on your pull requests:

`.github/workflows/bump.yml`

```yaml
name: API diff

on:
  pull_request:
    branches:
      - main

jobs:
  api-diff:
    name: Check API diff on Bump
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
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

_Important: make sure to change your main destination branch name (`main` in the example above), replace `<BUMP_DOC_ID>` with your Bump documentation slug or id and change your api specification file path (`doc/api-documentation.yml` in the example above)._

### API diff on pull requests & Deploy on push

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

jobs:
  deploy-doc:
    if: ${{ github.event_name == 'push' }}
    name: Deploy API documentation on Bump
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Deploy API documentation
        uses: bump-sh/github-action@v1
        with:
          doc: <BUMP_DOC_ID>
          token: ${{secrets.BUMP_TOKEN}}
          file: doc/api-documentation.yml

  api-diff:
    if: ${{ github.event_name == 'pull_request' }}
    name: Check API diff on Bump
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
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

_Important: make sure to change your main destination branch name (`main` in the example above), replace `<BUMP_DOC_ID>` with your Bump documentation slug or id and change your api specification file path (`doc/api-documentation.yml` in the example above)._

### Deploy on push

If you only need to deploy the documentation on push you can use this workflow file instead:

`.github/workflows/bump.yml`

```yaml
name: Deploy documentation

on:
  push:
    branches:
      - main

jobs:
  deploy-doc:
    name: Deploy API doc on Bump
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Deploy API documentation
        uses: bump-sh/github-action@0.3
        with:
          doc: <BUMP_DOC_ID>
          token: ${{secrets.BUMP_TOKEN}}
          file: doc/api-documentation.yml
```

_Important: make sure to change your main destination branch name (`main` in the example above), replace `<BUMP_DOC_ID>` with your Bump.sh documentation slug or id and change your api specification file path (`doc/api-documentation.yml` in the example above)._

## Inputs

* `doc` (required): Documentation slug or id. Can be found in the documentation settings on https://bump.sh/docs

* `token` (required): Do not add your documentation token here, but create an [encrypted secret](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets) that holds your documentation token.

  * Your Bump.sh token can be found in the documentation settings on https://bump.sh. Copy it for later usage.
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

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/bump-sh/github-action. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](http://contributor-covenant.org) code of conduct.

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE).

## Code of Conduct

Everyone interacting in the Bump `github-action` project’s codebases, issue trackers, chat rooms and mailing lists is expected to follow the [code of conduct](https://github.com/bump-sh/github-action/blob/master/CODE_OF_CONDUCT.md).
