import { makeError, ERR_CODE, ERR_CODE_MSG } from '../errors';

describe('ErrorHandler Module', () => {
  describe('ERR_CODE and ERR_CODE_MSG', () => {
    it('should have matching keys', () => {
      for (const key in ERR_CODE as any) {
        expect(ERR_CODE_MSG[ERR_CODE[key as keyof typeof ERR_CODE]]).toBeTruthy();
      }
    });
  });

  describe('makeError', () => {
    it('should create an error object with correct properties', () => {
      const code = ERR_CODE.DISCOVER_LOGIN_EAGERLY_FAIL;
      const error = makeError(code);

      expect(error).toEqual({
        name: 'WalletError',
        code,
        message: ERR_CODE_MSG[code],
        nativeError: undefined,
      });
    });

    it('should handle nativeError correctly', () => {
      const code = ERR_CODE.NETWORK_TYPE_NOT_MATCH;
      const nativeError = new Error('Network mismatch');
      const error = makeError(code, nativeError);

      expect(error.nativeError).toEqual(nativeError);
    });

    it('should return an error with default message for unknown codes', () => {
      const code = 9999;
      const error = makeError(code);

      expect(error.message).toBeUndefined();
    });
  });
});
