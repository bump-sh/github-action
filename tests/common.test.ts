import * as common from '../src/common';

test('shaDigest function', async () => {
  const texts = ['hello'];
  expect(common.shaDigest(texts)).toBe('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d');
  texts.push('world');
  expect(common.shaDigest(texts)).toBe('6adfb183a4a2c94a2f92dab5ade762a47889a5a1');
  texts.pop();
  expect(common.shaDigest(texts)).toBe('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d');
});

test('fsExists function', async () => {
  expect(await common.fsExists('.')).toBe(true);
  expect(await common.fsExists('please-don-t-make-me-fail')).toBe(false);
});
