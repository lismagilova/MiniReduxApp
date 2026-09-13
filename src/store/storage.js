import { normalizeTitle } from '../model/tasks.js';
export const STORAGE_KEY = 'mini-redux-tasks-v1';
export function loadTasks(storage) {
  try {
    const tasks = JSON.parse(storage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(tasks)) return [];
    const ids = new Set();
    return tasks.filter(task => {
      if (!task || typeof task.id !== 'string' || !task.id || ids.has(task.id) || typeof task.done !== 'boolean') return false;
      try { if (normalizeTitle(task.title) !== task.title) return false; } catch { return false; }
      ids.add(task.id); return true;
    });
  } catch { return []; }
}
export function saveTasks(storage, tasks) {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(tasks)); return true; }
  catch { return false; }
}
