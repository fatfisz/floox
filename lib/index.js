import createAction from './create_action';
import createMixin from './create_mixin';
import setupStoreActionMapping from './setup_store_action_mapping';
import setupStoreEvents from './setup_store_events';

export default function createFloox(store) {
  const actions = {};
  const internals = {
    store,
    dispatch(actionName, data) {
      if (dispatching) {
        throw new Error('Cannot dispatch in the middle of a dispatch.');
      }

      dispatching = true;

      if (internals.actionMapping.hasOwnProperty(actionName)) {
        internals.actionMapping[actionName].call(store, data);
      }

      dispatching = false;
    },
    actionMapping: {},
    dispatcherActions: {},
    actions,
  };
  let dispatching = false;

  const { handlers } = store;

  if (handlers) {
    setupStoreActionMapping(handlers, internals);
  }

  setupStoreEvents(store);

  return {
    store,
    actions,
    createAction(name, action) {
      return createAction(internals, name, action);
    },
    StateFromStoreMixin: createMixin(internals),
  };
}
