import type * as repo from '../../src/github.js';
import { jest } from '@jest/globals';

export const mockGetBaseFile = jest.fn<repo.Repo['getBaseFile']>();
export const mockGetBaseOverlays = jest.fn<repo.Repo['getBaseOverlays']>();
export const mockCreateOrUpdateComment = jest.fn<repo.Repo['createOrUpdateComment']>();
export const mockDeleteExistingComment = jest.fn<repo.Repo['deleteExistingComment']>();
export const Repo = jest.fn().mockImplementation(() => {
  return {
    doc: 'my-doc',
    getBaseFile: mockGetBaseFile,
    getBaseOverlays: mockGetBaseOverlays,
    createOrUpdateComment: mockCreateOrUpdateComment,
    deleteExistingComment: mockDeleteExistingComment,
  };
});
