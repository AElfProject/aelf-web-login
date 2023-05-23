import WebLoginProvider, { useWebLogin, WebLoginContext } from './src/context';
import useLoginState from './src/hooks/useLoginState';
import './index.less';

export * from './src/constants';
export * from './src/config';

export { WebLoginContext, WebLoginProvider, useWebLogin, useLoginState };
