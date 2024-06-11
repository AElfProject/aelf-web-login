import { createSlice, configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { TWalletInfo, WalletTypeEnum, TWalletError } from '@aelf-web-login/wallet-adapter-base';

type TState = {
  walletInfo: TWalletInfo;
  isLocking: boolean;
  walletType: WalletTypeEnum;
  loginError: TWalletError | null;
};

const initialState: TState = {
  walletInfo: undefined,
  isLocking: false,
  walletType: WalletTypeEnum.unknown,
  loginError: null,
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
        ],
        // Ignore these paths in the state
        ignoredPaths: [
          'walletInfo.extraInfo.provider',
          'walletInfo.extraInfo.portkeyInfo.walletInfo',
          'walletInfo.extraInfo.nightElfInfo',
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
} = aelfWebLoginSlice.actions;

export type AppDispatch = typeof store.dispatch;
export const dispatch: AppDispatch = store.dispatch;
export type AppStore = typeof store;
