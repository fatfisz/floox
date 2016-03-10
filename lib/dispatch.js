export default function dispatch(dispatcher, actionName, data) {
  dispatcher.dispatch({
    actionName,
    data,
  });
}
