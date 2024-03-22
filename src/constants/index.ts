import EVENT_EMITTER from "./eventEmitter";
import SOCKET from "./socket";
import MESSAGES from "./messages";
import REDIS from "./redis";
import NUMERICAL from "./numerical";
import PLAYER_STATE from "./playerState";
import TABLE_STATE from "./tableState";
import ERROR_TYPE from "./error";
import BOT_BULL from "./botBull";
import EVENTS from "./event";
import SINGLE_DECK from "./singleDeck";
import CARD_SEQUENCE from "./cardSequence";
import CARD_PASS from "./cardPass";

const exportObject = Object.freeze({
  GAME_TYPE: "HEARTS_CARDS",
  EVENTS,
  SINGLE_DECK,
  EVENT_EMITTER,
  SOCKET,
  MESSAGES,
  REDIS,
  NUMERICAL,
  PLAYER_STATE,
  TABLE_STATE,
  ERROR_TYPE,
  FROM_CANCEL_BATTLE: "FROM_CANCEL_BATTLE",
  HISTORY: {
    CARD_THROW_TURN: "cardThrow",
    TIME_OUT: "timeOut",
  },
  EMPTY: "",
  FTUE_BOT: "FTUE_BOT",
  BOT_BULL,
  CARD_SEQUENCE,
  CARD_PASS,
});
export = exportObject;
