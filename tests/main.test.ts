import { stdout } from 'stdout-stderr';
import * as process from 'process';
import { mocked } from 'ts-jest/utils';
stdout.start();

// Load main file (which will try a first executiong of the Action code)
import main from '../src/main';

// Mock internal diff code
import * as diff from '../src/diff';
jest.mock('../src/diff');
const mockedInternalDiff = diff as jest.Mocked<typeof diff>;
import { Repo } from '../src/github';
jest.mock('../src/github');
const mockedInternalRepo = mocked(Repo, true);

// Mock the Bump CLI commands
import * as bump from 'bump-cli';
jest.mock('bump-cli');
const mockedDeploy = bump.Deploy as jest.Mocked<typeof bump.Deploy>;
const mockedDiff = bump.Diff as jest.Mocked<typeof bump.Diff>;
const mockedPreview = bump.Preview as jest.Mocked<typeof bump.Preview>;
const versionWithDiffExample = {
  id: 'hello-123',
  diff_summary: 'one',
  diff_public_url: 'https://bump.sh/doc/my-doc/changes/654',
  diff_breaking: true,
};

beforeEach(() => {
  stdout.stop();
  stdout.start();
  mockedInternalRepo.prototype.getBaseFile.mockReset();
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

test('test action run dry-run correctly', async () => {
  expect(mockedDeploy.run).not.toHaveBeenCalled();

  process.env.INPUT_FILE = 'my-file.yml';
  process.env.INPUT_DOC = 'my-doc';
  process.env.INPUT_TOKEN = 'SECRET';
  process.env.INPUT_COMMAND = 'dry-run';

  await main();

  expect(mockedDeploy.run).toHaveBeenCalledWith([
    'my-file.yml',
    '--doc',
    'my-doc',
    '--token',
    'SECRET',
    '--dry-run',
  ]);
});

test('test action run diff correctly', async () => {
  mockedDiff.run.mockResolvedValue(versionWithDiffExample);
  expect(mockedDiff.run).not.toHaveBeenCalled();
  expect(mockedInternalDiff.run).not.toHaveBeenCalled();
  expect(mockedInternalRepo).not.toHaveBeenCalled();

  process.env.INPUT_FILE = 'my-file-to-diff.yml';
  process.env.INPUT_COMMAND = 'diff';
  await main();

  expect(mockedInternalRepo.prototype.getBaseFile).toHaveBeenCalledWith(
    process.env.INPUT_FILE,
  );

  expect(mockedDiff.run).toHaveBeenCalledWith([
    'my-file-to-diff.yml',
    '--doc',
    'my-doc',
    '--token',
    'SECRET',
  ]);
  expect(mockedInternalDiff.run).toHaveBeenCalledWith(versionWithDiffExample);
});

test('test action run diff on PR correctly', async () => {
  mockedDiff.run.mockResolvedValue(versionWithDiffExample);
  expect(mockedDiff.run).not.toHaveBeenCalled();
  expect(mockedInternalDiff.run).not.toHaveBeenCalled();
  mockedInternalRepo.prototype.getBaseFile.mockResolvedValue('my-base-file-to-diff.yml');

  process.env.INPUT_FILE = 'my-file-to-diff.yml';
  process.env.INPUT_COMMAND = 'diff';
  await main();

  expect(mockedDiff.run).toHaveBeenCalledWith([
    'my-base-file-to-diff.yml',
    'my-file-to-diff.yml',
    '--doc',
    'my-doc',
    '--token',
    'SECRET',
  ]);
  expect(mockedInternalDiff.run).toHaveBeenCalledWith(versionWithDiffExample);
});

test('test action run diff with internal exception', async () => {
  mockedDiff.run.mockResolvedValue(versionWithDiffExample);
  expect(mockedDiff.run).not.toHaveBeenCalled();
  mockedInternalDiff.run.mockRejectedValue(new Error('Boom'));
  expect(mockedInternalDiff.run).not.toHaveBeenCalled();

  process.env.INPUT_FILE = 'my-file-to-diff.yml';
  process.env.INPUT_COMMAND = 'diff';
  await main();

  expect(mockedDiff.run).toHaveBeenCalledWith([
    'my-file-to-diff.yml',
    '--doc',
    'my-doc',
    '--token',
    'SECRET',
  ]);
  expect(mockedInternalDiff.run).toHaveBeenCalledWith(versionWithDiffExample);
});
