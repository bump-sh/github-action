import { Repo } from './github';
import { DiffResponse } from 'bump-cli';
import { bumpDiffComment, shaDigest } from './common';

export async function run(diff: DiffResponse): Promise<void> {
  const repo = new Repo();

  const digest = shaDigest([diff.markdown!, diff.public_url!]);
  const body = buildCommentBody(diff, digest);

  return repo.createOrUpdateComment(body, digest);
}

function buildCommentBody(diff: DiffResponse, digest: string) {
  const emptySpace = '';
  const poweredByBump = '> _Powered by [Bump](https://bump.sh)_';

  return [title(diff)]
    .concat([emptySpace, diff.markdown!])
    .concat([viewDiffLink(diff), poweredByBump, bumpDiffComment(digest)])
    .join('\n');
}

function title(diff: DiffResponse): string {
  const commentTitle = '🤖 API change detected:';
  const breakingTitle = '🚨 Breaking API change detected:';

  return diff.breaking ? breakingTitle : commentTitle;
}

function viewDiffLink(diff: DiffResponse): string {
  return `
[View documentation diff](${diff.public_url!})
`;
}
