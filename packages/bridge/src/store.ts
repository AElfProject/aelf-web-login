import { TWalletError, TWalletInfo, WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { GuardianApprovedItem } from '@portkey/did-ui-react';
import { LoginStatusEnum } from '@portkey/types';
import { configureStore, createSlice, EnhancedStore } from '@reduxjs/toolkit';

type TState = {
  walletInfo: TWalletInfo;
  isLocking: boolean;
  walletType: WalletTypeEnum;
  loginError: TWalletError | null;
  loginOnChainStatus: LoginStatusEnum;
  approvedGuardians: GuardianApprovedItem[];
};

const initialState: TState = {
  walletInfo: undefined,
  isLocking: false,
  walletType: WalletTypeEnum.unknown,
  loginError: null,
  loginOnChainStatus: LoginStatusEnum.INIT,
  approvedGuardians: [],
};

const aelfWebLoginSlice = createSlice({
  name: 'aelfWebLogin',
  initialState,
  reducers: {
    setWalletInfo: (state, action) => {
      state.walletInfo = action.payload;
    },
    clearWalletInfo: (state) => {
      state.walletInfo = undefined;
    },
    setLocking: (state, action) => {
      state.isLocking = action.payload;
    },
    setWalletType: (state, action) => {
      state.walletType = action.payload;
    },
    clearWalletType: (state) => {
      state.walletType = WalletTypeEnum.unknown;
    },
    setLoginError: (state, action) => {
      state.loginError = action.payload;
    },
    clearLoginError: (state) => {
      state.loginError = null;
    },
    setLoginOnChainStatus: (state, action) => {
      state.loginOnChainStatus = action.payload;
    },
    setApprovedGuardians: (state, action) => {
      state.approvedGuardians = action.payload;
    },
  },
});

export const store: EnhancedStore<TState> = configureStore({
  reducer: aelfWebLoginSlice.reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['aelfWebLogin/setWalletInfo'],
        // Ignore these field paths in all actions
        ignoredActionPaths: [
          'walletInfo.extraInfo.provider',
          'walletInfo.extraInfo.portkeyInfo.walletInfo',
          'walletInfo.extraInfo.nightElfInfo',
          'loginError.nativeError',
          'payload.nativeError',
        ],
        // Ignore these paths in the state
        ignoredPaths: [
          'walletInfo.extraInfo.provider',
          'walletInfo.extraInfo.portkeyInfo.walletInfo',
          'walletInfo.extraInfo.nightElfInfo',
          'loginError.nativeError',
          'payload.nativeError',
        ],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const {
  setWalletInfo,
  clearWalletInfo,
  setLocking,
  setWalletType,
  clearWalletType,
  setLoginError,
  clearLoginError,
  setLoginOnChainStatus,
  setApprovedGuardians,
} = aelfWebLoginSlice.actions;

export type AppDispatch = typeof store.dispatch;
export const dispatch: AppDispatch = store.dispatch;
export type AppStore = typeof store;
