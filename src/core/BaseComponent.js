export class BaseComponent {
  constructor() { this.element = null; this.cleanups = []; }
  listen(element, event, handler) {
    element.addEventListener(event, handler);
    this.cleanups.push(() => element.removeEventListener(event, handler));
  }
  mount(parent) { this.element = this.render(); parent.appendChild(this.element); }
  unmount() {
    this.cleanups.forEach(cleanup => cleanup());
    this.cleanups = [];
    this.element?.remove();
    this.element = null;
  }
}
