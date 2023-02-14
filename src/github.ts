import * as core from '@actions/core';
import * as github from '@actions/github';
import { GetResponseDataTypeFromEndpointMethod } from '@octokit/types';
import { GitHub } from '@actions/github/lib/utils';
import { extractBumpDigest } from './common';

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

  constructor(public docDigest: string, private prNumber: number) {
    // Fetch GitHub Action context
    // from GITHUB_REPOSITORY & GITHUB_EVENT_PATH
    const { owner, repo } = github.context.repo;

    this.owner = owner;
    this.name = repo;

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

  async createOrUpdateComment(body: string, digest: string): Promise<void> {
    if (!this.prNumber) {
      core.info('Not a pull request, nothing more to do.');
      return;
    }

    const { owner, name: repo, prNumber: issue_number, octokit, docDigest } = this;
    const existingComment = await this.findExistingComment(issue_number);

    core.debug(`[createOrUpdatecomment] Launching for doc ${docDigest} ...`);

    if (existingComment) {
      // We force types because of findExistingComment call which ensures
      // body & digest exists if the comment exists but the TS compiler can't guess.
      const existingDigest = extractBumpDigest(docDigest, existingComment.body as string);

      core.debug(
        `[Repo#createOrUpdatecomment] Update comment (digest=${existingDigest}) for doc ${docDigest}`,
      );

      if (digest !== existingDigest) {
        await octokit.rest.issues.updateComment({
          owner,
          repo,
          comment_id: existingComment.id,
          body,
        });
      }
    } else {
      core.debug(`[Repo#createOrUpdatecomment] Create comment for doc ${docDigest}`);

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
      extractBumpDigest(this.docDigest, comment.body || ''),
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
        comment_id: existingComment.id,
      });
    }
  }
}
