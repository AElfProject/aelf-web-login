import { describe, expect, test } from '@jest/globals';
import isAElfWallet from '../src/utils/isAElfWallet';

describe('utils', () => {
  test('isAElfWallet', async () => {
    expect(isAElfWallet()).toEqual(false);
  });
});
