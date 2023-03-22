import crypto from 'crypto';

function bumpDiffRegexp(docDigest: string): RegExp {
  return new RegExp(`<!-- Bump.sh.*digest=([^\\s]+)(?: doc=${docDigest})? -->`);
}

function bumpDiffComment(docDigest: string, digest: string): string {
  return `<!-- Bump.sh digest=${digest} doc=${docDigest} -->`;
}

// Set User-Agent for github-action
const setUserAgent = (): void => {
  process.env.BUMP_USER_AGENT = 'bump-github-action';
  return;
};

function extractBumpDigest(docDigest: string, body: string): string | undefined {
  return (body.match(bumpDiffRegexp(docDigest)) || [])?.pop();
}

function shaDigest(texts: string[]): string {
  const hash = crypto.createHash('sha1');

  texts.forEach((text) => text && hash.update(text, 'utf8'));

  return hash.digest('hex');
}

export { bumpDiffComment, extractBumpDigest, setUserAgent, shaDigest };
