import cleanup from './cleanup';
import listenersCallback from './listeners_callback';


export default function applyChanges(data) {
  const { combineState, listeners } = data;
  let { state } = data;

  data.isSetting = true;
  data.partialStates.forEach((partialState) => {
    state = combineState(state, partialState);
  });
  data.state = state;

  if (listeners.size === 0) {
    cleanup(data);
    return;
  }

  // Guard against synchronous listeners calling "cleanup" too early
  data.listenersLeft = 1;
  listeners.forEach((listener) => {
    data.listenersLeft += 1;
    listener(() => {
      listenersCallback(data);
    });
  });
  // The "last listener":
  listenersCallback(data);
}
