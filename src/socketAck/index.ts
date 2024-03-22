import { EVENTS } from "../constants";

// @ts-ignore
function ackMid(en, response, userId, tableId, ack) {
  try {
    // console.log('ackMid : ', en, response, metrics, userId, tableId);
    if (response && "tableId" in response && response.success)
      delete response.tableId;
    if (en != EVENTS.HEART_BEAT_SOCKET_EVENT) {
      console.log(
        "----------------------------------------------------------------------------------------------------------------------------------------------------"
      );
      console.log(
        "  Acknowleadgement event :: ==>> ",
        en,
        " :: >> ",
        JSON.stringify(response)
      );
      console.log(
        "-----------------------------------------------------------------------------------------------------------------------------------------------------"
      );
    }
    ack(
      JSON.stringify({
        en: en,
        data: response,
        userId,
        tableId,
      })
    );
  } catch (error) {
    console.log("CATCH_ERROR in ackMid: ", error);
    // @ts-ignore
    throw new Error("ackMid error catch  : ", error);
  }
}

const exportObject = {
  ackMid,
};

export = exportObject;
