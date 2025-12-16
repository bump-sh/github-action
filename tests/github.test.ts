import { stdout } from 'stdout-stderr';
import * as github from './fixtures/github.js';
import * as exec from './fixtures/exec.js';
import * as common from './fixtures/common.js';
import { jest } from '@jest/globals';
import fixtureGithubContext from './fixtures/github-context.json';
import nock from 'nock';
import { shaDigest } from '../src/common.js';

nock.disableNetConnect();
stdout.start();

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/github', () => github);
jest.unstable_mockModule('@actions/exec', () => exec);
jest.unstable_mockModule('../src/common.js', () => common);

const originalGhToken = process.env['GITHUB_TOKEN'];

const { Repo } = await import('../src/github.js');

describe('github.ts', () => {
  beforeEach(() => {
    // Mock token env variable
    process.env['GITHUB_TOKEN'] = 'gh-12abc';

    stdout.stop();
    stdout.start();

    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env['GITHUB_TOKEN'] = originalGhToken;

    stdout.stop();

    jest.restoreAllMocks();
  });

  describe('getBasefile function', () => {
    test('Executes git operations on the current repo', async () => {
      // As we don't do any git operations in tests, we mock the resulting file
      common.fsExists.mockResolvedValue(true);

      const repo = new Repo('hello');
      const docDigest = shaDigest(['hello']);
      const headFile = 'openapi.yml';
      const baseFile = await repo.getBaseFile('openapi.yml');
      const baseSha = fixtureGithubContext.payload.pull_request.base.sha;
      const headSha = fixtureGithubContext.payload.pull_request.head.sha;
      const baseBranch = '';

      expect(repo.docDigest).toEqual(docDigest);
      // Expect git executions
      expect(exec.exec.mock.calls).toEqual([
        ['git', ['fetch', 'origin', baseSha, headSha]],
        ['git', ['merge-base', baseSha, headSha], { listeners: expect.anything() }],
        ['git', ['--work-tree', 'tmp/', 'restore', '-s', baseBranch, '.']],
        ['git', ['restore', '-s', headSha, '.']],
      ]);
      expect(baseFile).toBe(`tmp/${headFile}`);
    });
  });

  describe('createOrUpdateComment function', () => {
    // Mock GitHub API
    const nockScope = nock('https://api.github.com');

    const mockGithubComments = (comments: { id: number; body: string }[]) => {
      nockScope
        .get('/repos/bump-sh/github-action/issues/123/comments')
        .reply(200, comments);
    };

    const mockGithubCommentCreation = (body: string) => {
      nockScope
        .post(
          '/repos/bump-sh/github-action/issues/123/comments',
          (req) => req.body === body,
        )
        .reply(201, { id: 1, body });
    };

    const mockGithubCommentUpdate = (commentId: number, body: string) => {
      nockScope
        .patch(
          `/repos/bump-sh/github-action/issues/comments/${commentId}`,
          (req) => req.body === body,
        )
        .reply(200, { id: 1, body });
    };

    describe("When comment doesn't exist", () => {
      test('Calls octokit to create an issue comment', async () => {
        const body = 'coucou';
        mockGithubComments([]);
        mockGithubCommentCreation(body);

        const repo = new Repo('hello');
        await repo.createOrUpdateComment(body, 'my-digest');

        nockScope.done();
      });
    });

    describe('When comment with same digest already exists', () => {
      test('Calls octokit to update the issue comment', async () => {
        const digest = 'existing-comment';
        const doc = 'hello';
        const docDigest = shaDigest(['hello']);
        const body = `coucou\n<!-- Bump.sh digest=${digest} doc=${docDigest} -->`;
        const newBody = `New coucou\n<!-- Bump.sh digest=new-coucou doc=${docDigest} -->`;

        mockGithubComments([{ id: 1, body }]);
        mockGithubCommentUpdate(1, newBody);

        const repo = new Repo(doc);
        await repo.createOrUpdateComment(newBody, 'new-coucou');

        nockScope.done();
      });
    });
  });

  describe('constructor with empty GITHUB_TOKEN', () => {
    beforeEach(() => {
      // Mock empty token env variable
      process.env['GITHUB_TOKEN'] = '';
    });

    test('throws an error', async () => {
      const buildRepo = () => new Repo('hello');

      expect(buildRepo).toThrow(Error);
      expect(buildRepo).toThrow('No GITHUB_TOKEN env variable available');
    });
  });

  describe('constructor', () => {
    test('instanciate a github API client and a doc digest', async () => {
      const repo = new Repo('hello', 'my-hub', 'my-branch');
      const docDigest = shaDigest(['hello', 'my-hub', 'my-branch']);

      expect(repo.docDigest).toEqual(docDigest);
      expect(repo.octokit).toBeDefined();
    });
  });
});
