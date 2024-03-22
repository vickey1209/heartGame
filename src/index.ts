import logger from "./main/logger";

(async () => {
  const config = await import("./config");
  const { socketConnection, httpServer, redisConnection } = await import(
    "./connections"
  );
  const { getConfig } = config;

  (async () => {
    try {
      await Promise.all([redisConnection.redisConnect()]);
      await Promise.all([
        socketConnection.socketConnect(),
        redisConnection.initializeRedlock(),
      ]);
      require("./main/commonEventHandlers/socket");
      logger.warn("get Config Data :: --->> ", JSON.stringify(getConfig()));

      const { NODE_ENV, HTTP_SERVER_PORT } = getConfig();

      httpServer.listen(HTTP_SERVER_PORT, () => {
        logger.info(
          `${NODE_ENV} Server listening to the port ----->> ${HTTP_SERVER_PORT}`
        );
      });
    } catch (error) {
      console.trace(error);
      logger.error(`Server listen error ${error}`);
    }
  })();

  process
    .on("unhandledRejection", (reason, p) => {
      logger.error(
        reason,
        "Unhandled Rejection at Promise >> ",
        new Date(),
        " >> ",
        p
      );
    })
    .on("uncaughtException", (err) => {
      logger.error("Uncaught Exception thrown", new Date(), " >> ", "\n", err);
    });
})();
