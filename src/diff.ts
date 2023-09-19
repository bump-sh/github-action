import { Repo } from './github';
import { DiffResponse } from 'bump-cli';
import { bumpDiffComment, shaDigest } from './common';

export async function run(diff: DiffResponse, repo: Repo): Promise<void> {
  const digestContent = [diff.markdown!];
  if (diff.public_url) {
    digestContent.push(diff.public_url);
  }
  const digest = shaDigest(digestContent);
  const body = buildCommentBody(repo.docDigest, diff, digest);

  return repo.createOrUpdateComment(body, digest);
}

function buildCommentBody(docDigest: string, diff: DiffResponse, digest: string) {
  const emptySpace = '';
  const poweredByBump = '> _Powered by [Bump.sh](https://bump.sh)_';

  return [title(diff)]
    .concat([emptySpace, diff.markdown!])
    .concat([viewDiffLink(diff), poweredByBump, bumpDiffComment(docDigest, digest)])
    .join('\n');
}

function title(diff: DiffResponse): string {
  const commentTitle = '🤖 API change detected:';
  const breakingTitle = '🚨 Breaking API change detected:';

  return diff.breaking ? breakingTitle : commentTitle;
}

function viewDiffLink(diff: DiffResponse): string {
  if (diff.public_url) {
    return `
[View documentation diff](${diff.public_url!})
`;
  } else {
    return '';
  }
}
