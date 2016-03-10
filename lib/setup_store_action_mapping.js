export default function setupStoreActionMapping(handlers, internals) {
  const { actions, actionMapping, dispatch, dispatcherActions } = internals;

  Object.keys(handlers).forEach((actionName) => {
    const handler = handlers[actionName];

    if (!dispatcherActions.hasOwnProperty(actionName)) {
      const dispatcherAction = dispatch.bind(null, actionName);

      dispatcherActions[actionName] = dispatcherAction;

      if (!actions.hasOwnProperty(actionName)) {
        actions[actionName] = dispatcherAction;
      }
    }

    actionMapping[actionName] = handler;
  });
}
