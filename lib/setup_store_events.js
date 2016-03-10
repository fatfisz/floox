import { EventEmitter } from 'events';


const defaultEvents = ['change'];

export default function setupStoreEvents(store, name) {
  const eventEmitter = new EventEmitter();

  const events = store.hasOwnProperty('events') ? store.events : defaultEvents;

  if (process.env.NODE_ENV !== 'production' &&
      !Array.isArray(events) || !events.length) {
    throw new Error(
      `The "events" property in store "${name}" should be a non-empty array`
    );
  }

  if (store.hasOwnProperty('maxListeners')) {
    eventEmitter.setMaxListeners(store.maxListeners);
  }

  store.emit = function (event) {
    if (process.env.NODE_ENV !== 'production' &&
        events.indexOf(event) === -1) {
      throw new Error(
        `Store "${name}" does not handle the event "${event}"`
      );
    }

    eventEmitter.emit(event);
  };

  store.on = function (event, handler) {
    if (process.env.NODE_ENV !== 'production' &&
        events.indexOf(event) === -1) {
      throw new Error(
        `Store "${name}" does not handle the event "${event}"`
      );
    }

    eventEmitter.on(event, handler);
  };

  store.off = function (event, handler) {
    if (process.env.NODE_ENV !== 'production' &&
        events.indexOf(event) === -1) {
      throw new Error(
        `Store "${name}" does not handle the event "${event}"`
      );
    }

    eventEmitter.removeListener(event, handler);
  };
}
