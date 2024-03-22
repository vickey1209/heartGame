import { seatsInterface } from "../../interface/roundTablePlay";
import logger from "../../logger";

// get next player turn ObjectId
async function getNextPlayer(
  activePlayerData: seatsInterface[],
  currentTurn: string,
): Promise<seatsInterface> {
  try {
      logger.info( " getnextPlayer ::  activePlayerData :: >>", activePlayerData);
      logger.info( " getnextPlayer ::  currentTurn :: >>", currentTurn);

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

      logger.info(" getnextPlayer :: currentTurn ::  ===>>", currentTurn)
      let nextIndex = (currentIndex + 1) % playingPlayers.length;

      if (nextIndex === -1) {
          nextIndex = playingPlayers.length - 1;
      }
      logger.info(" getnextPlayer :: nextIndex ::  ===>>", nextIndex)

      let turnUserData: seatsInterface = playingPlayers[nextIndex];
      logger.info("  turnUserData  :: >>>", turnUserData);
      return turnUserData;

  } catch (error) {
      logger.error("--- getnextPlayer :: ERROR :: " + error);
      throw error;
  }
}

export = getNextPlayer;
