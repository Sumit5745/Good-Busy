const express = require("express");
import * as config from "../shared/config.json";
import i18n from "./src/services/i18n.service";
import routes from "./src/routes/index";
import connectDB from "../shared/db";
import logger from "../shared/services/logger.service";
import HandleErrorMessage from "../shared/middleware/validator";
import responseHandler from "../shared/middleware/responseHandler.middleware";

const app = express();

require("dotenv").config();

const environment = process.env.NODE_ENV! || "dev";
const envConfig: any = JSON.parse(JSON.stringify(config))[environment];

try {
  connectDB();
  logger.info("Database connected successfully", { service: "auth-ms" });
} catch (error: any) {
  logger.error(`Database connection failed: ${error.message}`, {
    service: "auth-ms",
    error,
  });
  process.exit(1);
}

global.config = envConfig;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(i18n.init);
app.use(responseHandler);

app.use("/", routes);

app.use(HandleErrorMessage);

app.listen(envConfig.services["auth-ms"].PORT, () => {
  logger.info(
    `Authentication microservice is running on port ${envConfig.services["auth-ms"].PORT}`,
    {
      service: "auth-ms",
      port: envConfig.services["auth-ms"].PORT,
    }
  );
});

export default app;
