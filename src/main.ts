import * as core from '@actions/core';
import { RequestError as GitHubHttpError } from '@octokit/request-error';
import * as bump from 'bump-cli';
import * as diff from './diff';
import { Repo } from './github';
import { setUserAgent } from './common';

async function run(): Promise<void> {
  try {
    const file: string = core.getInput('file');
    const doc: string = core.getInput('doc');
    const hub: string = core.getInput('hub');
    const token: string = core.getInput('token');
    const command: string = core.getInput('command') || 'deploy';
    const cliParams = [file];
    let docCliParams = ['--doc', doc, '--token', token];

    if (hub) {
      docCliParams = docCliParams.concat(['--hub', hub]);
    }

    setUserAgent();
    // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
    core.debug(`Waiting for bump ${command} ...`);
    core.debug(new Date().toTimeString());

    switch (command) {
      case 'preview':
        await bump.Preview.run(cliParams);
        break;
      case 'dry-run':
      case 'validate': // DEPRECATED, kept for backward compatibility with old gem
        await bump.Deploy.run(cliParams.concat(docCliParams).concat(['--dry-run']));
        break;
      case 'deploy':
        await bump.Deploy.run(cliParams.concat(docCliParams));
        break;
      case 'diff':
        const baseFile = await new Repo().getBaseFile(file);

        if (baseFile) {
          cliParams.unshift(baseFile);
        }

        await bump.Diff.run(cliParams.concat(docCliParams)).then(
          (version: bump.VersionResponse | undefined) => {
            if (version) {
              diff.run(version).catch(handleErrors);
            }
          },
        );
        break;
    }

    core.debug(new Date().toTimeString());
  } catch (error) {
    handleErrors(error);
  }
}

function handleErrors(error: Error): void {
  let msg = error.message;

  if (error instanceof GitHubHttpError) {
    msg = [
      `[GitHub HttpError ${error.status}] ${error.message}`,
      '',
      'Please check your GitHub Action workflow file or Actions repository settings.',
      'Especially if running the action on a fork PR: https://github.blog/2020-08-03-github-actions-improvements-for-fork-and-pull-request-workflows/',
    ].join('\n');
  }

  core.setFailed(msg);
}

export default run;

run();
