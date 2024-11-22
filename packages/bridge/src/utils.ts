import { getChainInfo, did } from '@portkey/did-ui-react';
import { aelf } from '@portkey/utils';
import { getContractBasic } from '@portkey/contracts';
import { TChainId, EventEmitter } from '@aelf-web-login/wallet-adapter-base';

export const EE = new EventEmitter();
export const SET_GUARDIAN_APPROVAL_MODAL = 'SET_GUARDIAN_APPROVAL_MODAL';
export const SET_GUARDIAN_APPROVAL_PAYLOAD = 'SET_GUARDIAN_APPROVAL_PAYLOAD';

export const getCaContractBase = async (chainId: TChainId) => {
  const chainInfo = await getChainInfo(chainId);
  if (!chainInfo) {
    throw new Error(`Chain is not running: ${chainId}`);
  }
  const account = aelf.getWallet(did.didWallet.managementAccount?.privateKey || '');
  const caContract = await getContractBasic({
    contractAddress: chainInfo.caContractAddress,
    account,
    rpcUrl: chainInfo.endPoint,
  });
  return caContract;
};

export const getIsManagerReadOnly = async (chainId: TChainId, caHash = '', manager = '') => {
  const caIns = await getCaContractBase(chainId);
  try {
    const rs = await caIns.callViewMethod('IsManagerReadOnly', {
      caHash,
      manager,
    });
    console.log('intg-----getIsManagerReadOnly', rs, caHash, manager);
    return !!rs?.data;
  } catch (e) {
    console.log('intg----getIsManagerReadOnly is fail', e);
    return false;
  }
};
