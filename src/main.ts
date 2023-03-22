import * as core from '@actions/core';
import { Config } from '@oclif/config';
import { RequestError as GitHubHttpError } from '@octokit/request-error';
import path from 'path';
import * as bump from 'bump-cli';
import * as diff from './diff';
import { Repo } from './github';
import { setUserAgent, shaDigest } from './common';

async function run(): Promise<void> {
  try {
    const file1: string = core.getInput('file1', { required: true });
    const file2: string = core.getInput('file2', { required: true });
    const prNumber: number = parseInt(core.getInput('pr-number', { required: true }));
    core.debug(`File 1: ${file1}`);
    core.debug(`File 2: ${file2}`);
    core.debug(`PR Number: ${prNumber}`);
    const config = new Config({ root: path.resolve(__dirname, '../') });

    await config.load();
    setUserAgent();
    // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
    core.debug(`Waiting for bump diff...`);
    core.debug(new Date().toTimeString());
    const docDigest = shaDigest(['Tonic']);
    const repo = new Repo(docDigest, prNumber);

    await new bump.Diff(config)
      .run(
        file1,
        file2,
        undefined,
        undefined,
        undefined,
        undefined,
        'markdown',
        undefined,
      )
      .then((result: bump.DiffResponse | undefined) => {
        if (result && 'markdown' in result) {
          diff.run(result, repo).catch(handleErrors);
        } else {
          core.info('No diff found, nothing more to do.');
          repo.deleteExistingComment();
        }
      });

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
    if(error.stack){
      core.debug(error.stack);
    }
  }
  core.setFailed(msg);
}

export default run;

run();
