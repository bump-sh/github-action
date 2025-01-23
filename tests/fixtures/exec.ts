import type { exec as realExec } from '@actions/exec';
import { jest } from '@jest/globals';

export const exec = jest.fn<typeof realExec>();
