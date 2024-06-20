import { createRoot, Root } from 'react-dom/client';

class Loading {
  private container: HTMLDivElement | null = null;
  private root: Root | null = null;
  private renderNode: React.ReactNode;

  constructor(props: React.ReactNode) {
    this.renderNode = props;
  }

  private createContainer() {
    if (!this.container) {
      this.container = document.createElement('div');
      document.body.appendChild(this.container);
      this.root = createRoot(this.container);
    }
  }

  private renderLoading(visible: boolean) {
    this.createContainer();

    this.root?.render(visible ? this.renderNode : null);
  }

  show() {
    this.renderLoading(true);
  }

  hide() {
    this.renderLoading(false);
    if (this.container) {
      this.root?.unmount();
      document.body.removeChild(this.container);
      this.container = null;
      this.root = null;
    }
  }
}

export { Loading };
