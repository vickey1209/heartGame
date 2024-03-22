import logger from '../logger';
import { preCardPassSelectHelperRequestIf } from '../interface/requestIf';
import Validator from '../Validator';
import { preCardPass } from '../play/cardPass/preCardPass';

async function preCardPassSelectHandler(
  { data: preCardPassData }: preCardPassSelectHelperRequestIf,
  socket: any,
  ack?: Function,
) {
  const { eventMetaData }: any = socket;
  const tableId = socket.tableId || preCardPassData.tableId;
  try {
    preCardPassData = await Validator.requestValidator.preCardPassSelectValidator(preCardPassData);
    return preCardPass(socket, preCardPassData).catch(
      (e: any) => logger.error(e),
    );
  } catch (error) {
    logger.error(tableId, 
      `CATCH_ERROR : preCardPassSelectHandler :: tableId: ${tableId} :: userId: ${eventMetaData.userId}`,
      preCardPassData,
      error,
    );
    return error;
  }
}

export = preCardPassSelectHandler;