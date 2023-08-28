import { describe, expect, test } from '@jest/globals';
import isAElfWallet from '../src/utils/isAElfWallet';
import isPortkeyApp from '../src/utils/isPortkeyApp';

describe('utils', () => {
  test('isAElfWallet', () => {
    expect(isAElfWallet()).toBe(false);
  });

  test('isPortkeyApp', () => {
    expect(isPortkeyApp()).toBe(false);
  });
});
