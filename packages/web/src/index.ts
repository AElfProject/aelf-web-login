import setup from './setup';

export class SDK {
  setup = setup;
  login() {
    console.log('login');
  }
}

export default new SDK();
