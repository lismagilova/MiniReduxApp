import { normalizeTitle } from '../model/tasks.js';
export class TaskController {
  constructor(store) { this.store = store; }
  add(title) { this.store.dispatch({ type: 'TASK_ADD', payload: { id: crypto.randomUUID(), title: normalizeTitle(title) } }); }
  edit(id, title) { this.store.dispatch({ type: 'TASK_EDIT', payload: { id, title: normalizeTitle(title) } }); }
  toggle(id) { this.store.dispatch({ type: 'TASK_TOGGLE', payload: id }); }
  remove(id) { this.store.dispatch({ type: 'TASK_DELETE', payload: id }); }
}
