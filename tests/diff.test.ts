import { VersionResponse } from 'bump-cli';
import * as diff from '../src/diff';

// Mock internal github code
import { Repo } from '../src/github';
jest.mock('../src/github');
const mockedInternalRepo = Repo as jest.Mocked<typeof Repo>;

test('test github diff run process', async () => {
  const version: VersionResponse = {
    id: 'hello-123',
    diff_summary: `one
two
three`,
    diff_public_url: 'https://bump.sh/doc/my-doc/changes/654',
  };
  const digest = '710a99159c77e7c08094e89c1211136d2b123612';

  expect(mockedInternalRepo).not.toHaveBeenCalled();

  await diff.run(version);

  expect(mockedInternalRepo.prototype.createOrUpdateComment).toHaveBeenCalledWith(
    `🤖 API change detected:
\`\`\`
one
two
three
\`\`\`

[View documentation diff](https://bump.sh/doc/my-doc/changes/654)

> _Powered by [Bump](https://bump.sh)_
<!-- Bump.sh version_id=hello-123 digest=${digest} -->`,
    digest,
  );
});
