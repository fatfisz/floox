const defaultEvents = ['change'];

class EventEmitter {
  constructor(events) {
    if (process.env.NODE_ENV !== 'production' &&
        !Array.isArray(events) || !events.length) {
      throw new Error('Expected a non-empty array');
    }

    this.events = events.reduce((acc, event) => {
      acc[`event_${event}`] = [];
      return acc;
    }, {});
  }

  getHandlers(event) {
    const handlers = this.events[`event_${event}`];

    if (process.env.NODE_ENV !== 'production' && !handlers) {
      throw new Error(`Unknown event "${event}"`);
    }

    return handlers;
  }

  emit(event) {
    [...this.getHandlers(event)].forEach((handler) => handler());
  }

  on(event, handler) {
    const handlers = this.getHandlers(event);

    if (handlers.indexOf(handler) === -1) {
      handlers.push(handler);
    }
  }

  off(event, handler) {
    const handlers = this.getHandlers(event);
    const index = handlers.indexOf(handler);
    const { length } = handlers;

    if (index !== -1) {
      if (index !== length - 1) {
        handlers[index] = handlers[length - 1];
      }

      handlers.pop();
    }
  }
}

export default function setupStoreEvents(store) {
  const events = store.hasOwnProperty('events') ? store.events : defaultEvents;
  const eventEmitter = new EventEmitter(events);

  store.emit = eventEmitter.emit.bind(eventEmitter);
  store.on = eventEmitter.on.bind(eventEmitter);
  store.off = eventEmitter.off.bind(eventEmitter);
}
