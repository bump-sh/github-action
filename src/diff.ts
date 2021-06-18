import * as core from '@actions/core';
import { Repo } from './github';
import { VersionResponse } from 'bump-cli';
import { bumpDiffComment, shaDigest } from './common';

interface VersionWithDiff extends VersionResponse {
  diff_summary: string;
  diff_public_url: string;
}

const commentTitle = '🤖 API change detected:';
const codeBlock = '```';
const poweredByBump = '> _Powered by [Bump](https://bump.sh)_';

export async function run(version: VersionResponse): Promise<void> {
  if (!isVersionWithDiff(version)) {
    core.info('No diff found, nothing more to do.');
    return;
  }

  const repo = new Repo();
  const digest = shaDigest(version.diff_summary);
  const body = buildCommentBody(version, digest);

  return repo.createOrUpdateComment(body, digest);
}

function isVersionWithDiff(version: VersionResponse): version is VersionWithDiff {
  return version.diff_summary !== undefined;
}

function buildCommentBody(version: VersionWithDiff, digest: string) {
  return [commentTitle]
    .concat([codeBlock, version.diff_summary, codeBlock])
    .concat([viewDiffLink(version), poweredByBump, bumpDiffComment(version.id, digest)])
    .join('\n');
}

function viewDiffLink(version: VersionWithDiff): string {
  return `
[View documentation diff](${version.diff_public_url})
`;
}
