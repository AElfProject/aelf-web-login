import { createSlice, configureStore } from '@reduxjs/toolkit';
// import { TWalletInfo } from '@aelf-web-login/wallet-adapter-base';

const aelfWebLoginSlice = createSlice({
  name: 'aelfWebLogin',
  initialState: {
    walletInfo: null,
  },
  reducers: {
    setWalletInfo: (state, action) => {
      state.walletInfo = action.payload;
    },
    clearWalletInfo: (state) => {
      state.walletInfo = null;
    },
  },
});

const makeStore = () => {
  const store = configureStore({
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
          ],
          // Ignore these paths in the state
          ignoredPaths: [
            'walletInfo.extraInfo.provider',
            'walletInfo.extraInfo.portkeyInfo.walletInfo',
          ],
        },
      }),
    devTools: process.env.NODE_ENV !== 'production',
  });

  return store;
};

export const { setWalletInfo, clearWalletInfo } = aelfWebLoginSlice.actions;

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = typeof store.dispatch;
export const store: AppStore = makeStore();
export const dispatch: AppDispatch = store.dispatch;
