import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore, combineReducers } from '../src/core/store.js';
import { tasksReducer, rootReducer } from '../src/store/reducers.js';
import { normalizeTitle, selectTasks, taskStats } from '../src/model/tasks.js';
import { TaskController } from '../src/controller/TaskController.js';
import { loadTasks, saveTasks } from '../src/store/storage.js';
import { clone, deepEqual, debounce } from '../src/utils/index.js';
import { Router } from '../src/router/Router.js';

test('reducer: добавление, редактирование, выполнение и удаление без мутации', () => {
  const original = Object.freeze([]);
  let tasks = tasksReducer(original, { type: 'TASK_ADD', payload: { id: '1', title: '  учиться  ' } });
  assert.deepEqual(tasks, [{ id: '1', title: 'учиться', done: false }]);
  Object.freeze(tasks[0]); Object.freeze(tasks);
  const edited = tasksReducer(tasks, { type: 'TASK_EDIT', payload: { id: '1', title: 'защита' } });
  assert.equal(tasks[0].title, 'учиться'); assert.equal(edited[0].title, 'защита');
  tasks = tasksReducer(edited, { type: 'TASK_TOGGLE', payload: '1' }); assert.equal(tasks[0].done, true);
  tasks = tasksReducer(tasks, { type: 'TASK_DELETE', payload: '1' }); assert.deepEqual(tasks, []);
  assert.equal(tasksReducer(original, { type: 'UNKNOWN' }), original);
});
test('reducer: повторный id и отсутствующие сущности', () => {
  const tasks = [{ id: '1', title: 'тест', done: false }];
  assert.equal(tasksReducer(tasks, { type: 'TASK_ADD', payload: { id: '1', title: 'другой' } }), tasks);
  for (const type of ['TASK_DELETE', 'TASK_TOGGLE']) assert.deepEqual(tasksReducer(tasks, { type, payload: 'missing' }), tasks);
  assert.throws(() => tasksReducer([], { type: 'TASK_ADD', payload: { id: '2', title: ' ' } }));
});
test('store: initial state, dispatch, подписка и отписка', () => {
  const store = createStore(rootReducer); let calls = 0;
  assert.deepEqual(store.getState(), { tasks: [], route: '/' });
  const off = store.subscribe(() => calls++);
  const action = { type: 'ROUTE_CHANGE', payload: '/done' };
  assert.equal(store.dispatch(action), action); assert.equal(store.getState().route, '/done');
  assert.equal(calls, 1); off(); off(); store.dispatch({ type: 'UNKNOWN' }); assert.equal(calls, 1);
  assert.throws(() => store.dispatch({}));
});
test('combineReducers: срезы независимы, неизвестный action сохраняет ссылку', () => {
  const reducer = combineReducers({ count: (s = 0, a) => a.type === 'INC' ? s + 1 : s, label: (s = 'a') => s });
  const state = reducer(undefined, {}); assert.equal(reducer(state, {}), state);
  assert.deepEqual(reducer(state, { type: 'INC' }), { count: 1, label: 'a' });
});
test('валидация названия: пробелы, пустое значение, предел длины', () => {
  assert.equal(normalizeTitle(' a '), 'a'); assert.equal(normalizeTitle('a'.repeat(100)).length, 100);
  for (const value of ['', '   ', null, 'a'.repeat(101)]) assert.throws(() => normalizeTitle(value));
});
test('бизнес-логика: фильтры и счётчики', () => {
  const tasks = [{ id: '1', done: false }, { id: '2', done: true }];
  assert.equal(selectTasks(tasks, '/'), tasks);
  assert.deepEqual(selectTasks(tasks, '/active'), [tasks[0]]);
  assert.deepEqual(selectTasks(tasks, '/done'), [tasks[1]]);
  assert.deepEqual(taskStats(tasks), { total: 2, done: 1, active: 1 });
  assert.deepEqual(taskStats([]), { total: 0, done: 0, active: 0 });
});
test('controller: полный цикл и отклонение пустой задачи', () => {
  const store = createStore(rootReducer); const controller = new TaskController(store);
  controller.add(' задача '); const id = store.getState().tasks[0].id;
  controller.edit(id, 'новая'); controller.toggle(id);
  assert.deepEqual(store.getState().tasks[0], { id, title: 'новая', done: true });
  assert.throws(() => controller.add(' ')); assert.equal(store.getState().tasks.length, 1);
  controller.remove(id); assert.equal(store.getState().tasks.length, 0);
});
test('storage: сохранение, повреждённые данные и недоступное хранилище', () => {
  let data; const storage = { getItem: () => data, setItem: (key, value) => { data = value; } };
  const tasks = [{ id: '1', title: 'тест', done: false }];
  assert.equal(saveTasks(storage, tasks), true); assert.deepEqual(loadTasks(storage), tasks);
  data = '{'; assert.deepEqual(loadTasks(storage), []);
  data = '{}'; assert.deepEqual(loadTasks(storage), []);
  data = JSON.stringify([...tasks, ...tasks, { id: '2', title: '', done: false }, null]); assert.deepEqual(loadTasks(storage), tasks);
  assert.deepEqual(loadTasks(null), []); assert.equal(saveTasks(null, tasks), false);
});
test('clone: вложенные данные копируются независимо', () => {
  const source = { tasks: [{ title: 'a' }], flag: null }; const copy = clone(source);
  assert.deepEqual(copy, source); copy.tasks[0].title = 'b'; assert.equal(source.tasks[0].title, 'a');
  assert.equal(clone(undefined), undefined);
});
test('deepEqual: вложенные данные, порядок ключей, разные типы', () => {
  assert.equal(deepEqual({ a: [1, null], b: true }, { b: true, a: [1, null] }), true);
  assert.equal(deepEqual([1], { 0: 1 }), false); assert.equal(deepEqual({ a: undefined }, { b: undefined }), false);
  assert.equal(deepEqual({ a: 1 }, { a: 2 }), false); assert.equal(deepEqual(null, {}), false);
});
test('debounce: последний вызов, аргументы, this и отмена', context => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const calls = []; const object = { run: debounce(function(value) { calls.push([this, value]); }, 50) };
  object.run(1); context.mock.timers.tick(25); object.run(2);
  context.mock.timers.tick(49); assert.equal(calls.length, 0);
  context.mock.timers.tick(1); assert.equal(calls.length, 1); assert.equal(calls[0][0], object); assert.equal(calls[0][1], 2);
  object.run(3); object.run.cancel(); context.mock.timers.tick(100); assert.equal(calls.length, 1);
});
test('router: начальный маршрут, hashchange и stop', () => {
  const browser = new EventTarget(); browser.location = { hash: '' }; const routes = [];
  const router = new Router(route => routes.push(route), browser); router.start();
  browser.location.hash = '#/done'; browser.dispatchEvent(new Event('hashchange'));
  router.stop(); browser.location.hash = '#/active'; browser.dispatchEvent(new Event('hashchange'));
  assert.deepEqual(routes, ['/', '/done']);
});
