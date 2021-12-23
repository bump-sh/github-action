import { Repo } from './github';
import { WithDiff } from 'bump-cli';
import { bumpDiffComment, shaDigest } from './common';

export async function run(diff: WithDiff): Promise<void> {
  const repo = new Repo();

  const digest = shaDigest([diff.diff_markdown!, diff.diff_public_url!]);
  const body = buildCommentBody(diff, digest);

  return repo.createOrUpdateComment(body, digest);
}

function buildCommentBody(diff: WithDiff, digest: string) {
  const emptySpace = '';
  const poweredByBump = '> _Powered by [Bump](https://bump.sh)_';

  return [title(diff)]
    .concat([emptySpace, diff.diff_markdown!])
    .concat([viewDiffLink(diff), poweredByBump, bumpDiffComment(digest)])
    .join('\n');
}

function title(diff: WithDiff): string {
  const commentTitle = '🤖 API change detected:';
  const breakingTitle = '🚨 Breaking API change detected:';

  return diff.diff_breaking ? breakingTitle : commentTitle;
}

function viewDiffLink(diff: WithDiff): string {
  return `
[View documentation diff](${diff.diff_public_url!})
`;
}
