# Deploy API documentation at each code commit, and review diffs

<p align="center">
  <img width="20%" src="https://bump.sh/icon-default-maskable-large.png" />
</p>

<p align="center">
  <a href="https://docs.bump.sh/help/">Help</a> |
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

- **Recommended:** [Deploy documentation & diff on pull requests](#deploy-documentation--diff-on-pull-requests)
- [Deploy documentation only](#deploy-documentation-only)
- [Diff on pull requests only](#diff-on-pull-requests-only)

This GitHub action can be utilized to interact with the MCP server and workflow definition on bump.sh hosted on Bump.sh:

- [Deploy workflow document for your MCP server](#deploy-workflow-document-for-your-MCP-Server)

### Deploy documentation & diff on pull requests

This is the most common worklow that we [recommend using](https://docs.bump.sh/help/continuous-integration/), which will create two steps in your automation flow: a validation & diff step on code reviews, followed by a deployment step on merged changes.

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

**Important:** make sure you adapt the name of the branch your deployment will target, _aka_ your destination branch if relevant (`main` in the example above), replace `<BUMP_DOC_ID>` with your Bump.sh documentation slug or id, and point `file:` to your local API definition file (`doc/api-documentation.yml`).

### Deploy documentation only

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

**Important:** make sure you adapt the name of the branch your deployment will target, _aka_ your destination branch if relevant (`main` in the example above), replace `<BUMP_DOC_ID>` with your Bump.sh documentation slug or id, and point `file:` to your local API definition file (`doc/api-documentation.yml`).

### Diff on pull requests only

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

**Important:** make sure you adapt the name of the branch your deployment will target, _aka_ your destination branch if relevant (`main` in the example above), replace `<BUMP_DOC_ID>` with your Bump.sh documentation slug or id, and point `file:` to your local API definition file (`doc/api-documentation.yml`).

### Deploy a single documentation on a hub

You can deploy a documentation inside a hub by adding a `hub` slug or id.
Note that the documentation will be automatically created if it doesn't exist by using the slug you defined with the `doc:` input.

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
        uses: actions/checkout@v4
      - name: Deploy API documentation
        uses: bump-sh/github-action@v1
        with:
          doc: <BUMP_DOC_ID>
          hub: <BUMP_HUB_ID>
          token: ${{secrets.BUMP_TOKEN}}
          file: doc/api-documentation.yml
```

**Important:** make sure you adapt the name of the branch your deployment will target, _aka_ your destination branch if relevant (`main` in the example above), replace `<BUMP_DOC_ID>` with your Bump.sh documentation slug or id, `<BUMP_HUB_ID>` with your Bump.sh hub slug or id and point `file:` to your local API definition file (`doc/api-documentation.yml`).

### Deploy multiple documentation at once on a hub

You can deploy multiple documentation inside a hub from a **source directory** by adding a `hub` slug or id and specifying a directory name in the `file:` input. Note that documentation will be automatically created if they don't exist.

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
        uses: actions/checkout@v4
      - name: Deploy API documentation
        uses: bump-sh/github-action@v1
        with:
          hub: <BUMP_HUB_ID>
          token: ${{secrets.BUMP_TOKEN}}
          file: docs/
```

**Important:** make sure you adapt the name of the branch your deployment will target, _aka_ your destination branch if relevant (`main` in the example above), replace `<BUMP_HUB_ID>` with your Bump.sh hub slug or id and point `file:` to your local API definition file folder (`docs/`).

Please note, by default, only files named `{slug}-api.[format]` are deployed. Where `{slug}` is a name for your API and `[format]` is either `yaml` or `json`. Adjust to your file naming convention using the `filename_pattern:` input.

Note that it _can_ include `*` wildcard special character, but **must** include the `{slug}` filter to extract your documentation’s slug from the filename. The pattern can also have any other optional fixed characters.

Here’s a practical example. Let's assume that you have the following files in your `path/to/apis/` directory:

```
path/to/apis
└─ private-api-users-service.json
└─ partner-api-payments-service.yml
└─ public-api-contracts-service.yml
└─ data.json
└─ README.md
```

In order to deploy the 3 services API definition files from this folder (`private-api-users-service.json`, `partner-api-payments-service.yml` and `public-api-contracts-service.yml`), you can set call the action like this:

```
[...]
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Deploy API documentation
        uses: bump-sh/github-action@v1
        with:
          hub: <BUMP_HUB_ID>
          token: ${{secrets.BUMP_TOKEN}}
          file: docs/
          filename_pattern: '*-api-{slug}-service'
```

### Deploy workflow document for your MCP server

You'll need to get the slug (or id) of your MCP Server,
accessible on bump.sh: https://bump.sh/{your-organization}/workflow/set/{mcp-server-id}/tokens

Copy the slug (we can call it BUMP_MCP_SERVER_ID_OR_SLUG) and use it with command deploy,
with link to your flower specification:

`.github/workflows/bump.yml`

```yaml
name: Deploy workflow document for your MCP server

on:
  push:
    branches:
      - main

jobs:
  deploy-workflow-document:
    name: Deploy workflow document for MCP server on Bump.sh
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Deploy workflow document
        uses: bump-sh/github-action@v1
        with:
          command: deploy
          mcp_server: <BUMP_MCP_SERVER_ID_OR_SLUG>
          token: ${{secrets.BUMP_TOKEN}}
          file: doc/flower-document.yml
```

This feature is currently in closed beta.
Request an early access at hello@bump.sh

## Inputs

* `doc` (required unless you deploy a directory on a hub): Documentation slug or id. Can be found in the documentation settings on https://bump.sh/dashboard

* `token` (required): Do not add your documentation token here, but create an [encrypted secret](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets) that holds your documentation token.

  * Your Bump.sh token can be found in the documentation settings on [your API dashboard](https://bump.sh/dashboard). Copy it for later usage.
  * In your GitHub repository, go to your “Settings”, and then “Secrets”.
  * Click the button “New repository secret”, name the secret `BUMP_TOKEN` and paste your Bump.sh token in the value field.

* `file`: Relative path to the API definition file or the API definition file folder. _Default: `api-contract.yml`_

* `hub` (optional): Hub slug or id. Needed when deploying documentation in a Hub. Can be found in the hub settings on https://bump.sh/dashboard

* `branch` (optional): Branch name used during `deploy` or `diff` commands. This can be useful to maintain multiple API reference history and make it available in your API documentation.

* `overlay` (optional): Path or URL of overlay file(s) to apply before running the `deploy` command. Follows the OpenAPI Overlay specification, and accepts multiple overlays separated by comma.

* `command`: Bump.sh command to execute. _Default: `deploy`_

  * `deploy`: deploy a new version of the documentation (or MCP Server ✨)
  * `diff`: automatically comment your pull request with the API diff
  * `dry-run`: dry-run a deployment of the documentation file
  * `preview`: create a temporary preview

* `expires` (optional): Specify a longer expiration date for **public diffs** (defaults to 1 day). Use iso8601 format to provide a date, or you can use `never` to keep the result live indefinitely.

* `fail_on_breaking` (optional): Mark the action as failed when a breaking change is detected with the diff command. This is only valid with `diff` command.

* `mcp_server` (required to deploy workflow document on MCP server): MCP Server id or slug. Can be found MCP Server settings: https://bump.sh/{your-organization}/workflow/set/{mcp-server-id}/tokens. This is only valid with the `deploy` command (default command).

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/bump-sh/github-action. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](http://contributor-covenant.org) code of conduct.

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE).

## Code of Conduct

Everyone interacting in the Bump.sh `github-action` project’s codebases, issue trackers, chat rooms and mailing lists is expected to follow the [code of conduct](https://github.com/bump-sh/github-action/blob/master/CODE_OF_CONDUCT.md).
