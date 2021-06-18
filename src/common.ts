import crypto from 'crypto';

const bumpDiffRegexp = /<!-- Bump.sh version_id=(.*) digest=(.*) -->/;

function bumpDiffComment(versionId: string, digest: string): string {
  return `<!-- Bump.sh version_id=${versionId} digest=${digest} -->`;
}

function extractBumpComment(body: string): string[] | null {
  return body.match(bumpDiffRegexp);
}

function shaDigest(text: string): string {
  return crypto.createHash('sha1').update(text, 'utf8').digest('hex');
}

export { bumpDiffComment, extractBumpComment, shaDigest };
