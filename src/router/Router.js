export class Router {
  constructor(onChange, browser = window) {
    this.browser = browser;
    this.onChange = onChange;
    this.handle = () => this.onChange(this.browser.location.hash.slice(1) || '/');
  }
  start() { this.browser.addEventListener('hashchange', this.handle); this.handle(); }
  stop() { this.browser.removeEventListener('hashchange', this.handle); }
}
