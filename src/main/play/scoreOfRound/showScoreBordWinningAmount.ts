import { userScoreIf } from '../../interface/userScoreIf';
import logger from '../../logger';
import { winnLossAmountIf } from '../../interface/userScoreIf'
import { NUMERICAL } from '../../../constants';
import { tableGamePlayCache } from '../../cache';
import { tableGamePlayIf } from '../../interface/tableGamePlay';

async function showScoreBoardWinningAmount(userScore: userScoreIf[], winner: number[], tableId: string): Promise<winnLossAmountIf[] | boolean> {
    try {
        let winningAmount: winnLossAmountIf[] = []

        for (let index = NUMERICAL.ZERO; index < userScore.length; index++) {
            logger.info(" showScoreBoardWinningAmount :: winner.includes(userScore[index].seatIndex) ", winner.includes(userScore[index].seatIndex));
            if (winner.includes(userScore[index].seatIndex)) {
                const tableData = await tableGamePlayCache.getTableGamePlay(tableId) as tableGamePlayIf;
                logger.info(" tableData is called... ", tableData);

                const winnprice = String(Number(tableData.winningAmount) / winner.length);
                logger.info(" tableData is winnprice", winnprice);
                const resObj = {
                    seatIndex: userScore[index].seatIndex,
                    userId: userScore[index].userId,
                    winningAmount: winnprice
                }
                winningAmount.push(resObj)

            } else {
                const lossPrice = NUMERICAL.ZERO
                const resObj = {
                    seatIndex: userScore[index].seatIndex,
                    userId: userScore[index].userId,
                    winningAmount: lossPrice.toString()
                }
                winningAmount.push(resObj)
            }
        }
        logger.info(' showScoreBoardWinningAmount : winningAmount :>> ', winningAmount);
        return winningAmount;

    } catch (error) {
        logger.error(" CATCH_ERROR: showScoreBoardWinningAmount ::", error, "-", userScore, winner);
        return false;
    }
};

export = showScoreBoardWinningAmount;