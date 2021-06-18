import * as core from '@actions/core';
import * as github from '@actions/github';
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

  constructor() {
    // Fetch GitHub Action context
    // from GITHUB_REPOSITORY & GITHUB_EVENT_PATH
    const { owner, repo, number: prNumber } = github.context.issue;
    // const { sha, ref } = github.context;

    this.owner = owner;
    this.name = repo;
    this.prNumber = prNumber;

    this.octokit = this.getOctokit();
  }

  isPr(): boolean {
    return !!this.prNumber;
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

  async createOrUpdateComment(body: string, digest: string): Promise<void> {
    const { owner, name: repo, prNumber: issue_number, octokit } = this;

    if (!issue_number) {
      core.info('Not a pull request, nothing more to do.');
      return;
    }

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
}
