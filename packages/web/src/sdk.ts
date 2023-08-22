import { ReactWebLogin, Theme } from '@aelf-web-login/react';

export interface SDKDelegate {
  webLogin: ReactWebLogin;
  setTheme(theme: Theme): void;
}

export class SDK {
  constructor(private delegate: SDKDelegate) {}

  setTheme(theme: Theme) {
    this.delegate.setTheme(theme);
  }

  canLoginEagerly(): boolean {
    return this.delegate.webLogin.canLoginEagerly();
  }

  setLoginEagerly(flag: boolean): void {
    return this.delegate.webLogin.setLoginEagerly(flag);
  }

  loginEagerly(): Promise<void> {
    return this.delegate.webLogin.loginEagerly();
  }

  login(): Promise<void> {
    return this.delegate.webLogin.login();
  }

  logout(): Promise<void> {
    return this.delegate.webLogin.logout();
  }
}
