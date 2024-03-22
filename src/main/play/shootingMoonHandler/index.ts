import { NUMERICAL } from "../../../constants";
import { playerGamePlayCache, roundTablePlayCache, tableGamePlayCache } from "../../cache";
import { playerGamePlayIf } from "../../interface/playerGamePlay";
import { roundTablePlayIf } from "../../interface/roundTablePlay";
import { tableGamePlayIf } from "../../interface/tableGamePlay";
import { shootingMoonIf } from "../../interface/userScoreIf";
import logger from "../../logger";


export async function shootingMoonHandler(tableId: string) {
    try {
        let isShootingMoon: boolean = false;
        const tableGamePlay: tableGamePlayIf = await tableGamePlayCache.getTableGamePlay(tableId) as tableGamePlayIf;
        const { currentRound } = tableGamePlay;
        const roundTablePlay: roundTablePlayIf = await roundTablePlayCache.getRoundTablePlay(tableId, currentRound) as roundTablePlayIf;

        const playerRoundScore: number[] = [];
        for await (const seat of roundTablePlay.seats) {
            const playerGamePlay = await playerGamePlayCache.getPlayerGamePlay(seat.userId, tableId) as playerGamePlayIf
            playerRoundScore.push(playerGamePlay.penaltyPoint);
        }

        playerRoundScore.sort((a, b) => a - b);
        logger.info(" playerRoundScore :: --->> ", playerRoundScore);
        let zeroCount = playerRoundScore.filter(value => value === NUMERICAL.ZERO).length;
        logger.info(" zeroCount :: --->> ", zeroCount);

        const shootingMoonData = <shootingMoonIf[]>[];
        if (zeroCount === NUMERICAL.THREE) {
            isShootingMoon = true;
            for await (const seat of roundTablePlay.seats) {

                let tempShootingMoonData = <shootingMoonIf>{};
                const playerGamePlay = await playerGamePlayCache.getPlayerGamePlay(seat.userId, tableId) as playerGamePlayIf

                if (playerGamePlay.penaltyPoint === NUMERICAL.TWENTY_SIX) {
                    playerGamePlay.penaltyPoint = NUMERICAL.ZERO;
                    playerGamePlay.heartPoint = NUMERICAL.ZERO;
                    playerGamePlay.spadePoint = NUMERICAL.ZERO;
                    tempShootingMoonData.isShootingMoon = true;
                    tempShootingMoonData.userId = playerGamePlay.userId;
                    tempShootingMoonData.roundPoint = NUMERICAL.ZERO;
                    tempShootingMoonData.heartPoint = NUMERICAL.ZERO;
                    tempShootingMoonData.spadePoint = NUMERICAL.ZERO;
                }
                else {
                    playerGamePlay.penaltyPoint = NUMERICAL.TWENTY_SIX;
                    playerGamePlay.heartPoint = NUMERICAL.THIRTEEN;
                    playerGamePlay.spadePoint = NUMERICAL.THIRTEEN;
                    tempShootingMoonData.isShootingMoon = false;
                    tempShootingMoonData.userId = playerGamePlay.userId;
                    tempShootingMoonData.roundPoint = NUMERICAL.TWENTY_SIX;
                    tempShootingMoonData.heartPoint = NUMERICAL.THIRTEEN;
                    tempShootingMoonData.spadePoint = NUMERICAL.THIRTEEN;
                }
                shootingMoonData.push(tempShootingMoonData);

                await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);
            }
        }
        logger.info(" isShootingMoon :: --->> ", isShootingMoon);
        logger.info(" shootingMoonData :: --->> ", shootingMoonData);
        return { isShootingMoon, shootingMoonData };
    } catch (error) {
        logger.info(" CATCH_ERROR : shootingMoonHandler : tableId :-->> ", tableId, error);
        return { isShootingMoon: false, shootingMoonData: [] };
    }
}