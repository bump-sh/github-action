# Generate your API documentation

Bump is a Continuous Documentation Platform: it lets you keep your API doc always synchronized with your codebase. With this [Github Action](https://github.com/actions) you can automatically generate your API reference (with changelog and diff) on [Bump](https://bump.sh) from any [OpenAPI](https://github.com/OAI/OpenAPI-Specification) or [AsyncAPI](https://github.com/asyncapi/asyncapi) file.

## Usage

Start by creating a documentation on [Bump](https://bump.sh). Then add this workflow to your GitHub project:

```
name: Deploy documentation

on:
  push:
    branches:
      - master

jobs:
  deploy-doc:
    name: Deploy API doc on Bump
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Deploy API documentation
        uses: bump-sh/github-action@0.2
        with:
          id: <BUMP_DOC_ID>
          token: ${{secrets.BUMP_TOKEN}}
          file: doc/api-documentation.yml
```

Important: [actions/checkout](https://github.com/actions/checkout) has to be called **before this action**.


## Inputs

* `id` (required): Documentation id. Can be found in the documentation settings on https://bump.sh

* `token` (required): Do not add your documentation token here, but create an [encrypted secret](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets) that holds your documentation token. 

  * Your documentation token can be found in the documentation settings on https://bump.sh. 
  * In your GitHub repository, click Settings, and then Secrets.
  * Click the button "New repository secret" and add your bump token. In the above example, the secret is called BUMP_TOKEN).

* `file`: Relative path to the documentation file. Default: `api-contract.yml`.

* `command`: Bump command to execute.

  * `deploy` (default): deploy a new version of the documentation
  * `validate`: validate the documentation file
  * `preview`: create a temporary preview


* `validation`: Validation to apply server side. Default: `basic`.

  * `basic` (default): basic validation
  * `strict`: validate the file against its specification

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/bump-sh/github-action. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](http://contributor-covenant.org) code of conduct.

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE).

## Code of Conduct

Everyone interacting in the Bump `github-action` project’s codebases, issue trackers, chat rooms and mailing lists is expected to follow the [code of conduct](https://github.com/bump-sh/github-action/blob/master/CODE_OF_CONDUCT.md).
