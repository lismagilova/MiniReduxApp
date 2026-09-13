export function normalizeTitle(title) {
  const result = typeof title === 'string' ? title.trim() : '';
  if (!result) throw new Error('напиши название задачи');
  if (result.length > 100) throw new Error('название слишком длинное, максимум 100 символов');
  return result;
}
export function selectTasks(tasks, route) {
  if (route === '/active') return tasks.filter(task => !task.done);
  if (route === '/done') return tasks.filter(task => task.done);
  return tasks;
}
export function taskStats(tasks) {
  const done = tasks.filter(task => task.done).length;
  return { total: tasks.length, done, active: tasks.length - done };
}
