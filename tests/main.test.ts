import { stdout } from 'stdout-stderr';
import { jest } from '@jest/globals';
import * as core from './fixtures/core.js';
import * as github from './fixtures/github.js';
import * as repo from './fixtures/repo.js';
import * as bump from './fixtures/bump-cli.js';
import nock from 'nock';

// Disable any HTTP requests
nock.disableNetConnect();
// Mock stdout/stderr
stdout.start();

import type { DiffResponse } from 'bump-cli';

// Mock the Bump CLI commands
jest.unstable_mockModule('bump-cli', () => bump);
jest.unstable_mockModule('@actions/core', () => core);
jest.unstable_mockModule('@actions/github', () => github);
jest.unstable_mockModule('../src/github.js', () => repo);

const originalGhToken = process.env['GITHUB_TOKEN'];
const diffExample: DiffResponse = {
  id: 'hello-123',
  markdown: 'one',
  public_url: 'https://bump.sh/doc/my-doc/changes/654',
  breaking: true,
};

// The module being tested should be imported dynamically. This
// ensures that the mocks are used in place of any actual
// dependencies.
const { run } = await import('../src/main.js');
// Mock the action's inputs as return values from core.getInput().
const mockInputs = (inputs: { [index: string]: string | undefined }) => {
  core.getInput.mockClear().mockImplementation((input: string) => {
    return inputs[input] || '';
  });
};

describe('main.ts', () => {
  beforeEach(() => {
    // Mock token env variable
    process.env['GITHUB_TOKEN'] = 'gh-12abc';

    stdout.stop();
    stdout.start();
    repo.mockGetBaseFile.mockReset();
  });

  afterEach(() => {
    process.env['GITHUB_TOKEN'] = originalGhToken;
    stdout.stop();
    jest.clearAllMocks();
  });

  describe('deploy command', () => {
    it('test action run deploy entire directory in hub correctly', async () => {
      mockInputs({ file: 'my-file.yml', doc: undefined, hub: 'my-hub', token: 'SECRET' });

      await run();

      expect(bump.Deploy.run).toHaveBeenCalledWith(
        ['my-file.yml', '--token', 'SECRET', '--auto-create', '--hub', 'my-hub'],
        '.',
      );
    });

    it('test action run deploy entire directory in hub with custom filename pattern correctly', async () => {
      mockInputs({
        file: 'my-file.yml',
        doc: undefined,
        hub: 'my-hub',
        token: 'SECRET',
        filename_pattern: 'source-{slug}-*',
      });

      await run();

      expect(bump.Deploy.run).toHaveBeenCalledWith(
        [
          'my-file.yml',
          '--token',
          'SECRET',
          '--auto-create',
          '--hub',
          'my-hub',
          '--filename-pattern',
          'source-{slug}-*',
        ],
        '.',
      );
    });

    it('test action run deploy correctly', async () => {
      // Set the action's inputs as return values from core.getInput().
      mockInputs({ file: 'my-file.yml', doc: 'my-doc', token: 'SECRET' });

      await run();

      expect(bump.Deploy.run).toHaveBeenCalledWith(
        ['my-file.yml', '--token', 'SECRET', '--doc', 'my-doc'],
        '.',
      );
    });

    it('test action run deploy a specific doc inside a hub correctly', async () => {
      mockInputs({ file: 'my-file.yml', doc: 'my-doc', hub: 'my-hub', token: 'SECRET' });

      await run();

      expect(bump.Deploy.run).toHaveBeenCalledWith(
        [
          'my-file.yml',
          '--token',
          'SECRET',
          '--doc',
          'my-doc',
          '--auto-create',
          '--hub',
          'my-hub',
        ],
        '.',
      );
    });

    it('test action run deploy with branch name correctly', async () => {
      mockInputs({
        file: 'my-file.yml',
        doc: 'my-doc',
        branch: 'latest',
        token: 'SECRET',
      });

      await run();

      expect(bump.Deploy.run).toHaveBeenCalledWith(
        ['my-file.yml', '--token', 'SECRET', '--doc', 'my-doc', '--branch', 'latest'],
        '.',
      );
    });

    it('test action run dry-run correctly', async () => {
      expect(bump.Deploy.run).not.toHaveBeenCalled();

      mockInputs({
        file: 'my-file.yml',
        doc: 'my-doc',
        token: 'SECRET',
        command: 'dry-run',
      });

      await run();

      expect(bump.Deploy.run).toHaveBeenCalledWith(
        ['my-file.yml', '--token', 'SECRET', '--doc', 'my-doc', '--dry-run'],
        '.',
      );
      expect(core.setFailed).not.toHaveBeenCalled();
    });

    it('passes a single overlay correctly', async () => {
      expect(bump.Deploy.run).not.toHaveBeenCalled();

      mockInputs({
        file: 'my-file.yml',
        doc: 'my-doc',
        token: 'SECRET',
        overlay: 'overlay1.yml',
      });

      await run();

      expect(bump.Deploy.run).toHaveBeenCalledWith(
        [
          'my-file.yml',
          '--token',
          'SECRET',
          '--doc',
          'my-doc',
          '--overlay',
          'overlay1.yml',
        ],
        '.',
      );
      expect(core.setFailed).not.toHaveBeenCalled();
    });

    it('passes a single overlay with URL correctly', async () => {
      expect(bump.Deploy.run).not.toHaveBeenCalled();

      mockInputs({
        file: 'my-file.yml',
        doc: 'my-doc',
        token: 'SECRET',
        overlay:
          'https://spec.speakeasy.com/protectearth/protectearth/train-travel-api-typescript-code-samples',
      });

      await run();

      expect(bump.Deploy.run).toHaveBeenCalledWith(
        [
          'my-file.yml',
          '--token',
          'SECRET',
          '--doc',
          'my-doc',
          '--overlay',
          'https://spec.speakeasy.com/protectearth/protectearth/train-travel-api-typescript-code-samples',
        ],
        '.',
      );
      expect(core.setFailed).not.toHaveBeenCalled();
    });

    it('passes multiple overlays correctly', async () => {
      expect(bump.Deploy.run).not.toHaveBeenCalled();

      mockInputs({
        file: 'my-file.yml',
        doc: 'my-doc',
        token: 'SECRET',
        overlay: 'overlay1.yml,overlay2.yml',
      });

      await run();

      expect(bump.Deploy.run).toHaveBeenCalledWith(
        [
          'my-file.yml',
          '--token',
          'SECRET',
          '--doc',
          'my-doc',
          '--overlay',
          'overlay1.yml',
          '--overlay',
          'overlay2.yml',
        ],
        '.',
      );
      expect(core.setFailed).not.toHaveBeenCalled();
    });
  });

  describe('preview command', () => {
    it('test action run preview correctly', async () => {
      mockInputs({ file: 'my-file-to-preview.yml', command: 'preview' });

      await run();

      expect(bump.Preview.run).toHaveBeenCalledWith(['my-file-to-preview.yml'], '.');
    });
  });

  describe('diff command', () => {
    it('test action run diff correctly', async () => {
      const file = 'my-file-to-diff.yml';
      const commentDigest = '1ab9a6fb70e07d910650e1895e9fc53570f99011';
      mockInputs({ file, command: 'diff', doc: 'my-doc' });
      // Mock return value from bump-cli core diff lib
      bump.mockRunDiff.mockResolvedValue(diffExample);

      await run();

      expect(repo.Repo).toHaveBeenCalledWith('my-doc', '', '');
      expect(repo.mockGetBaseFile).toHaveBeenCalledWith(file);
      expect(repo.mockCreateOrUpdateComment).toHaveBeenCalledWith(
        `🚨 Breaking API change detected:

one

[Preview documentation](https://bump.sh/doc/my-doc/changes/654)

> _Powered by [Bump.sh](https://bump.sh)_
<!-- Bump.sh digest=${commentDigest} doc=undefined -->`,
        commentDigest,
      );

      expect(bump.mockRunDiff).toHaveBeenCalledWith(
        'my-file-to-diff.yml',
        undefined,
        'my-doc',
        '',
        '',
        '',
        'markdown',
        '',
        [],
      );
    });

    it('test action run diff on existing documentation correctly', async () => {
      const file = 'my-file-to-diff.yml';
      const commentDigest = '1ab9a6fb70e07d910650e1895e9fc53570f99011';
      mockInputs({ file, doc: 'my-doc', command: 'diff' });
      // Mock return value from bump-cli core diff lib
      bump.mockRunDiff.mockResolvedValue(diffExample);

      await run();

      expect(repo.Repo).toHaveBeenCalledWith('my-doc', '', '');
      expect(repo.mockGetBaseFile).toHaveBeenCalledWith(file);
      expect(repo.mockCreateOrUpdateComment).toHaveBeenCalledWith(
        `🚨 Breaking API change detected:

one

[Preview documentation](https://bump.sh/doc/my-doc/changes/654)

> _Powered by [Bump.sh](https://bump.sh)_
<!-- Bump.sh digest=${commentDigest} doc=undefined -->`,
        commentDigest,
      );

      expect(bump.mockRunDiff).toHaveBeenCalledWith(
        'my-file-to-diff.yml',
        undefined,
        'my-doc',
        '',
        '',
        '',
        'markdown',
        '',
        [],
      );
    });

    it('test action run diff with Branch correctly', async () => {
      const file = 'my-file-to-diff.yml';
      const commentDigest = '1ab9a6fb70e07d910650e1895e9fc53570f99011';
      mockInputs({ file, branch: 'latest', command: 'diff' });

      await run();

      expect(repo.Repo).toHaveBeenCalledWith('', '', 'latest');
      expect(repo.mockGetBaseFile).toHaveBeenCalledWith(file);
      expect(repo.mockCreateOrUpdateComment).toHaveBeenCalledWith(
        `🚨 Breaking API change detected:

one

[Preview documentation](https://bump.sh/doc/my-doc/changes/654)

> _Powered by [Bump.sh](https://bump.sh)_
<!-- Bump.sh digest=${commentDigest} doc=undefined -->`,
        commentDigest,
      );

      expect(bump.mockRunDiff).toHaveBeenCalledWith(
        'my-file-to-diff.yml',
        undefined,
        '',
        '',
        'latest',
        '',
        'markdown',
        '',
        [],
      );
    });

    it('test action run diff on PR correctly', async () => {
      const file = 'my-file-to-diff.yml';
      const commentDigest = '1ab9a6fb70e07d910650e1895e9fc53570f99011';
      mockInputs({ file, command: 'diff' });
      // Mock base file from PR
      repo.mockGetBaseFile.mockResolvedValue('my-base-file-to-diff.yml');

      await run();

      expect(repo.Repo).toHaveBeenCalledWith('', '', '');
      expect(repo.mockCreateOrUpdateComment).toHaveBeenCalledWith(
        `🚨 Breaking API change detected:

one

[Preview documentation](https://bump.sh/doc/my-doc/changes/654)

> _Powered by [Bump.sh](https://bump.sh)_
<!-- Bump.sh digest=${commentDigest} doc=undefined -->`,
        commentDigest,
      );

      expect(bump.mockRunDiff).toHaveBeenCalledWith(
        'my-base-file-to-diff.yml',
        'my-file-to-diff.yml',
        '',
        '',
        '',
        '',
        'markdown',
        '',
        [],
      );
    });

    it('test action run with breaking change diff', async () => {
      const file = 'my-file-to-diff.yml';
      mockInputs({ file, command: 'diff', fail_on_breaking: 'true' });
      // Mock base file from PR
      repo.mockGetBaseFile.mockResolvedValue('my-base-file-to-diff.yml');

      await run();

      expect(core.setFailed).toHaveBeenCalledWith(
        expect.stringMatching(
          'Failing due to a breaking change detected in your API diff.',
        ),
      );

      expect(bump.mockRunDiff).toHaveBeenCalledWith(
        'my-base-file-to-diff.yml',
        'my-file-to-diff.yml',
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        'markdown',
        expect.anything(),
        [],
      );
    });

    it('test action run with overlays', async () => {
      const file = 'my-file-to-diff.yml';
      mockInputs({
        file,
        command: 'diff',
        fail_on_breaking: 'true',
        overlay: 'overlay1.yml,overlay2.yml',
      });
      // Mock base file from PR
      repo.mockGetBaseFile.mockResolvedValue('my-base-file-to-diff.yml');

      await run();

      expect(bump.mockRunDiff).toHaveBeenCalledWith(
        'my-base-file-to-diff.yml',
        'my-file-to-diff.yml',
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        'markdown',
        expect.anything(),
        ['overlay1.yml', 'overlay2.yml'],
      );
    });

    it('test action run diff with internal exception', async () => {
      const file = 'my-file-to-diff.yml';
      mockInputs({ file, command: 'diff' });
      repo.mockCreateOrUpdateComment.mockRejectedValue(new Error('Boom'));

      jest.replaceProperty(process, 'env', {
        INPUT_FILE: 'my-file-to-diff.yml',
        INPUT_COMMAND: 'diff',
      });

      await run();

      expect(core.setFailed).toHaveBeenCalledWith('Boom');
    });

    it('test action run diff with no change', async () => {
      const file = 'my-file-to-diff.yml';
      mockInputs({ file, command: 'diff' });
      // Mock empty result from bump-cli diff
      bump.mockRunDiff.mockResolvedValue(undefined);

      await run();

      expect(core.info).toHaveBeenCalledWith(
        expect.stringMatching('No changes detected, nothing more to do.'),
      );
      expect(repo.mockDeleteExistingComment).toHaveBeenCalled();
      expect(bump.mockRunDiff).toHaveBeenCalledWith(
        file,
        undefined,
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        'markdown',
        expect.anything(),
        [],
      );
    });
  });
});
