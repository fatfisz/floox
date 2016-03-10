function addDispatcherAction(internals, actionName) {
  const dispatcherActions = internals.dispatcherActions;
  const actions = internals.actions;
  const dispatcherAction = internals.dispatch.bind(null, actionName);

  dispatcherActions[actionName] = dispatcherAction;

  if (!actions.hasOwnProperty(actionName)) {
    actions[actionName] = dispatcherAction;
  }
}

export default function setupStoreActionMapping(handlers, internals) {
  const mapping = internals.actionMapping;
  const dispatcherActions = internals.dispatcherActions;

  Object.keys(handlers).forEach((actionName) => {
    const handler = handlers[actionName];

    if (!dispatcherActions.hasOwnProperty(actionName)) {
      addDispatcherAction(internals, actionName);
    }

    mapping[actionName] = handler;
  });
}
