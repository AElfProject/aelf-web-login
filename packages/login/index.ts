import WebLoginProvider, { useWebLogin, useWallet } from './src/context';
import useCallContract from './src/hooks/useContract';
import './index.css';

export * from './src/constants';
export * from './src/config';
export { useWebLogin, useWallet };
export { useCallContract };

export { WebLoginProvider };
