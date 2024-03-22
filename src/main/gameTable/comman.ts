import { NUMERICAL, PLAYER_STATE } from "../../constants";
import logger from "../logger";
import Validator from "../Validator";
import DefaultDataGenerator from "../defaultData";
import { playerGamePlayCache, roundTablePlayCache, tableGamePlayCache } from "../cache";
import { defaultTableGamePlayIf, tableGamePlayIf } from "../interface/tableGamePlay";
import { userIf } from "../interface/user";
import { insertRoundTablePlay } from "../cache/roundTablePlay";
import { InsertPlayerInTableInterface, seatsInterface, setupRoundIf } from "../interface/roundTablePlay";
import redis from "../redis";

// for creating new table
const createTable = async (data: defaultTableGamePlayIf) => {
    try {
        data = await Validator.methodValidator.createTableValidator(data);
        const tableData = await DefaultDataGenerator.defaultTableGamePlayData(data) as tableGamePlayIf;
        await tableGamePlayCache.insertTableGamePlay(tableData, tableData.tableId);
        return tableData.tableId
    } catch (error) {
        logger.error("CATCH_ERROR : createTable :: ", data, error);
        throw error;
    }
};

// for finding available table
const findAvaiableTable = async (queueKey: string, index: number = NUMERICAL.ZERO) => {
    const tableId: string | null = await redis.commands.getValueFromIndexFromQueue(queueKey, index);
    logger.info('findAvaiableTable :: tableId :==>>> ', tableId);
    return tableId;
};

async function insertPlayerInTable(
    userData: userIf,
    tableId: string
): Promise<InsertPlayerInTableInterface | null> {
    const { userId } = userData;
    try {
        logger.info(tableId, `Starting insertPlayerInTable for tableId : ${tableId} and userId : ${userId}`);

        const tableGamePlay = await tableGamePlayCache.getTableGamePlay(tableId);
        if (!tableGamePlay) throw Error('Unable to get Table Game Play');
        logger.info(" tableGamePlay ::: ==>>", tableGamePlay);
        const { currentRound } = tableGamePlay;

        const roundTablePlay = await roundTablePlayCache.getRoundTablePlay(tableId, currentRound);
        if (!roundTablePlay) throw Error('Unable to get Round Table Play');
        logger.info(" roundTablePlay ::: ==>>", roundTablePlay);


        const seatIndex = await insertPlayerInSeat(roundTablePlay.seats, userId);
        const isSeatEmpty = await checkIfSeatEmpty(seatIndex, roundTablePlay.seats);

        logger.info(tableId, "seatIndex :: ", seatIndex);
        logger.info(tableId, "isSeatEmpty :: ", isSeatEmpty);

        let playerGamePlay;
        if (seatIndex !== NUMERICAL.MINUS_ONE && isSeatEmpty) {

            const seatObject: seatsInterface = {
                userId: userId,
                si: seatIndex,
                name: userData.username,
                pp: userData.profilePic,
                userState: PLAYER_STATE.PLAYING
            };
            
            logger.info(tableId, "seatObject :::: ", seatObject);
            roundTablePlay.seats.splice(seatIndex, 0, seatObject);

            roundTablePlay.currentPlayerInTable += NUMERICAL.ONE;
            roundTablePlay.tableCurrentTimer = new Date();
            roundTablePlay.updatedAt = new Date();
            playerGamePlay = await DefaultDataGenerator.defaultPlayerGamePlayData(userData, seatIndex, tableId);

            await Promise.all([
                playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId),
                roundTablePlayCache.insertRoundTablePlay(roundTablePlay, tableId, currentRound)
            ]);
            logger.info(tableId, `Ending insertPlayerInTable for tableId : ${tableId} and userId : ${userId}`);

        } else {

            // player is already in a table
            playerGamePlay = await playerGamePlayCache.getPlayerGamePlay(userId.toString(), tableId);
            if (!playerGamePlay) {
                playerGamePlay = await DefaultDataGenerator.defaultPlayerGamePlayData(userData, seatIndex, tableId);
                await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);
            }

        }
        return { roundTablePlay, tableGamePlay, playerGamePlay };

    } catch (error: any) {
        logger.error(tableId, error, ` table ${tableId} user ${userId} function insertPlayerInTable`);
        throw new Error('INTERNAL_ERROR_insertPlayerInTable()');
    }

}

function insertPlayerInSeat(
    seats: Array<seatsInterface>,
    userId: string
): number {
    try {
        let seatIndex: number = NUMERICAL.MINUS_ONE;

        for (let i = 0; i < seats.length; ++i) {
            const seat: seatsInterface = seats[i];

            // found an empty place in array
            if (!seat) break;

            if (seat.si !== i) {
                return i;
            } else if (seat.userId === userId) {
                return seat.si;
            }
        }

        if (seatIndex === NUMERICAL.MINUS_ONE) {
            seatIndex = seats.length;
        }

        return seatIndex;

    } catch (error: any) {
        throw new Error(
            error && error.message && typeof error.message === 'string'
                ? error.message
                : 'insertPlayerInSeat error'
        );
    }
}

async function checkIfSeatEmpty(
    seatIndex: number,
    seats: Array<seatsInterface>
): Promise<boolean> {
    for (let i = 0; i < seats.length; ++i) {
        const seat: seatsInterface = seats[i];

        if (seat.si === seatIndex) {
            return false;
        }
    }
    return true;
}

const setupRound = async ({ tableId, noOfPlayer, roundNo }: setupRoundIf) => {
    // create round one table
    logger.info(tableId, 'tableId ===:>> ', tableId, noOfPlayer, roundNo);
    const roundOneTableData = await DefaultDataGenerator.defaultRoundTablePlayData({
        tableId,
        noOfPlayer,
        currantRound: roundNo
    });
    logger.info(tableId, 'roundOneTableData :>> ', roundOneTableData);
    await insertRoundTablePlay(roundOneTableData, tableId, roundNo);
};


const exportObject = {
    createTable,
    findAvaiableTable,
    insertPlayerInTable,
    setupRound
};
export = exportObject;