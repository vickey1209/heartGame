import socketAck from '../../socketAck';
import { EVENTS } from '../../constants';

function heartBeatHandle(data: any, socket: any, ack: any) {
  const response = data.data;
  socketAck.ackMid(
    EVENTS.HEART_BEAT_SOCKET_EVENT,
    response,
    socket.userId,
    response && 'tableId' in response ? response.tableId : '',
    ack,
  );
}

export = heartBeatHandle;
