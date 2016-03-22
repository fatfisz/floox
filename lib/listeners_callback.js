import cleanup from './cleanup';


export default function listenersCallback(data) {
  data.listenersLeft -= 1;
  if (data.listenersLeft !== 0) {
    return;
  }

  cleanup(data);
}
