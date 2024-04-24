// export * from './mountApp'
import { Bridge } from './bridge';
import { mountApp } from './mountApp';

export function init() {
  const bridgeInstance = new Bridge();
  mountApp(bridgeInstance);
}
