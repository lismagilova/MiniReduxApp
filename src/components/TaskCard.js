import { BaseComponent } from '../core/BaseComponent.js';
import { el } from '../utils/dom.js';
export class TaskCard extends BaseComponent {
  constructor(task, controller) { super(); this.task = task; this.controller = controller; }
  render() {
    const card = el('li', undefined, 'task');
    const check = el('input'); check.type = 'checkbox'; check.checked = this.task.done;
    check.setAttribute('aria-label', `выполнено: ${this.task.title}`);
    this.listen(check, 'change', () => this.controller.toggle(this.task.id));
    const title = el('span', this.task.title, this.task.done ? 'title done' : 'title');
    const edit = el('button', 'изменить');
    this.listen(edit, 'click', () => this.showEditor(card));
    const remove = el('button', 'удалить');
    this.listen(remove, 'click', () => this.controller.remove(this.task.id));
    card.appendChild(check); card.appendChild(title); card.appendChild(edit); card.appendChild(remove);
    return card;
  }
  showEditor(card) {
    // форма редактирования - локальное состояние компонента
    card.replaceChildren();
    const form = el('form', undefined, 'edit-form');
    const input = el('input'); input.value = this.task.title; input.maxLength = 100; input.required = true;
    input.setAttribute('aria-label', 'новое название');
    const save = el('button', 'сохранить'); save.type = 'submit';
    const cancel = el('button', 'отмена'); cancel.type = 'button';
    const error = el('span', '', 'error'); error.setAttribute('role', 'alert');
    this.listen(form, 'submit', event => {
      event.preventDefault();
      try { this.controller.edit(this.task.id, input.value); } catch (e) { error.textContent = e.message; }
    });
    this.listen(cancel, 'click', () => { const parent = card.parentNode; const next = card.nextSibling; this.unmount(); this.mount(parent); parent.insertBefore(this.element, next); });
    form.append(input, save, cancel, error); card.appendChild(form); input.focus();
  }
}
