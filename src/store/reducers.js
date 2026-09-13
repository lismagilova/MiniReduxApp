import { combineReducers } from '../core/store.js';
import { normalizeTitle } from '../model/tasks.js';
export function tasksReducer(state = [], action) {
  switch (action.type) {
    case 'TASK_ADD':
      if (state.some(task => task.id === action.payload.id)) return state;
      return [...state, { id: action.payload.id, title: normalizeTitle(action.payload.title), done: false }];
    case 'TASK_EDIT': return state.map(task => task.id === action.payload.id ? { ...task, title: normalizeTitle(action.payload.title) } : task);
    case 'TASK_TOGGLE': return state.map(task => task.id === action.payload ? { ...task, done: !task.done } : task);
    case 'TASK_DELETE': return state.filter(task => task.id !== action.payload);
    default: return state;
  }
}
export function routeReducer(state = '/', action) {
  return action.type === 'ROUTE_CHANGE' ? action.payload : state;
}
export const rootReducer = combineReducers({ tasks: tasksReducer, route: routeReducer });
