import { Loading as AelfdLoading } from 'aelf-design';
import { createRoot, Root } from 'react-dom/client';

class Loading {
  private container: HTMLDivElement | null = null;
  private root: Root | null = null;
  private content?: string | React.ReactNode;

  constructor(props?: string | React.ReactNode) {
    this.content = props;
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
    this.root?.render(<AelfdLoading open={visible} content={this.content} />);
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
