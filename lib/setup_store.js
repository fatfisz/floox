import setupStoreActionMapping from './setup_store_action_mapping';
import setupStoreEvents from './setup_store_events';


function registerStoreInDispatcher(store, dispatcher, actionMapping) {
  return dispatcher.register((action) => {
    const { actionName } = action;

    if (actionMapping.hasOwnProperty(actionName)) {
      actionMapping[actionName].call(store, action.data);
    }
  });
}

export default function setupStore(store, internals) {
  const { handlers } = store;
  const actionMapping = {};
  const actionMappingInternals = {
    actionMapping,
    ...internals,
  };

  if (handlers) {
    setupStoreActionMapping(handlers, actionMappingInternals);
  }

  setupStoreEvents(store);

  return registerStoreInDispatcher(store, internals.dispatcher, actionMapping);
}
