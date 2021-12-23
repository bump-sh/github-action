import * as github from '@actions/github';
import * as exec from '@actions/exec';
jest.mock('@actions/exec');
const mockedExec = jest.mocked(exec, true);

// Shallow clone original @actions/github context
const originalContext = { ...github.context };
const originalGhToken = process.env['GITHUB_TOKEN'];

import * as common from '../src/common';
jest.mock('../src/common');
const mockedCommon = common as jest.Mocked<typeof common>;

import fixtureGithubContext from './fixtures/github-context.json';
import { Repo } from '../src/github';

beforeEach(() => {
  // Mock token env variable
  process.env['GITHUB_TOKEN'] = 'gh-12abc';

  // Mock the @actions/github context.
  Object.defineProperty(github, 'context', {
    value: fixtureGithubContext,
  });

  mockedExec.exec.mockReset();
});

afterEach(() => {
  // Restore original @actions/github context
  Object.defineProperty(github, 'context', {
    value: originalContext,
  });
  // Restore any original GITHUB_TOKEN env var
  process.env['GITHUB_TOKEN'] = originalGhToken;
});

test('getBasefile function', async () => {
  // As we don't do any git operations in tests, we mock the resulting file
  mockedCommon.fsExists.mockResolvedValue(true);

  const repo = new Repo();
  const headFile = 'openapi.yml';
  const baseFile = await repo.getBaseFile('openapi.yml');
  const baseSha = fixtureGithubContext.payload.pull_request.base.sha;
  const headSha = fixtureGithubContext.payload.pull_request.head.sha;
  const baseBranch = '';

  // Expect git executions
  expect(mockedExec.exec.mock.calls).toEqual([
    ['git', ['fetch', 'origin', baseSha, headSha]],
    ['git', ['merge-base', baseSha, headSha], { listeners: expect.anything() }],
    ['git', ['--work-tree', 'tmp/', 'restore', '-s', baseBranch, '.']],
    ['git', ['restore', '-s', headSha, '.']],
  ]);
  expect(baseFile).toBe(`tmp/${headFile}`);
});
