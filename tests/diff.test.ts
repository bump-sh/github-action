import * as diff from '../src/diff';

// Mock internal github code
import { Repo } from '../src/github';
jest.mock('../src/github');
const mockedInternalRepo = Repo as jest.Mocked<typeof Repo>;

test('test github diff run process', async () => {
  const version: diff.VersionWithDiff = {
    id: 'hello-123',
    diff_summary: `one
two
three`,
    diff_public_url: 'https://bump.sh/doc/my-doc/changes/654',
    diff_breaking: false,
  };
  const digest = 'b62da49eb54ba0cc86e0899e3435b8ae8014dea9';

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

test('test github diff with breaking changes', async () => {
  const version: diff.VersionWithDiff = {
    id: 'hello-123',
    diff_summary: `one
two
three`,
    diff_public_url: 'https://bump.sh/doc/my-doc/changes/654',
    diff_breaking: true,
  };
  const digest = 'b62da49eb54ba0cc86e0899e3435b8ae8014dea9';

  expect(mockedInternalRepo).not.toHaveBeenCalled();

  await diff.run(version);

  expect(mockedInternalRepo.prototype.createOrUpdateComment).toHaveBeenCalledWith(
    `🚨 Breaking API change detected:
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
