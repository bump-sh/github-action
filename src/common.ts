import * as fs from 'fs';
import crypto from 'crypto';

const bumpDiffRegexp = /<!-- Bump.sh version_id=(.*) digest=(.*) -->/;

function bumpDiffComment(versionId: string, digest: string): string {
  return `<!-- Bump.sh version_id=${versionId} digest=${digest} -->`;
}
// Set User-Agent for github-action
const setUserAgent = (): void => {
  process.env.BUMP_USER_AGENT = 'bump-github-action';
  return;
};

function extractBumpComment(body: string): string[] | null {
  return body.match(bumpDiffRegexp);
}

function shaDigest(texts: string[]): string {
  const hash = crypto.createHash('sha1');

  texts.forEach((text) => hash.update(text, 'utf8'));

  return hash.digest('hex');
}

async function fsExists(fsPath: string): Promise<boolean> {
  try {
    await fs.promises.stat(fsPath);
  } catch (err) {
    if (err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
      return false;
    }

    throw err;
  }

  return true;
}

export { bumpDiffComment, extractBumpComment, fsExists, setUserAgent, shaDigest };
