import cluster from "cluster";
import os from "os";
import logger from "./logger";

export default (callback = null) => {
  const cpus = os.cpus().length;

  if (cluster.isMaster) {
    for (let i = 0; i < cpus; i++) {
      const worker = cluster.fork();

      worker.on("message", (message) => {
        if (process.send) {
          process.send(message);
        }
      });

      process.on("message", (message) => {
        worker.send(message);
      });
    }

    cluster.on("exit", (worker) => {
      logger.error(`Worker ${worker.process.pid} died.`);
    });
  } else {
    callback();
  }
};
