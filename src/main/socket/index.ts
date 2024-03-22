import { socketConnection } from '../../connections/socket';
import logger from '../logger';

async function sendEventToClient(socket: any, data: any) {
  try {
    const { socketClient }: any = socketConnection;
    if (data.en != 'HEART_BEAT') {
      logger.debug("---------------------------------------------------------------------------------------------------------------------------");
      logger.debug(' SEND EVENT TO CLIENT  :: ', data?.en , " :: =>>",  data);
      logger.debug("---------------------------------------------------------------------------------------------------------------------------");
    }
    let encData = JSON.stringify(data);
    if (typeof socket !== 'string' && socket.emit)
      socket.emit(data.en, encData);
    else socketClient.to(socket).emit(data.en, encData);
  } catch (error) {
    logger.error('CATCH_ERROR : sendEventToClient : error :: ', error);
  }
}

async function sendEventToRoom(roomId: any, data: any) {
  const { socketClient }: any = socketConnection;
  logger.debug("----------------------------------------------------------------------------------------------------------------------------------");
  logger.debug(' SEND EVENT TO ROOM roomId socketClient :: ', typeof socketClient);
  logger.debug(' SEND EVENT TO ROOM roomId ::', roomId);
  logger.debug(' SEND EVENT TO ROOM :: ', data?.en, " :: ==>>",  data);
  logger.debug("----------------------------------------------------------------------------------------------------------------------------------");

  let encData = JSON.stringify(data);
  socketClient.to(roomId).emit(data.en, encData);
}

function addClientInRoom(socket: any, roomId: any) {
  return socket.join(roomId);
  // if (socket.id !== 'FTUE_BOT_ID' && socket.id !== BOT.ID) return socket.join(roomId);
  // else return true;
}

async function leaveClientInRoom(socket: any, roomId: any) {
  socket = await getSocketFromSocketId(socket);
  if (typeof socket != 'undefined' && socket.emit) socket.leave(roomId);
}

function getAllSocketsInTable(roomId: any) {
  const { socketClient }: any = socketConnection;
  return socketClient.in(roomId).allSockets();
}

function getSocketFromSocketId(socketId: any) {
  const { socketClient }: any = socketConnection;
  return socketClient.sockets.sockets.get(socketId);
}

const exportObject = {
  getSocketFromSocketId,
  getAllSocketsInTable,
  sendEventToClient,
  sendEventToRoom,
  addClientInRoom,
  leaveClientInRoom,
};
export = exportObject;
