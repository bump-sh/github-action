import * as github from './fixtures/github.js';
import * as bump from 'bump-cli';
import { jest } from '@jest/globals';
import { shaDigest } from '../src/common.js';

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/github', () => github);

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { Repo } = await import('../src/github.js');
const diff = await import('../src/diff.js');
const originalGhToken = process.env['GITHUB_TOKEN'];

describe('diff.ts', () => {
  beforeEach(() => {
    // Mock token env variable
    process.env['GITHUB_TOKEN'] = 'gh-12abc';

    jest.clearAllMocks();

    // spy and mock Repo#createOrUpdateComment instance function
    jest
      .spyOn(Repo.prototype, 'createOrUpdateComment')
      .mockImplementation(async () => {});
  });

  afterEach(() => {
    process.env['GITHUB_TOKEN'] = originalGhToken;

    jest.restoreAllMocks();
  });

  test('test github diff run process', async () => {
    const result: bump.Diff.DiffResult = {
      id: '123abc',
      markdown: `* one
* two
* three
`,
      public_url: 'https://bump.sh/doc/my-doc/changes/654',
      breaking: false,
    };
    const digest = '4b81e612cafa6580f8ad3bfe9e970b2d961f58c2';

    const repo = new Repo('hello', '', 'v2');
    const docDigest = shaDigest(['hello', '', 'v2']);

    await diff.run(result, repo);

    expect(repo.createOrUpdateComment).toHaveBeenCalledWith(
      `### 🤖 Hello (branch: v2) API structural change detected

[Preview documentation](https://bump.sh/doc/my-doc/changes/654)

<details open><summary>Structural change details</summary>

* one
* two
* three


</details>

###### _Powered by [Bump.sh](https://bump.sh)_
<!-- Bump.sh digest=${digest} doc=${docDigest} -->`,
      digest,
    );
  });

  test('test github diff run process (with doc_name)', async () => {
    const result: bump.Diff.DiffResult = {
      id: '123abc',
      markdown: `**Doc has a name**`,
      public_url: 'https://bump.sh/doc/my-doc/changes/654',
      breaking: false,
      doc_name: 'My API Documentation',
    };
    const digest = 'ccc5f7d8e472d46cd38e108bf43fbc46243807a2';

    const repo = new Repo('id-42', '', 'v2');
    const docDigest = shaDigest(['id-42', '', 'v2']);

    await diff.run(result, repo);

    expect(repo.createOrUpdateComment).toHaveBeenCalledWith(
      `### 🤖 My API Documentation (branch: v2) API structural change detected

[Preview documentation](https://bump.sh/doc/my-doc/changes/654)

<details open><summary>Structural change details</summary>

**Doc has a name**

</details>

###### _Powered by [Bump.sh](https://bump.sh)_
<!-- Bump.sh digest=${digest} doc=${docDigest} -->`,
      digest,
    );
  });

  test('test github diff with no structural change', async () => {
    const result: bump.Diff.DiffResult = {
      id: '123abc',
      public_url: 'https://bump.sh/doc/my-doc/changes/654',
      breaking: false,
      doc_name: 'My API Documentation',
    };
    const digest = '3999a0fe6ad27841bd6342128f7028ab2cea1c57';

    const repo = new Repo('hello', 'my-hub', 'v1');
    const docDigest = shaDigest(['hello', 'my-hub', 'v1']);
    await diff.run(result, repo);

    expect(repo.createOrUpdateComment).toHaveBeenCalledWith(
      `### ℹ️ My API Documentation (branch: v1) API content change detected

[Preview documentation](https://bump.sh/doc/my-doc/changes/654)

No structural change, nothing to display.

###### _Powered by [Bump.sh](https://bump.sh)_
<!-- Bump.sh digest=${digest} doc=${docDigest} -->`,
      digest,
    );
  });

  test('test github diff with breaking changes', async () => {
    const result: bump.Diff.DiffResult = {
      id: '123abc',
      markdown: `* one
* two
* three
`,
      public_url: 'https://bump.sh/doc/my-doc/changes/654',
      breaking: true,
    };
    const digest = '4b81e612cafa6580f8ad3bfe9e970b2d961f58c2';
    const repo = new Repo('hello');
    const docDigest = shaDigest(['hello']);
    await diff.run(result, repo);

    expect(repo.createOrUpdateComment).toHaveBeenCalledWith(
      `### 🚨 Breaking Hello API change detected

[Preview documentation](https://bump.sh/doc/my-doc/changes/654)

<details open><summary>Structural change details</summary>

* one
* two
* three


</details>

###### _Powered by [Bump.sh](https://bump.sh)_
<!-- Bump.sh digest=${digest} doc=${docDigest} -->`,
      digest,
    );
  });

  test('test github diff without public url', async () => {
    const result: bump.Diff.DiffResult = {
      id: '123abc',
      markdown: `* one
* two
* three
`,
      breaking: false,
    };
    const digest = 'c1f04e5c83235377b88745d13dc9b1ebd3a125a8';

    const repo = new Repo('hello');
    const docDigest = shaDigest(['hello']);
    await diff.run(result, repo);

    expect(repo.createOrUpdateComment).toHaveBeenCalledWith(
      `### 🤖 Hello API structural change detected

<details open><summary>Structural change details</summary>

* one
* two
* three


</details>

###### _Powered by [Bump.sh](https://bump.sh)_
<!-- Bump.sh digest=${digest} doc=${docDigest} -->`,
      digest,
    );
  });
});
