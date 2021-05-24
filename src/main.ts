import * as core from '@actions/core';
import BumpPreview from 'bump-cli/lib/commands/preview';
import BumpDeploy from 'bump-cli/lib/commands/deploy';

async function run(): Promise<void> {
  try {
    const file: string = core.getInput('file');
    const doc: string = core.getInput('doc');
    const hub: string = core.getInput('hub');
    const token: string = core.getInput('token');
    const command: string = core.getInput('command') || 'deploy';
    const cliParams = [file];
    let deployCliParams = ['--doc', doc, '--token', token];

    if (hub) {
      deployCliParams = deployCliParams.concat(['--hub', hub]);
    }

    // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
    core.debug(`Waiting for bump ${command} ...`);
    core.debug(new Date().toTimeString());

    switch (command) {
      case 'preview':
        await BumpPreview.run(cliParams);
        break;
      case 'validate':
        await BumpDeploy.run(cliParams.concat(deployCliParams).concat(['--dry-run']));
        break;
      case 'deploy':
        await BumpDeploy.run(cliParams.concat(deployCliParams));
        break;
    }

    core.debug(new Date().toTimeString());
  } catch (error) {
    core.setFailed(error.message);
  }
}

export default run;

run();
