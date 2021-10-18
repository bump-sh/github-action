import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as github from '@actions/github';
import * as io from '@actions/io';
import { GetResponseDataTypeFromEndpointMethod } from '@octokit/types';
import { GitHub } from '@actions/github/lib/utils';
import { extractBumpComment } from './common';

// These are types which are not exposed directly by Github libs
// which we need to define
type Octokit = InstanceType<typeof GitHub>;
const anyOctokit = github.getOctokit('any');
type GitHubComment = GetResponseDataTypeFromEndpointMethod<
  typeof anyOctokit.rest.issues.createComment
>;

export class Repo {
  readonly octokit: Octokit;
  readonly owner: string;
  readonly name: string;
  readonly prNumber?: number;
  readonly baseSha?: string;
  readonly headSha?: string;

  constructor() {
    // Fetch GitHub Action context
    // from GITHUB_REPOSITORY & GITHUB_EVENT_PATH
    const { owner, repo } = github.context.repo;
    const { pull_request } = github.context.payload;

    this.owner = owner;
    this.name = repo;
    if (pull_request) {
      this.prNumber = pull_request.number;
      this.baseSha = pull_request.base.sha;
      this.headSha = pull_request.head.sha;
    }
    this.octokit = this.getOctokit();
  }

  getOctokit(): Octokit {
    const ghToken = core.getInput('github-token') || process.env['GITHUB_TOKEN'];

    if (!ghToken) {
      throw new Error(
        'No GITHUB_TOKEN env variable available. Are you sure to run this package from a Github Action?',
      );
    }

    return github.getOctokit(ghToken);
  }

  async getBaseFile(file: string): Promise<string | undefined> {
    const tmpDir = 'tmp/';

    if (this.baseSha && this.headSha) {
      // Fetch base & head branch (default actions/checkout only fetches HEAD)
      await exec.exec('git', ['fetch', 'origin', this.baseSha, this.headSha]);
      // Get common ancestor commit from PR HEAD and base branch
      let commonAncestorSha = '';
      await exec.exec('git', ['merge-base', this.baseSha, this.headSha], {
        listeners: {
          stdout: (data: Buffer) => {
            commonAncestorSha += data.toString().trim();
          },
        },
      });

      // Restore base branch definition file in a tmp directory
      await io.mkdirP(tmpDir);
      await exec.exec('git', [
        '--work-tree',
        tmpDir,
        'restore',
        '-s',
        commonAncestorSha,
        file,
      ]);

      // & restore head branch definition in current directory
      await exec.exec('git', ['restore', '-s', this.headSha, file]);

      return `${tmpDir}${file}`;
    }
  }

  async createOrUpdateComment(body: string, digest: string): Promise<void> {
    if (!this.prNumber) {
      core.info('Not a pull request, nothing more to do.');
      return;
    }

    const { owner, name: repo, prNumber: issue_number, octokit } = this;
    const existingComment = await this.findExistingComment(issue_number);

    if (existingComment) {
      // We force types because of findExistingComment call which ensures
      // body & digest exists if the comment exists but the TS compiler can't guess.
      const [, , existingDigest] = extractBumpComment(
        existingComment.body as string,
      ) as string[];

      if (digest !== existingDigest) {
        await octokit.rest.issues.updateComment({
          owner,
          repo,
          comment_id: existingComment.id,
          body,
        });
      }
    } else {
      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number,
        body,
      });
    }
  }

  async findExistingComment(issue_number: number): Promise<GitHubComment | undefined> {
    const comments = await this.octokit.rest.issues.listComments({
      owner: this.owner,
      repo: this.name,
      issue_number,
    });

    return comments.data.find((comment: GitHubComment) =>
      extractBumpComment(comment.body || ''),
    );
  }

  async deleteExistingComment(): Promise<void> {
    if (!this.prNumber) {
      core.info('Not a pull request, nothing more to do.');
      return;
    }

    const { owner, name: repo, prNumber: issue_number, octokit } = this;
    const existingComment = await this.findExistingComment(issue_number);

    if (existingComment) {
      await octokit.rest.issues.deleteComment({
        owner,
        repo,
        comment_id: existingComment.id
      });
    }
  }
}
