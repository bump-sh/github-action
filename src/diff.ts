import type { Repo } from './github.js';
import type { DiffResponse } from 'bump-cli';
import { bumpDiffComment, shaDigest } from './common.js';

export async function run(diff: DiffResponse, repo: Repo): Promise<void> {
  const digestContent = [diff.markdown];
  if (diff.public_url) {
    digestContent.push(diff.public_url);
  }
  const digest = shaDigest(digestContent);
  const body = buildCommentBody(repo, diff, digest);

  return repo.createOrUpdateComment(body, digest);
}

function buildCommentBody(repo: Repo, diff: DiffResponse, digest: string) {
  const emptySpace = '';
  const poweredByBump = '###### _Powered by [Bump.sh](https://bump.sh)_';
  let text = 'No structural change, nothing to display.';
  if (diff.markdown) {
    text = `<details open><summary>Structural change details</summary>

${diff.markdown}

</details>`;
  }

  return [title(diff, repo.doc, repo.hub, repo.branch)]
    .concat([viewDiffLink(diff)])
    .concat([text, emptySpace])
    .concat([poweredByBump, bumpDiffComment(repo.docDigest, digest)])
    .join('\n');
}

function title(diff: DiffResponse, doc: string, hub?: string, branch?: string): string {
  let docName = [hub, doc].filter((e) => e).join('/');
  // Capitalize doc name
  docName = docName.charAt(0).toUpperCase() + docName.slice(1);
  if (branch) {
    docName = `${docName} (branch: ${branch})`;
  }
  const structureTitle = `### 🤖 ${docName} API structural change detected`;
  const contentTitle = `### ℹ️ ${docName} API content change detected`;
  const breakingTitle = `### 🚨 Breaking ${docName} API change detected`;

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
