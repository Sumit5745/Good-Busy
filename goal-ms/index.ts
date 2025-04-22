const express = require("express");
import * as config from "../shared/config.json";
import i18n from "./src/services/i18n.service";
import routes from "./src/routes/index";
import connectDB from "../shared/db";
import { authenticateJWT } from "../shared/middleware/auth";
import logger from "../shared/services/logger.service";
import HandleErrorMessage from "../shared/middleware/validator";
import { initGoalScheduler } from "./src/services/goalScheduler.service";
import responseHandler from "../shared/middleware/responseHandler.middleware";

const app = express();

require("dotenv").config();

const environment = process.env.NODE_ENV! || "dev";
const envConfig: any = JSON.parse(JSON.stringify(config))[environment];

try {
  connectDB();
  logger.info("Database connected successfully", { service: "goal-ms" });
} catch (error: any) {
  logger.error(`Database connection failed: ${error.message}`, {
    service: "goal-ms",
    error,
  });
  process.exit(1);
}

global.config = envConfig;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(i18n.init);
app.use(responseHandler);

// Regular API routes - require JWT authentication
app.use("/", authenticateJWT, routes);

app.use(HandleErrorMessage);

app.listen(envConfig.services["goal-ms"].PORT, () => {
  logger.info(
    `Goal microservice is running on port ${envConfig.services["goal-ms"].PORT}`,
    {
      service: "goal-ms",
      port: envConfig.services["goal-ms"].PORT,
    }
  );

  // Initialize goal scheduler when server starts
  initGoalScheduler();
});

export default app;
