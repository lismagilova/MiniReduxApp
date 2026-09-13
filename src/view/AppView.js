import { BaseComponent } from '../core/BaseComponent.js';
import { TaskCard } from '../components/TaskCard.js';
import { el } from '../utils/dom.js';
import { selectTasks, taskStats } from '../model/tasks.js';
export class AppView extends BaseComponent {
  constructor(store, controller) { super(); this.store = store; this.controller = controller; this.cards = []; }
  render() {
    const app = el('main', undefined, 'app');
    app.appendChild(el('h1', 'задачи'));
    const nav = el('nav'); nav.setAttribute('aria-label', 'страницы задач');
    this.links = [];
    for (const [route, label] of [['/', 'все задачи'], ['/active', 'активные'], ['/done', 'выполненные']]) {
      const link = el('a', label); link.setAttribute('href', `#${route}`); this.links.push([route, link]); nav.appendChild(link);
    }
    app.appendChild(nav);
    const form = el('form', undefined, 'add-form');
    this.input = el('input'); this.input.placeholder = 'что нужно сделать?'; this.input.maxLength = 100; this.input.required = true;
    this.input.setAttribute('aria-label', 'название задачи');
    const add = el('button', 'добавить'); add.type = 'submit';
    form.append(this.input, add);
    this.error = el('p', '', 'error'); this.error.setAttribute('role', 'alert');
    this.listen(form, 'submit', event => {
      event.preventDefault(); this.error.textContent = '';
      try { this.controller.add(this.input.value); this.input.value = ''; this.input.focus(); } catch (e) { this.error.textContent = e.message; }
    });
    app.append(form, this.error);
    this.stats = el('p', '', 'muted'); this.stats.setAttribute('aria-live', 'polite');
    this.heading = el('h2'); this.list = el('ul', undefined, 'tasks'); this.empty = el('p', '', 'empty');
    const panel = el('details', undefined, 'state'); panel.appendChild(el('summary', 'состояние приложения'));
    this.state = el('pre'); panel.appendChild(this.state);
    this.storageMessage = el('p', '', 'error'); this.storageMessage.setAttribute('role', 'status');
    app.append(this.stats, this.heading, this.list, this.empty, this.storageMessage, panel);
    return app;
  }
  mount(parent) { super.mount(parent); this.update(); this.unsubscribe = this.store.subscribe(() => this.update()); }
  update() {
    const state = this.store.getState(); const stats = taskStats(state.tasks);
    this.stats.textContent = `всего: ${stats.total} · активных: ${stats.active} · выполнено: ${stats.done}`;
    const names = { '/': 'все задачи', '/active': 'активные задачи', '/done': 'выполненные задачи' };
    this.heading.textContent = names[state.route] || 'страница не найдена';
    for (const [route, link] of this.links) {
      link.classList.toggle('selected', route === state.route);
      if (route === state.route) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    }
    this.cards.forEach(card => card.unmount()); this.cards = [];
    const tasks = names[state.route] ? selectTasks(state.tasks, state.route) : [];
    tasks.forEach(task => { const card = new TaskCard(task, this.controller); card.mount(this.list); this.cards.push(card); });
    this.empty.textContent = !names[state.route] ? 'такой страницы нет, выбери другую в меню.' : tasks.length ? '' : 'пока ничего нет';
    this.state.textContent = JSON.stringify(state, null, 2);
  }
  unmount() { this.unsubscribe?.(); this.cards.forEach(card => card.unmount()); super.unmount(); }
}
