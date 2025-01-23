import { jest } from '@jest/globals';

// Mock fs function
export const fsExists = jest.fn<typeof import('../../src/common.js').fsExists>();

// Keep original implementation of the rest
export const { extractBumpDigest, bumpDiffComment, shaDigest } = await import(
  '../../src/common.js'
);
