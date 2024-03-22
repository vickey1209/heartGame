import logger from "../../main/logger";
import { playerGamePlayCache, roundTablePlayCache, tableGamePlayCache } from "../../main/cache";
import { tableGamePlayIf } from "../../main/interface/tableGamePlay";
import { roundTablePlayIf } from "../../main/interface/roundTablePlay";
import { playerGamePlayIf } from "../../main/interface/playerGamePlay";
import cardsChangeTimerCancel from "./cardsChangeTimerCancel.cancel";
import initialCardPassTurnSetupTimerCancel from "./initialCardPassTurnSetupTimerCancel.cancel";
import initialNewRoundStartTimerCancel from "./initialNewRoundStartTimerCancel.cancel";
import initialUserTurnTimerCancel from "./initialUserTurnTimerCancel.cancel";
import playersCardPassTurnTimerCancel from "./playersCardPassTurnTimerCancel.cancel";
import roundStartTimerCancel from "./roundStartTimerCancel.cancel";
import playerTurnTimerCancel from "./playerTurnTimerCancel.cancel";
import winOfRoundSetupTimerCancel from "./winOfRoundSetupTimerCancel.cancel";
import winnerDeclareTimerCancel from "./winnerDeclareTimerCancel.cancel";
import { initializeGameTimerCancel } from "./initializeGameTimer.cancel";

export async function cancelAllScheduler(tableId: string){
    try {
        logger.info(tableId, `<<============================================  cancelAllScheduler :: START  ===========================================================>>`);
        const tableGamePlay = await tableGamePlayCache.getTableGamePlay(tableId) as tableGamePlayIf;  
        const { currentRound } = tableGamePlay;
        const roundTablePlay = await roundTablePlayCache.getRoundTablePlay(tableId, currentRound) as roundTablePlayIf;  

        for await (const player of roundTablePlay.seats) {
            const userPGP = await playerGamePlayCache.getPlayerGamePlay(player.userId, tableId) as playerGamePlayIf;
            if(userPGP) {
                await playerTurnTimerCancel(`${userPGP.userId}:${tableId}:${currentRound}`)
            }
        }
        logger.info(" -------- cancelAllScheduler -------")
        await Promise.all([ 
            cardsChangeTimerCancel(`cardsChangeTimerQueue:${tableId}`),
            initialCardPassTurnSetupTimerCancel(`initialCardPassTurnSetupTimer:${tableId}`),
            initializeGameTimerCancel(`initializeGameplay:${tableId}`),
            initialNewRoundStartTimerCancel(`initialNewRoundStartTimerQueue:${tableId}`),
            initialUserTurnTimerCancel(`initialUserTurnTimerQueue:${tableId}`),
            playersCardPassTurnTimerCancel(`playersCardPassTurnTimer:${tableId}`),
            roundStartTimerCancel(`roundStartTimer:${tableId}`),
            winOfRoundSetupTimerCancel(`${tableId}:${currentRound}`),
            winnerDeclareTimerCancel(`${tableId}:${currentRound}`)
        ])

        logger.info(tableId, ` <<============================================ cancelAllScheduler :: END  ===================================================>>`);

        return true;
    } catch (e) {
    logger.error(tableId, ' ---- cancelAllScheduler  :: ERROR ==>>', e);
}
};
