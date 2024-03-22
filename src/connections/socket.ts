import { Server } from "socket.io";
import logger from "../main/logger";
import { redisConnection } from './redis';
import { MESSAGES, NUMERICAL, SOCKET } from "../constants";
const { createAdapter } = require('@socket.io/redis-adapter');
import server from './http';
import requestHandler from "../main/requestHandler";
import userDisconnect from "../main/signUp/userDisconnect";

class SocketConnection {
  private socketClientIo: any;
  constructor() {

  }
  async socketConnect() {

      const pubClient = redisConnection.redisPubClient;
      const subClient = redisConnection.redisSubClient;
      // console.log(`---------------- pubClient :: `, pubClient)

      if (!pubClient || !subClient) {
          process.exit(1);
      }

      const socketConfig = {
          transports: [SOCKET.WEBSOCKET, SOCKET.POLLING],
          pingInterval: 4000, // to send ping/pong events for specific interval (milliseconds)
          pingTimeout: NUMERICAL.TEN_THOUSAND, // if ping is not received in the "pingInterval" seconds then milliseconds will be disconnected in "pingTimeout" milliseconds
          allowEIO3: true,
      };

      this.socketClientIo = new Server(server, socketConfig);

      this.socketClientIo.adapter(createAdapter(pubClient, subClient));

      this.socketClientIo.on(SOCKET.CONNECTION, this.connectionCB);

  }

  async connectionCB(client: any) {

      try {
          logger.info(MESSAGES.SOCKET.INTERNAL.NEW_CONNECTION, " clientId :: ==>> ", client.id);

          const token = client.handshake.auth.token;
          const userId = client.handshake.auth.userId; // remove
          logger.info(' connection token ::---->> ', token);
          logger.info(' connection userId ::---->> ', userId);
          client.authToken = token;
          
          // client.conn is default menthod for ping pong request
          client.conn.on(SOCKET.PACKET, (packet: any) => {
            if (packet.type === 'ping') { }
          });
        
          client.on(SOCKET.ERROR, (error: any) =>
            logger.error('CATCH_ERROR : Socket : client error......,', error),
          );
        
          client.on(SOCKET.DISCONNECT, async () => {
            // DISCONNECT HANDLE
            userDisconnect(client);
          });
        
          client.use(requestHandler.bind(client));

      } catch (error) {
          console.log("error: ", error);
      }

  }

  get socketClient() {
      return this.socketClientIo;
  }
}

export const socketConnection = new SocketConnection();
