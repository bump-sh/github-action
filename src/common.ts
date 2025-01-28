import * as fs from 'fs';
import crypto from 'crypto';

function bumpDiffRegexp(docDigest: string): RegExp {
  return new RegExp(`<!-- Bump.sh.*digest=([^\\s]+)(?: doc=${docDigest})? -->`);
}

function bumpDiffComment(docDigest: string, digest: string): string {
  return `<!-- Bump.sh digest=${digest} doc=${docDigest} -->`;
}

function extractBumpDigest(docDigest: string, body: string): string | undefined {
  return (body.match(bumpDiffRegexp(docDigest)) || []).pop();
}

function shaDigest(texts: (string | undefined)[]): string {
  const hash = crypto.createHash('sha1');

  texts.forEach((text) => text && hash.update(text, 'utf8'));

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

export { bumpDiffComment, extractBumpDigest, fsExists, shaDigest };
