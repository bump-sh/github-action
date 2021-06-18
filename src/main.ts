import * as core from '@actions/core';
import * as bump from 'bump-cli';

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
        const changes: bump.ChangesResponse = await bump.Diff.run(
          cliParams.concat(docCliParams),
        );

        break;
    }

    core.debug(new Date().toTimeString());
  } catch (error) {
    core.setFailed(error.message);
  }
}

export default run;

run();
