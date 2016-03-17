export default function defaultCombineState(currentState, partialState) {
  if (typeof currentState !== 'object' || typeof partialState !== 'object' || currentState === null) {
    return partialState;
  }

  return Object.assign(currentState, partialState);
}
