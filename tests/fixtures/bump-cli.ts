import * as bump from 'bump-cli';
import { jest } from '@jest/globals';

// Spy on static Deploy.run function
const mockRunDeploy = jest.spyOn(bump.Deploy, 'run');
// AND mock implementation (by returning an void promise)
mockRunDeploy.mockResolvedValue(Promise.resolve(undefined));
const Deploy = bump.Deploy;
// Spy on static Preview.run function
const mockRunPreview = jest.spyOn(bump.Preview, 'run');
// AND mock implementation (by returning an void promise)
mockRunPreview.mockResolvedValue(Promise.resolve(undefined));
const Preview = bump.Preview;
// Mock bump-cli Diff class with an empty mock
const mockRunDiff = jest.fn<bump.Diff.Diff['run']>();
const Diff = {
  Diff: jest.fn().mockImplementation(() => {
    return { run: mockRunDiff };
  }),
};

// Export bump-cli interface AND mock functions
export { Deploy, mockRunDeploy, Preview, mockRunPreview, Diff, mockRunDiff };
