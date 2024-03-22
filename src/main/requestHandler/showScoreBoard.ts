import logger from '../logger';
import Validator from '../Validator';
import { showUserScoreHelperIf } from '../interface/userScoreIf';
import showScoreBoard from '../play/scoreOfRound/showScoreBoard';

async function showScoreBoardHandler(
  { data }: showUserScoreHelperIf,
  socket: any,
  ack?: Function,
) {
  const { eventMetaData }: any = socket;
  try {
    data = await Validator.requestValidator.showScoreValidator(data);
    return showScoreBoard(data, socket, ack)
      .catch((e: any) => logger.error(e));
  } catch (error) {
    logger.error(`CATCH_ERROR : showScoreBoardHandler :: userId: ${eventMetaData.userId} :: tableId: ${eventMetaData.tableId} :: `,
      data,
      error,
    );
    return error;
  }
}

export = showScoreBoardHandler;
