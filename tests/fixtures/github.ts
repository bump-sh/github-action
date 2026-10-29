import fixtureGithubContext from './github-context.json';

const actualGithub = await import('@actions/github');

// Mock github context
export const context = fixtureGithubContext;
// Keep original implementation of Octokit (Github API calls) but use the
// global fetch: @actions/github uses undici's fetch with a proxy
// dispatcher by default, which nock can't intercept.
export const getOctokit: typeof actualGithub.getOctokit = (token, options, ...plugins) =>
  actualGithub.getOctokit(
    token,
    { ...options, request: { ...options?.request, fetch: globalThis.fetch } },
    ...plugins,
  );
