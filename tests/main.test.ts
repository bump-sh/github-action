import { stdout } from 'stdout-stderr';
import * as process from 'process';
stdout.start();

// Load main file (which will try a first executiong of the Action code)
import main from '../src/main';

// Mock the Bump CLI commands
jest.mock('bump-cli/lib/commands/deploy');
jest.mock('bump-cli/lib/commands/preview');

import BumpDeploy from 'bump-cli/lib/commands/deploy';
import BumpPreview from 'bump-cli/lib/commands/preview';
const mockedDeploy = BumpDeploy as jest.Mocked<typeof BumpDeploy>;
const mockedPreview = BumpPreview as jest.Mocked<typeof BumpPreview>;

beforeEach(() => {
  stdout.stop();
  stdout.start();
});
afterEach(() => stdout.stop());

test('test action run deploy correctly', async () => {
  expect(mockedDeploy.run).not.toHaveBeenCalled();

  process.env.INPUT_FILE = 'my-file.yml';
  process.env.INPUT_DOC = 'my-doc';
  process.env.INPUT_TOKEN = 'SECRET';
  await main();

  expect(mockedDeploy.run).toHaveBeenCalledWith([
    'my-file.yml',
    '--doc',
    'my-doc',
    '--token',
    'SECRET',
  ]);
});

test('test action run preview correctly', async () => {
  expect(mockedPreview.run).not.toHaveBeenCalled();

  process.env.INPUT_FILE = 'my-file-to-preview.yml';
  process.env.INPUT_COMMAND = 'preview';
  await main();

  expect(mockedPreview.run).toHaveBeenCalledWith(['my-file-to-preview.yml']);
});
