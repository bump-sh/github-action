import { Repo } from './github';
import { VersionResponse } from 'bump-cli';
import { bumpDiffComment, shaDigest } from './common';

export interface VersionWithDiff extends VersionResponse {
  diff_summary: string;
  diff_public_url: string;
  diff_breaking: boolean;
}

export async function run(version: VersionWithDiff): Promise<void> {
  const repo = new Repo();

  const digest = shaDigest([version.diff_summary, version.diff_public_url]);
  const body = buildCommentBody(version, digest);

  return repo.createOrUpdateComment(body, digest);
}

function buildCommentBody(version: VersionWithDiff, digest: string) {
  const codeBlock = '```';
  const poweredByBump = '> _Powered by [Bump](https://bump.sh)_';

  return [title(version)]
    .concat([codeBlock, version.diff_summary, codeBlock])
    .concat([viewDiffLink(version), poweredByBump, bumpDiffComment(version.id, digest)])
    .join('\n');
}

function title(version: VersionWithDiff): string {
  const commentTitle = '🤖 API change detected:';
  const breakingTitle = '🚨 Breaking API change detected:';

  return version.diff_breaking ? breakingTitle : commentTitle;
}

function viewDiffLink(version: VersionWithDiff): string {
  return `
[View documentation diff](${version.diff_public_url})
`;
}
