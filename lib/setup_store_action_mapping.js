import nsProps from 'ns-props';

import forEachNestedProperty from './for_each_nested_property';


function addDispatcherAction(internals, actionName) {
  const dispatcherActions = internals.dispatcherActions;
  const actions = internals.actions;
  const dispatcherAction = internals.dispatch.bind(null, actionName);

  nsProps.set(dispatcherActions, actionName, dispatcherAction);

  if (!nsProps.has(actions, actionName)) {
    nsProps.set(actions, actionName, dispatcherAction);
  }
}

export default function setupStoreActionMapping(handlers, internals) {
  const mapping = internals.actionMapping;
  const dispatcherActions = internals.dispatcherActions;

  forEachNestedProperty(handlers, (actionName, handler) => {
    if (process.env.NODE_ENV !== 'production' &&
        mapping.hasOwnProperty(actionName)) {
      throw new Error(
        `Store "${internals.name}" has duplicate action handlers "${actionName}"`
      );
    }

    if (!nsProps.has(dispatcherActions, actionName)) {
      addDispatcherAction(internals, actionName);
    } else if (process.env.NODE_ENV !== 'production' &&
               typeof nsProps.get(dispatcherActions, actionName) !== 'function') {
      throw new Error(
        `Can\'t name a handler the same as an existing namespace "${actionName}"`
      );
    }

    mapping[actionName] = handler;
  });
}
