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
  const mockSuccessCallback = jest.fn((params) => {
    expect(params).toContain('my-file.yml');
    return Promise.resolve();
  });
  mockedDeploy.run = mockSuccessCallback;

  expect(mockSuccessCallback.mock.calls.length).toBe(0);
  process.env.INPUT_FILE = 'my-file.yml';
  await main();
  expect(mockSuccessCallback.mock.calls.length).toBe(1);
});

test('test action runs with error', async () => {
  const mockErrorCallback = jest.fn(() => {
    return Promise.reject('CLI Error');
  });
  mockedDeploy.run = mockErrorCallback;

  expect(mockErrorCallback.mock.calls.length).toBe(0);
  process.env.INPUT_FILE = 'my-file.yml';
  await main();
  expect(mockErrorCallback.mock.calls.length).toBe(1);
});

test('test action run preview correctly', async () => {
  const mockSuccessCallback = jest.fn((params) => {
    expect(params).toContain('my-file-to-preview.yml');
    return Promise.resolve();
  });
  mockedPreview.run = mockSuccessCallback;

  expect(mockSuccessCallback.mock.calls.length).toBe(0);
  process.env.INPUT_FILE = 'my-file-to-preview.yml';
  process.env.INPUT_COMMAND = 'preview';
  await main();
  expect(mockSuccessCallback.mock.calls.length).toBe(1);
});
