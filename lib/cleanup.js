export default function cleanup(data) {
  // Clone callbacks, as they might contain calls to `setState`
  const callbacks = [...data.callbacks];

  data.isSetting = false;
  data.partialStates.length = 0;
  data.callbacks.length = 0;

  callbacks.forEach((callback) => {
    callback();
  });
}
