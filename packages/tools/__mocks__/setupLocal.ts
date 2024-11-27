import { vi } from 'vitest';
import { type TChainId } from '@aelf-web-login/wallet-adapter-base';

vi.mock('@portkey/contracts', () => ({
  getTxResult: vi.fn(),
}));

vi.mock('@aelf-web-login/wallet-adapter-portkey-aa', () => ({
  PortkeyAAWallet: vi.fn(),
}));

vi.mock('@portkey/did-ui-react', () => ({
  getChainInfo: (c: TChainId) => (!c ? null : {}),
  did: {
    didWallet: {
      managementAccount: {
        privateKey: '',
      },
    },
  },
}));
