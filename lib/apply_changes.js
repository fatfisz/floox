import cleanup from './cleanup';
import listenersCallback from './listeners_callback';


export default function applyChanges(data) {
  const { combineState, listeners } = data;
  const listenersLeft = listeners.size;

  data.isSetting = true;

  let { state } = data;
  data.partialStates.forEach((partialState) => {
    state = combineState(state, partialState);
  });
  data.state = state;

  if (listenersLeft === 0) {
    cleanup(data);
    return;
  }

  data.listenersLeft = listenersLeft;
  listeners.forEach((listener) => {
    listener(() => {
      listenersCallback(data);
    });
  });
}
