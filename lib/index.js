import { Dispatcher } from 'flux';

import createAction from './create_action';
import createMixin from './create_mixin';
import setupStore from './setup_store';


export default function createFloox(store) {
  const dispatcher = new Dispatcher();
  const actions = {};
  const internals = {
    store,
    dispatcher,
    dispatch(actionName, data) {
      dispatcher.dispatch({
        actionName,
        data,
      });
    },
    dispatcherActions: {},
    actions,
  };

  setupStore(store, internals);

  return {
    store,
    actions,
    createAction: createAction.bind(null, internals),
    StateFromStoreMixin: createMixin(internals),
  };
}
