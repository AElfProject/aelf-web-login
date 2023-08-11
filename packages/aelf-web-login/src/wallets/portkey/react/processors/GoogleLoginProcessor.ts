import { PortkeySDKLoginType } from '../../../../types';
import { PortkeySDKLoginProcessorBase, PortkeySDKLoginResult } from '../../processor';

export class GoogleLoginProcessor extends PortkeySDKLoginProcessorBase {
  type: PortkeySDKLoginType = 'Google';

  protected _processLogin(complete: (result: PortkeySDKLoginResult) => void): void {
    throw new Error('Method not implemented.');
  }
}
