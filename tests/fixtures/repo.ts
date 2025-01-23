import type * as repo from '../../src/github.js';
import { jest } from '@jest/globals';

export const mockGetBaseFile = jest.fn<repo.Repo['getBaseFile']>();
export const mockCreateOrUpdateComment = jest.fn<repo.Repo['createOrUpdateComment']>();
export const mockDeleteExistingComment = jest.fn<repo.Repo['deleteExistingComment']>();
export const Repo = jest.fn().mockImplementation(() => {
  return {
    getBaseFile: mockGetBaseFile,
    createOrUpdateComment: mockCreateOrUpdateComment,
    deleteExistingComment: mockDeleteExistingComment,
  };
});
