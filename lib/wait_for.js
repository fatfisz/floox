export default function waitFor(internals, storeNames) {
  if (process.env.NODE_ENV !== 'production' &&
      !Array.isArray(storeNames) || !storeNames.length) {
    throw new Error(
      'The only argument to "waitFor" should be a non-empty array.'
    );
  }

  const { dispatchTokens } = internals;

  internals.dispatcher.waitFor(storeNames.map((name) => {
    if (process.env.NODE_ENV !== 'production' &&
        !dispatchTokens.hasOwnProperty(name)) {
      throw new Error(`Store "${name}" is not registered`);
    }

    return dispatchTokens[name];
  }));
}
