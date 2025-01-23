import fixtureGithubContext from './github-context.json';

// Mock github context
export const context = fixtureGithubContext;
// Keep original implementation of Octokit (Github API calls)
export const { getOctokit } = await import('@actions/github');
