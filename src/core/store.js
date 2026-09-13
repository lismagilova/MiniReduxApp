export function createStore(reducer, initialState) {
  let state = reducer(initialState, { type: '@@INIT' });
  const listeners = new Set();
  let reducing = false;
  return {
    getState: () => state,
    dispatch(action) {
      if (!action || typeof action.type !== 'string') throw new Error('у action должен быть строковый type');
      if (reducing) throw new Error('нельзя вызывать dispatch из reducer');
      try { reducing = true; state = reducer(state, action); }
      finally { reducing = false; }
      [...listeners].forEach(listener => listener());
      return action;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}
export function combineReducers(reducers) {
  return (state = {}, action) => {
    const next = {};
    let changed = Object.keys(state).length !== Object.keys(reducers).length;
    for (const key of Object.keys(reducers)) {
      next[key] = reducers[key](state[key], action);
      changed ||= next[key] !== state[key];
    }
    return changed ? next : state;
  };
}
