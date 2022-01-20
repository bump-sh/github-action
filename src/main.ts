import * as core from '@actions/core';
import { Config } from '@oclif/config';
import { RequestError as GitHubHttpError } from '@octokit/request-error';
import path from 'path';
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
    const config = new Config({ root: path.resolve(__dirname, '../') });
    let docCliParams = ['--doc', doc, '--token', token];

    if (hub) {
      docCliParams = docCliParams.concat(['--hub', hub]);
    }

    await config.load();
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
        const repo = new Repo();
        let file1 = await repo.getBaseFile(file);
        let file2: string | undefined;

        if (file1) {
          file2 = file;
        } else {
          file1 = file;
        }

        await new bump.Diff(config)
          .run(file1, file2, doc, hub, token)
          .then((result: bump.DiffResponse | undefined) => {
            if (result && 'markdown' in result) {
              diff.run(result, repo).catch(handleErrors);
            } else {
              core.info('No diff found, nothing more to do.');
              repo.deleteExistingComment();
            }
          });
        break;
    }

    core.debug(new Date().toTimeString());
  } catch (error) {
    handleErrors(error);
  }
}

function handleErrors(error: unknown): void {
  let msg = 'Unknown error';

  if (error instanceof GitHubHttpError) {
    msg = [
      `[GitHub HttpError ${error.status}] ${error.message}`,
      '',
      'Please check your GitHub Action workflow file or Actions repository settings.',
      'Especially if running the action on a fork PR: https://github.blog/2020-08-03-github-actions-improvements-for-fork-and-pull-request-workflows/',
    ].join('\n');
  } else if (error instanceof Error) {
    msg = error.message;
  }

  core.setFailed(msg);
}

export default run;

run();
