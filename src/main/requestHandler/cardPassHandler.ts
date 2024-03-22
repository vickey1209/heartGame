import logger from "../logger";
import {
    ERROR_TYPE,
    EVENTS,
    MESSAGES,
    NUMERICAL,
} from "../../constants";
import CommonEventEmitter from "../commonEventEmitter";
import { cardPassHelperRequestIf } from "../interface/requestIf";
import Validator from "../Validator";
import Errors from "../errors";
import { throwErrorIF } from "../interface/throwError";
import { cardPass } from "../play/cardPass/cardPass";
import cancelBattle from "../play/cancelBattle";

async function cardPassHandler(
    { data: cardPassData }: cardPassHelperRequestIf,
    socket: any,
    ack?: Function
) {
    const socketId = socket.id;
    const { userId } = cardPassData;
    try {
        logger.info( "socket.authToken ::: =>", socket.authToken, "socketId :: =>", socketId);

        cardPassData = await Validator.requestValidator.cardPassValidator(cardPassData);
        socket.userId = cardPassData.userId;

        if (cardPassData.cards.length != NUMERICAL.THREE) {
            const errorObj: throwErrorIF = {
                type: ERROR_TYPE.USER_CARD_PASS_ERROR,
                message: MESSAGES.ERROR.CARD_LENGTH_ERROR_MESSAGES,
                isToastPopup: true,
            };
            throw errorObj;
        }
        await cardPass(socket, cardPassData);

        return true;
    } catch (error: any) {
        logger.error("CATCH_ERROR : cardPassHandler ::", cardPassData, error);

        let msg = MESSAGES.ERROR.COMMON_ERROR;
        let nonProdMsg = "";
        let errorCode = 500;

        if (error instanceof Errors.CancelBattle) {
            await cancelBattle({
                // @ts-ignore
                tableId,
                errorMessage: error,
            });
        } else if (error && error.type === ERROR_TYPE.USER_CARD_PASS_ERROR) {
            CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
                socket: socketId,
                data: {
                    isPopup: false,
                    popupType: MESSAGES.ALERT_MESSAGE.TYPE.TOAST_POPUP,
                    message: error.message,
                },
            });
        } else {
            CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
                socket: socketId,
                data: {
                    isPopup: true,
                    popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
                    message: MESSAGES.ERROR.COMMON_ERROR,
                    buttonCounts: NUMERICAL.ONE,
                    button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
                    button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
                    button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
                },
            });
        }
    }
}

export = cardPassHandler;
