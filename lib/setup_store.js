import setupStoreActionMapping from './setup_store_action_mapping';
import setupStoreEvents from './setup_store_events';
import waitFor from './wait_for';


function registerStoreInDispatcher(store, dispatcher, actionMapping) {
  return dispatcher.register((action) => {
    const { actionName } = action;

    if (actionMapping.hasOwnProperty(actionName)) {
      actionMapping[actionName].call(store, action.data);
    }
  });
}

export default function setupStore(store, name, internals) {
  const handlers = store.handlers;
  const actionMapping = {};
  const actionMappingInternals = {
    name,
    actionMapping,
    ...internals,
  };

  if (handlers) {
    setupStoreActionMapping(handlers, actionMappingInternals);
    store.waitFor = waitFor.bind(null, internals);
  }

  setupStoreEvents(store, name);

  return registerStoreInDispatcher(store, internals.dispatcher, actionMapping);
}
