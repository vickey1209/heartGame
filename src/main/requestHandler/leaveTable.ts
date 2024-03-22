import logger from '../logger';
import { PLAYER_STATE } from '../../constants';
import { leaveTableHelperRequestIf } from '../interface/requestIf';
import Validator from '../Validator';
import { leaveTable } from '../play/leaveTable';

async function leaveTableHandler(
  { data: tableData }: leaveTableHelperRequestIf,
  socket: any,
  ack?: Function,
) {
  const { eventMetaData }: any = socket;
  try {
    tableData = await Validator.requestValidator.leaveTableValidator(tableData);
    return leaveTable(tableData.tableId, PLAYER_STATE.LEFT, socket, ack, tableData.isLeaveFromScoreBoard).catch(
      (e: any) => logger.error(e),
    );
  } catch (error) {
    logger.error(tableData.tableId, 
      `CATCH_ERROR : leaveTableHandler :: tableId: ${tableData.tableId} :: userId: ${eventMetaData.userId}`,
      tableData,
      error,
    );
    return error;
  }
}

export = leaveTableHandler;
