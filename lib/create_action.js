export default function createAction(internals, name, action) {
  const { actions, dispatcherActions } = internals;

  if (process.env.NODE_ENV !== 'production' &&
      actions.hasOwnProperty(name) && (
        !dispatcherActions.hasOwnProperty(name) ||
        actions[name] !== dispatcherActions[name]
      )) {
    throw new Error(`Action "${name}" is already registered`);
  }

  const boundAction = action.bind(null, dispatcherActions);

  actions[name] = boundAction;

  return action;
}
