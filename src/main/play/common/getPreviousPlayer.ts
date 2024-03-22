import { seatsInterface } from "../../interface/roundTablePlay";
import logger from "../../logger";

// get previous player turn ObjectId
async function getPreviousPlayer(
  activePlayerData: seatsInterface[],
  currentTurn: string,
): Promise<seatsInterface> {
  try {
      logger.info( " getpreviousPlayer ::  activePlayerData :: >>", activePlayerData);
      logger.info( " getpreviousPlayer ::  currentTurn :: >>", currentTurn);

      let playingPlayers: Array<seatsInterface> = activePlayerData;
      playingPlayers.sort((a, b) => {
          return a.si - b.si
      });

      let currentIndex: number = -1;
      playingPlayers.map((player, index) => {
          if (player.userId === currentTurn) {
              currentIndex = index;
          }
      })

      logger.info(" getpreviousPlayer :: currentTurn ::  ===>>", currentTurn)
      let previousIndex = (currentIndex + 1) % playingPlayers.length;

      if (previousIndex === -1) {
          previousIndex = playingPlayers.length - 1;
      }
      logger.info(" getpreviousPlayer :: previousIndex ::  ===>>", previousIndex)

      let turnUserData: seatsInterface = playingPlayers[previousIndex];
      logger.info("  turnUserData  :: >>>", turnUserData);
      return turnUserData;

  } catch (error) {
      logger.error("--- getpreviousPlayer :: ERROR :: " + error);
      throw error;
  }
}
export = getPreviousPlayer;