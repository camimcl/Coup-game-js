import { Namespace, Socket } from 'socket.io';

interface props {
  callback: (data: unknown, socketId: string) => void;
  eventName: string;
  exceptionSocket: Socket;
  namespace: Namespace;
}

export function listenOnEverySocketExcept({
  callback,
  eventName,
  exceptionSocket,
  namespace,
}: props) {
  namespace.sockets.forEach((socket) => {
    if (socket.id === exceptionSocket.id) {
      return;
    }

    socket.on(eventName, (data) => callback(data, socket.id));
  });
}

export function listenOnEverySocket({
  callback,
  eventName,
  namespace,
}: props) {
  namespace.sockets.forEach((socket) => {
    socket.on(eventName, (data) => callback(data, socket.id));
  });
}

export function listenOnceEverySocketExcept({
  callback,
  eventName,
  exceptionSocket,
  namespace,
}: props) {
  namespace.sockets.forEach((socket) => {
    if (socket.id === exceptionSocket.id) {
      return;
    }

    socket.once(eventName, (data) => callback(data, socket.id));
  });
}

export function listenOnceEverySocket({
  callback,
  eventName,
  namespace,
}: props) {
  namespace.sockets.forEach((socket) => {
    socket.once(eventName, (data) => callback(data, socket.id));
  });
}
