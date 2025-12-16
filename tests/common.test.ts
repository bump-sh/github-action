import * as common from '../src/common';

test('shaDigest function', async () => {
  const texts = ['hello'];
  expect(common.shaDigest(texts)).toBe('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d');
  texts.push('world');
  expect(common.shaDigest(texts)).toBe('6adfb183a4a2c94a2f92dab5ade762a47889a5a1');
  texts.pop();
  expect(common.shaDigest(texts)).toBe('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d');
  texts.push('');
  expect(common.shaDigest(texts)).toBe('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d');
});

test('fsExists function', async () => {
  expect(await common.fsExists('.')).toBe(true);
  expect(await common.fsExists('please-don-t-make-me-fail')).toBe(false);
});

test('extractBumpDigest function', async () => {
  const myDocDigest = 'ba4c368300306897504f99ec0c001f90ad35fccf';
  const bodyDigest = 'aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d';
  const matchingData = [
    `
    A long diff... with legacy signature

    <!-- Bump.sh digest=${bodyDigest} -->
    `,
    `
    A long diff... with new signature

    <!-- Bump.sh digest=${bodyDigest} doc=ba4c368300306897504f99ec0c001f90ad35fccf -->
    `,
  ];
  const nonMatchingData = [
    `
    A long diff... with legacy signature

    <!-- NotBump digest=${bodyDigest} -->
    `,
    `
    A long diff... with new signature

    <!-- Bump.sh digest=${bodyDigest} doc=09d0b70e85385dee834cb060a2ef9d448df0b55d -->
    `,
  ];

  matchingData.forEach((body) => {
    expect(common.extractBumpDigest(myDocDigest, body)).toEqual(bodyDigest);
  });

  nonMatchingData.forEach((body) => {
    expect(common.extractBumpDigest(myDocDigest, body)).toBeUndefined();
  });
});
