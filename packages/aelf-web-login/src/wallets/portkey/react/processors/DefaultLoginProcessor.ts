import { PortkeySDKLoginType } from '../../../../types';
import { PortkeySDKLoginProcessorBase, PortkeySDKLoginResult } from '../../processor';

export class DefaultLoginProcessor extends PortkeySDKLoginProcessorBase {
  type: PortkeySDKLoginType = 'Default';

  protected _processLogin(complete: (result: PortkeySDKLoginResult) => void): void {
    throw new Error('Method not implemented.');
  }
}
