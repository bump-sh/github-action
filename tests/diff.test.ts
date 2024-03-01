import * as bump from 'bump-cli';
import * as diff from '../src/diff';

// Mock internal Repo class
import { Repo } from '../src/github';
// Repo class is completely mocked (by jest.mock(...)) meaning all
// method calls return 'undefined' (including attribute getters).
jest.mock('../src/github');
const mockedInternalRepo = Repo as jest.Mocked<typeof Repo>;

test('test github diff run process', async () => {
  const result: bump.DiffResponse = {
    id: '123abc',
    markdown: `* one
* two
* three
`,
    public_url: 'https://bump.sh/doc/my-doc/changes/654',
    breaking: false,
  };
  const digest = '4b81e612cafa6580f8ad3bfe9e970b2d961f58c2';

  expect(mockedInternalRepo).not.toHaveBeenCalled();

  const repo = new Repo('');
  await diff.run(result, repo);

  expect(mockedInternalRepo.prototype.createOrUpdateComment).toHaveBeenCalledWith(
    `🤖 API change detected:

* one
* two
* three


[Preview documentation](https://bump.sh/doc/my-doc/changes/654)

> _Powered by [Bump.sh](https://bump.sh)_
<!-- Bump.sh digest=${digest} doc=undefined -->`,
    digest,
  );
});

test('test github diff with breaking changes', async () => {
  const result: bump.DiffResponse = {
    id: '123abc',
    markdown: `* one
* two
* three
`,
    public_url: 'https://bump.sh/doc/my-doc/changes/654',
    breaking: true,
  };
  const digest = '4b81e612cafa6580f8ad3bfe9e970b2d961f58c2';

  expect(mockedInternalRepo).not.toHaveBeenCalled();

  const repo = new Repo('');
  await diff.run(result, repo);

  expect(mockedInternalRepo.prototype.createOrUpdateComment).toHaveBeenCalledWith(
    `🚨 Breaking API change detected:

* one
* two
* three


[Preview documentation](https://bump.sh/doc/my-doc/changes/654)

> _Powered by [Bump.sh](https://bump.sh)_
<!-- Bump.sh digest=${digest} doc=undefined -->`,
    digest,
  );
});

test('test github diff without public url', async () => {
  const result: bump.DiffResponse = {
    id: '123abc',
    markdown: `* one
* two
* three
`,
    breaking: false,
  };
  const digest = 'c1f04e5c83235377b88745d13dc9b1ebd3a125a8';

  expect(mockedInternalRepo).not.toHaveBeenCalled();

  const repo = new Repo('');
  await diff.run(result, repo);

  expect(mockedInternalRepo.prototype.createOrUpdateComment).toHaveBeenCalledWith(
    `🤖 API change detected:

* one
* two
* three


> _Powered by [Bump.sh](https://bump.sh)_
<!-- Bump.sh digest=${digest} doc=undefined -->`,
    digest,
  );
});
