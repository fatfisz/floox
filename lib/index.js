import { Dispatcher } from 'flux';

import createAction from './create_action';
import createMixin from './create_mixin';
import createStore from './create_store';
import dispatch from './dispatch';


export default function createFloox(store) {
  const dispatcher = new Dispatcher();

  const internals = {
    dispatcher,
    dispatch: dispatch.bind(null, dispatcher),
    dispatcherActions: {},
    actions: {},
  };

  const mixin = createMixin(internals);

  createStore(internals, store);

  return {
    store: internals.store,
    actions: internals.actions,
    createAction: createAction.bind(null, internals),
    StateFromStoreMixin: mixin,
  };
}
