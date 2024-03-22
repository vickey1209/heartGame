import logger from '../logger';
import backInGamePlaying from '../play/rejoinTable/backInGamePlaying';

function backInGamePlayingHandler(data: any, socket: any, ack?: Function) {
  try {
    logger.info('call backInGamePlayingHandler :: data :: ', data);

    return backInGamePlaying(socket, ack).catch((e: any) => logger.error(e));
  } catch (error) {
    logger.error(`CATCH_ERROR :: backInGamePlayingHandler :: --->>`, error);
  }
}

export = backInGamePlayingHandler;
