import { Namespace, Socket } from 'socket.io';

interface props {
  callback: (data: unknown, socketId: string) => void;
  eventName: string;
  exceptionSocket: Socket;
  namespace: Namespace;
}

export function onEverySocketExceptOne({
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

export function onEverySocketInNamespace({
  callback,
  eventName,
  namespace,
}: props) {
  namespace.sockets.forEach((socket) => {
    socket.on(eventName, (data) => callback(data, socket.id));
  });
}

export function onceEverySocketExceptOne({
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

export function onceEverySocketInNamespace({
  callback,
  eventName,
  namespace,
}: props) {
  namespace.sockets.forEach((socket) => {
    socket.once(eventName, (data) => callback(data, socket.id));
  });
}
