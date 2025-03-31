import { basicActions } from './utils';

const modalActions = {
  setDialogVisible: 'SET_DIALOG_VISIBLE',
  setDisconnectDialogVisible: 'SET_DISCONNECT_DIALOG_VISIBLE',

  destroy: 'DESTROY',
};

export interface IConnectInfo {
  name?: string;
  errorMessage?: string;
}

export type modalState = {
  dialogVisible: boolean;
  connectInfo?: IConnectInfo;
  disconnectModal: boolean;
  isDisconnect?: boolean;
};

export const basicModalView = {
  setWalletDialog: {
    type: modalActions['setDialogVisible'],
    actions: (dialogVisible: boolean, connectInfo?: IConnectInfo) => {
      return basicActions(modalActions['setDialogVisible'], {
        dialogVisible,
        connectInfo,
      });
    },
  },
  setDisconnectDialogVisible: {
    type: modalActions['setDisconnectDialogVisible'],
    actions: (disconnectModal: boolean, isDisconnect?: boolean) => {
      return basicActions(modalActions['setDisconnectDialogVisible'], {
        disconnectModal,
        isDisconnect,
      });
    },
  },

  destroy: {
    type: modalActions['destroy'],
    actions: () => basicActions(modalActions['destroy']),
  },
};
