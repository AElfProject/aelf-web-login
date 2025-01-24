import { type TChainId } from '@aelf-web-login/wallet-adapter-base';
import { getContractBasic } from '@portkey/contracts';
import { type Mock } from 'vitest';

afterEach(() => {
  vi.unmock('@portkey/contracts');
});

vi.mock('@portkey/contracts', () => ({
  getContractBasic: vi.fn(),
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
  PortkeyProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@portkey/utils', () => ({
  aelf: {
    getWallet: vi.fn(),
  },
}));
