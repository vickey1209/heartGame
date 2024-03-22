import logger from '../logger';
import { cardThrowHelperRequestIf } from '../interface/requestIf';
import Validator from '../Validator';
import cardThrow from '../play/cardThrow';

async function throwCardHandler(
  { data: cardData }: cardThrowHelperRequestIf,
  socket: any,
  ack?: Function,
) {
  const { eventMetaData }: any = socket;
  try {
    logger.info( ' call throwCardHandler : cardData :: ', cardData);

    cardData = await Validator.requestValidator.throwCardValidator(cardData);
    const data = {
      card: cardData.card,
    };

    return cardThrow(data, socket, ack)
      .catch((e: any) => logger.error(e));
  } catch (error) {
    logger.error( 
      `CATCH_ERROR : throwCardHandler :: userId: ${eventMetaData.userId} :: tableId: ${eventMetaData.tableId} :: `,
      cardData,
      error,
    );
  }
}

export = throwCardHandler;