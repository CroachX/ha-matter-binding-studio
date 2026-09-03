import { createRoot, type Root } from "react-dom/client";
import App, { type HomeAssistant } from "./App";
import styles from "./styles.css?inline";

class MatterBindingStudioPanel extends HTMLElement {
  private root?: Root;
  private hassValue?: HomeAssistant;

  set hass(value: HomeAssistant) {
    this.hassValue = value;
    this.renderPanel();
  }

  connectedCallback() {
    if (!this.root) {
      const style = document.createElement("style");
      style.textContent = styles;
      const mount = document.createElement("div");
      this.replaceChildren(style, mount);
      this.root = createRoot(mount);
    }
    this.renderPanel();
  }

  disconnectedCallback() {
    this.root?.unmount();
    this.root = undefined;
  }

  private renderPanel() {
    this.root?.render(<App hass={this.hassValue} />);
  }
}

customElements.define("matter-binding-studio-panel", MatterBindingStudioPanel);
