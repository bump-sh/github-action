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

function shaDigest(text: string): string {
  return crypto.createHash('sha1').update(text, 'utf8').digest('hex');
}

export { bumpDiffComment, extractBumpComment, setUserAgent, shaDigest };
