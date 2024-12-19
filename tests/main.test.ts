import { stdout } from 'stdout-stderr';
import * as process from 'process';
import { jest } from '@jest/globals';

stdout.start();

// Mock internal diff code
import * as diff from '../src/diff.js';
jest.mock('../src/diff');
const mockedInternalDiff = diff as jest.Mocked<typeof diff>;
import { Repo } from '../src/github.js';
jest.mock('../src/github');
const mockedInternalRepo = jest.mocked(Repo);

// Mock the Bump CLI commands
import * as bump from 'bump-cli';
jest.mock('bump-cli');
const mockedDeploy = bump.Deploy as jest.Mocked<typeof bump.Deploy>;
const mockedPreview = bump.Preview as jest.Mocked<typeof bump.Preview>;
const mockedDiff = jest.mocked(bump.Diff.Diff);

import * as core from '@actions/core';

const diffExample: bump.DiffResponse = {
  id: 'hello-123',
  markdown: 'one',
  public_url: 'https://bump.sh/doc/my-doc/changes/654',
  breaking: true,
};

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { run } = await import('../src/main.js');

describe('main.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    stdout.stop();
    stdout.start();
    // mockedInternalRepo.prototype.getBaseFile.mockReset();
  });

  afterEach(() => {
    stdout.stop();
    jest.restoreAllMocks();
  });

  test('test action run deploy correctly', async () => {
    expect(mockedDeploy.run).not.toHaveBeenCalled();

    jest.replaceProperty(process, 'env', {
      INPUT_FILE: 'my-file.yml',
      INPUT_DOC: 'my-doc',
      INPUT_TOKEN: 'SECRET',
    });

    await run();

    expect(mockedDeploy.run).toHaveBeenCalledWith([
      'my-file.yml',
      '--token',
      'SECRET',
      '--doc',
      'my-doc',
    ]);
  });

  test('test action run deploy entire directory in hub correctly', async () => {
    expect(mockedDeploy.run).not.toHaveBeenCalled();

    jest.replaceProperty(process, 'env', {
      INPUT_FILE: 'my-file.yml',
      INPUT_HUB: 'my-hub',
      INPUT_TOKEN: 'SECRET',
    });

    await run();

    expect(mockedDeploy.run).toHaveBeenCalledWith([
      'my-file.yml',
      '--token',
      'SECRET',
      '--auto-create',
      '--hub',
      'my-hub',
    ]);
  });

  test('test action run deploy a specific doc inside a hub correctly', async () => {
    expect(mockedDeploy.run).not.toHaveBeenCalled();

    jest.replaceProperty(process, 'env', {
      INPUT_FILE: 'my-file.yml',
      INPUT_DOC: 'my-doc',
      INPUT_HUB: 'my-hub',
      INPUT_TOKEN: 'SECRET',
    });

    await run();

    expect(mockedDeploy.run).toHaveBeenCalledWith([
      'my-file.yml',
      '--token',
      'SECRET',
      '--doc',
      'my-doc',
      '--hub',
      'my-hub',
    ]);
  });

  test('test action run deploy with branch name correctly', async () => {
    expect(mockedDeploy.run).not.toHaveBeenCalled();

    jest.replaceProperty(process, 'env', {
      INPUT_FILE: 'my-file.yml',
      INPUT_DOC: 'my-doc',
      INPUT_TOKEN: 'SECRET',
      INPUT_BRANCH: 'latest',
    });

    await run();

    expect(mockedDeploy.run).toHaveBeenCalledWith([
      'my-file.yml',
      '--token',
      'SECRET',
      '--doc',
      'my-doc',
      '--branch',
      'latest',
    ]);
  });

  test('test action run preview correctly', async () => {
    expect(mockedPreview.run).not.toHaveBeenCalled();

    jest.replaceProperty(process, 'env', {
      INPUT_FILE: 'my-file-to-preview.yml',
      INPUT_COMMAND: 'preview',
    });

    await run();

    expect(mockedPreview.run).toHaveBeenCalledWith(['my-file-to-preview.yml']);
  });

  test('test action run dry-run correctly', async () => {
    expect(mockedDeploy.run).not.toHaveBeenCalled();

    jest.replaceProperty(process, 'env', {
      INPUT_FILE: 'my-file.yml',
      INPUT_DOC: 'my-doc',
      INPUT_TOKEN: 'SECRET',
      INPUT_COMMAND: 'dry-run',
    });

    await run();

    expect(mockedDeploy.run).toHaveBeenCalledWith([
      'my-file.yml',
      '--token',
      'SECRET',
      '--doc',
      'my-doc',
      '--dry-run',
    ]);
  });

  test('test action run diff correctly', async () => {
    mockedDiff.prototype.run.mockResolvedValue(diffExample);
    expect(mockedDiff.prototype.run).not.toHaveBeenCalled();
    expect(mockedInternalDiff.run).not.toHaveBeenCalled();
    expect(mockedInternalRepo).not.toHaveBeenCalled();

    jest.replaceProperty(process, 'env', {
      INPUT_FILE: 'my-file-to-diff.yml',
      INPUT_COMMAND: 'diff',
    });
    const emptyDocDigest = 'da39a3ee5e6b4b0d3255bfef95601890afd80709';

    await run();

    expect(mockedInternalRepo).toHaveBeenCalledWith(emptyDocDigest);
    expect(mockedInternalRepo.prototype.getBaseFile).toHaveBeenCalledWith(
      process.env.INPUT_FILE,
    );

    expect(mockedDiff.prototype.run).toHaveBeenCalledWith(
      'my-file-to-diff.yml',
      undefined,
      '',
      '',
      '',
      '',
      'markdown',
      '',
    );
    expect(mockedInternalDiff.run).toHaveBeenCalledWith(diffExample, expect.any(Repo));
  });

  test('test action run diff on existing documentation correctly', async () => {
    mockedDiff.prototype.run.mockResolvedValue(diffExample);
    expect(mockedDiff.prototype.run).not.toHaveBeenCalled();
    expect(mockedInternalDiff.run).not.toHaveBeenCalled();
    expect(mockedInternalRepo).not.toHaveBeenCalled();

    jest.replaceProperty(process, 'env', {
      INPUT_FILE: 'my-file-to-diff.yml',
      INPUT_DOC: 'my-doc',
      INPUT_COMMAND: 'diff',
    });
    const docDigest = '398b995591d7e5f6676e44f06be071abe850b38e';

    await run();

    expect(mockedInternalRepo).toHaveBeenCalledWith(docDigest);
    expect(mockedInternalRepo.prototype.getBaseFile).toHaveBeenCalledWith(
      process.env.INPUT_FILE,
    );

    expect(mockedDiff.prototype.run).toHaveBeenCalledWith(
      'my-file-to-diff.yml',
      undefined,
      'my-doc',
      '',
      '',
      '',
      'markdown',
      '',
    );
    expect(mockedInternalDiff.run).toHaveBeenCalledWith(diffExample, expect.any(Repo));
  });

  test('test action run diff with Branch correctly', async () => {
    mockedDiff.prototype.run.mockResolvedValue(diffExample);
    expect(mockedDiff.prototype.run).not.toHaveBeenCalled();
    expect(mockedInternalDiff.run).not.toHaveBeenCalled();
    expect(mockedInternalRepo).not.toHaveBeenCalled();

    jest.replaceProperty(process, 'env', {
      INPUT_FILE: 'my-file-to-diff.yml',
      INPUT_COMMAND: 'diff',
      INPUT_BRANCH: 'latest',
    });

    await run();

    expect(mockedInternalRepo.prototype.getBaseFile).toHaveBeenCalledWith(
      process.env.INPUT_FILE,
    );

    expect(mockedDiff.prototype.run).toHaveBeenCalledWith(
      'my-file-to-diff.yml',
      undefined,
      '',
      '',
      'latest',
      '',
      'markdown',
      '',
    );
    expect(mockedInternalDiff.run).toHaveBeenCalledWith(diffExample, expect.any(Repo));
  });

  test('test action run diff on PR correctly', async () => {
    mockedDiff.prototype.run.mockResolvedValue(diffExample);
    expect(mockedDiff.prototype.run).not.toHaveBeenCalled();
    expect(mockedInternalDiff.run).not.toHaveBeenCalled();
    mockedInternalRepo.prototype.getBaseFile.mockResolvedValue(
      'my-base-file-to-diff.yml',
    );

    jest.replaceProperty(process, 'env', {
      INPUT_FILE: 'my-file-to-diff.yml',
      INPUT_COMMAND: 'diff',
    });

    await run();

    expect(mockedDiff.prototype.run).toHaveBeenCalledWith(
      'my-base-file-to-diff.yml',
      'my-file-to-diff.yml',
      '',
      '',
      '',
      '',
      'markdown',
      '',
    );
    expect(mockedInternalDiff.run).toHaveBeenCalledWith(diffExample, expect.any(Repo));
  });

  test('test action run with breaking change diff', async () => {
    const spyError = jest.spyOn(core, 'setFailed');

    mockedDiff.prototype.run.mockResolvedValue(diffExample);
    expect(mockedDiff.prototype.run).not.toHaveBeenCalled();
    expect(mockedInternalDiff.run).not.toHaveBeenCalled();
    mockedInternalDiff.run.mockResolvedValue();
    mockedInternalRepo.prototype.getBaseFile.mockResolvedValue(
      'my-base-file-to-diff.yml',
    );

    jest.replaceProperty(process, 'env', {
      INPUT_FILE: 'my-file-to-diff.yml',
      INPUT_COMMAND: 'diff',
      INPUT_FAIL_ON_BREAKING: 'true',
    });

    await run();

    expect(spyError).toHaveBeenCalledWith(
      expect.stringMatching(
        'Failing due to a breaking change detected in your API diff.',
      ),
    );

    expect(mockedDiff.prototype.run).toHaveBeenCalledWith(
      'my-base-file-to-diff.yml',
      'my-file-to-diff.yml',
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      'markdown',
      expect.anything(),
    );
    expect(mockedInternalDiff.run).toHaveBeenCalledWith(diffExample, expect.any(Repo));
  });

  test('test action run diff with internal exception', async () => {
    const spyError = jest.spyOn(core, 'setFailed');

    mockedDiff.prototype.run.mockResolvedValue(diffExample);
    expect(mockedDiff.prototype.run).not.toHaveBeenCalled();
    mockedInternalDiff.run.mockRejectedValue(new Error('Boom'));
    expect(mockedInternalDiff.run).not.toHaveBeenCalled();

    jest.replaceProperty(process, 'env', {
      INPUT_FILE: 'my-file-to-diff.yml',
      INPUT_COMMAND: 'diff',
    });

    await run();

    expect(spyError).toHaveBeenCalledWith('Boom');

    expect(mockedDiff.prototype.run).toHaveBeenCalledWith(
      'my-file-to-diff.yml',
      undefined,
      '',
      '',
      '',
      '',
      'markdown',
      '',
    );
    expect(mockedInternalDiff.run).toHaveBeenCalledWith(diffExample, expect.any(Repo));
  });

  test('test action run diff with no change', async () => {
    const spyInfo = jest.spyOn(core, 'info');

    mockedDiff.prototype.run.mockResolvedValue(undefined);
    expect(mockedDiff.prototype.run).not.toHaveBeenCalled();
    expect(mockedInternalDiff.run).not.toHaveBeenCalled();
    mockedInternalRepo.prototype.getBaseFile.mockResolvedValue(
      'my-base-file-to-diff.yml',
    );

    jest.replaceProperty(process, 'env', {
      INPUT_FILE: 'my-file-to-diff.yml',
      INPUT_COMMAND: 'diff',
      INPUT_FAIL_ON_BREAKING: 'true',
    });

    await run();

    expect(spyInfo).toHaveBeenCalledWith(
      expect.stringMatching('No changes detected, nothing more to do.'),
    );

    expect(mockedDiff.prototype.run).toHaveBeenCalledWith(
      'my-base-file-to-diff.yml',
      'my-file-to-diff.yml',
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      'markdown',
      expect.anything(),
    );
    expect(mockedInternalDiff.run).not.toHaveBeenCalled();
  });
});
