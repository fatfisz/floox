import { Dispatcher } from 'flux';

import createAction from './create_action';
import createMixin from './create_mixin';
import createStore from './create_store';
import dispatch from './dispatch';


export default function createFloox() {
  const dispatcher = new Dispatcher();

  const internals = {
    dispatcher,
    dispatch: dispatch.bind(null, dispatcher),
    stores: {},
    storesByName: {},
    dispatchTokens: {},
    dispatcherActions: {},
    actions: {},
  };

  const mixin = createMixin(internals);

  return {
    stores: internals.stores,
    actions: internals.actions,
    createStore: createStore.bind(null, internals),
    createAction: createAction.bind(null, internals),
    StateFromStoreMixin: mixin,
  };
}
