import { basicModalView } from '../useModal/actions';
import { basicActions } from '../useModal/utils';

describe('useModal actions', () => {
  it('should create setWalletDialog action', () => {
    const action = basicModalView.setWalletDialog.actions(true, { name: 'TestWallet' });

    expect(action).toEqual({
      type: 'SET_DIALOG_VISIBLE',
      payload: {
        dialogVisible: true,
        connectInfo: { name: 'TestWallet' },
      },
    });
  });

  it('should create setWalletDialog action without connectInfo', () => {
    const action = basicModalView.setWalletDialog.actions(false);

    expect(action).toEqual({
      type: 'SET_DIALOG_VISIBLE',
      payload: {
        dialogVisible: false,
        connectInfo: undefined,
      },
    });
  });

  it('should create setDisconnectDialogVisible action', () => {
    const action = basicModalView.setDisconnectDialogVisible.actions(true, true);

    expect(action).toEqual({
      type: 'SET_DISCONNECT_DIALOG_VISIBLE',
      payload: {
        disconnectModal: true,
        isDisconnect: true,
      },
    });
  });

  it('should create setDisconnectDialogVisible action without isDisconnect', () => {
    const action = basicModalView.setDisconnectDialogVisible.actions(false);

    expect(action).toEqual({
      type: 'SET_DISCONNECT_DIALOG_VISIBLE',
      payload: {
        disconnectModal: false,
        isDisconnect: undefined,
      },
    });
  });

  it('should create destroy action', () => {
    const action = basicModalView.destroy.actions();

    expect(action).toEqual({
      type: 'DESTROY',
      payload: undefined,
    });
  });

  it('should have correct action types', () => {
    expect(basicModalView.setWalletDialog.type).toBe('SET_DIALOG_VISIBLE');
    expect(basicModalView.setDisconnectDialogVisible.type).toBe('SET_DISCONNECT_DIALOG_VISIBLE');
    expect(basicModalView.destroy.type).toBe('DESTROY');
  });
});

describe('basicActions utility', () => {
  it('should create action with type and payload', () => {
    const action = basicActions('TEST_TYPE', { test: 'value' });

    expect(action).toEqual({
      type: 'TEST_TYPE',
      payload: { test: 'value' },
    });
  });

  it('should create action with type only', () => {
    const action = basicActions('TEST_TYPE');

    expect(action).toEqual({
      type: 'TEST_TYPE',
      payload: undefined,
    });
  });
});
