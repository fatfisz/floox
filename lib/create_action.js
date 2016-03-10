import nsProps from 'ns-props';


export default function createAction(internals, name, action) {
  const dispatcherActions = internals.dispatcherActions;
  const actions = internals.actions;

  if (process.env.NODE_ENV !== 'production' &&
      nsProps.has(actions, name) && (
        !nsProps.has(dispatcherActions, name) ||
        nsProps.get(actions, name) !== nsProps.get(dispatcherActions, name)
      )) {
    throw new Error(`Action "${name}" is already registered`);
  }

  const boundAction = action.bind(null, dispatcherActions);

  nsProps.set(actions, name, boundAction);

  return action;
}
