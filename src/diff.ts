import type { Repo } from './github.js';
import type { DiffResponse } from 'bump-cli';
import { bumpDiffComment, shaDigest } from './common.js';

export async function run(diff: DiffResponse, repo: Repo): Promise<void> {
  const digestContent = [diff.markdown];
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
  const text = diff.markdown || 'No structural change, nothing to display.';

  return [title(diff)]
    .concat([emptySpace, text])
    .concat([viewDiffLink(diff), poweredByBump, bumpDiffComment(docDigest, digest)])
    .join('\n');
}

function title(diff: DiffResponse): string {
  const structureTitle = '🤖 API structural change detected:';
  const contentTitle = 'ℹ️ API content change detected:';
  const breakingTitle = '🚨 Breaking API change detected:';

  if (diff.breaking) {
    return breakingTitle;
  } else if (diff.markdown) {
    return structureTitle;
  } else {
    return contentTitle;
  }
}

function viewDiffLink(diff: DiffResponse): string {
  if (diff.public_url) {
    return `
[Preview documentation](${diff.public_url!})
`;
  } else {
    return '';
  }
}
