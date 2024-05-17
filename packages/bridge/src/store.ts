import { createSlice, configureStore } from '@reduxjs/toolkit';

const aelfWebLoginSlice = createSlice({
  name: 'aelfWebLogin',
  initialState: {
    walletInfo: null,
    isLocking: false,
  },
  reducers: {
    setWalletInfo: (state, action) => {
      state.walletInfo = action.payload;
    },
    clearWalletInfo: (state) => {
      state.walletInfo = null;
    },
    setLocking: (state, action) => {
      state.isLocking = action.payload;
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

  return store;
};

export const { setWalletInfo, clearWalletInfo, setLocking } = aelfWebLoginSlice.actions;

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = typeof store.dispatch;
export const store: AppStore = makeStore();
export const dispatch: AppDispatch = store.dispatch;
