import WebLoginProvider, { useWebLogin, WebLoginContext } from './src/context';
import useLoginState from './src/hooks/useLoginState';
import useAccountInfoSync from './src/hooks/useAccountInfoSync';
import './index.less';

export * from './src/constants';
export * from './src/config';

export { WebLoginContext, WebLoginProvider, useWebLogin, useLoginState, useAccountInfoSync };
