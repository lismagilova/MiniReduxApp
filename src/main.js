import { createStore } from './core/store.js';
import { rootReducer } from './store/reducers.js';
import { loadTasks, saveTasks } from './store/storage.js';
import { Router } from './router/Router.js';
import { TaskController } from './controller/TaskController.js';
import { AppView } from './view/AppView.js';
import { applyStyles } from './view/styles.js';
// html/head/body создаются парсером браузера + содержимое создаём только через js
document.documentElement.setAttribute('lang', 'ru');
document.title = 'minireduxapp — задачи';
const charset = document.createElement('meta'); charset.setAttribute('charset', 'UTF-8'); document.head.appendChild(charset);
const viewport = document.createElement('meta'); viewport.name = 'viewport'; viewport.content = 'width=device-width, initial-scale=1'; document.head.appendChild(viewport);
if (!document.body) document.documentElement.appendChild(document.createElement('body'));
applyStyles();
let storage;
try { storage = window.localStorage; } catch { storage = null; }
const store = createStore(rootReducer, { tasks: loadTasks(storage), route: '/' });
const controller = new TaskController(store);
const view = new AppView(store, controller);
const router = new Router(route => store.dispatch({ type: 'ROUTE_CHANGE', payload: route }));
router.start();
view.mount(document.body);
let lastTasks = store.getState().tasks;
if (!storage) view.storageMessage.textContent = 'не получилось открыть хранилище. после перезагрузки задачи пропадут((';
const unsubscribe = store.subscribe(() => {
  const tasks = store.getState().tasks;
  if (tasks === lastTasks) return;
  lastTasks = tasks;
  view.storageMessage.textContent = saveTasks(storage, tasks) ? '' : 'не получилось сохранить задачи. после перезагрузки они пропадут((';
});
if (import.meta.hot) import.meta.hot.dispose(() => { unsubscribe(); router.stop(); view.unmount(); });
