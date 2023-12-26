interface IWebLoginInstance {
  initAelfWebLogin(portkeyInstance: any): void;
  setPortkey(portkeyInstance: any): void;
  getPortkey(): any;
}
let portkey: any;
export class WebLoginInstance implements IWebLoginInstance {
  initAelfWebLogin(portkeyInstance: any) {
    this.setPortkey(portkeyInstance);
  }

  setPortkey(portkeyInstance: any) {
    portkey = portkeyInstance;
  }

  getPortkey() {
    return portkey;
  }
}
