const express = require("express");
import * as config from "../shared/config.json";
import i18n from "./src/services/i18n.service";
import routes from "./src/routes/index.routes";
import connectDB from "../shared/db";
import { authenticateJWT } from "../shared/middleware/auth";
import logger from "../shared/services/logger.service";
import HandleErrorMessage from "../shared/middleware/validator";

const app = express();

require("dotenv").config();

const environment = process.env.NODE_ENV! || "dev";
const envConfig: any = JSON.parse(JSON.stringify(config))[environment];

try {
  connectDB();
  logger.info("Database connected successfully", {
    service: "about-us-ms",
  });
} catch (error: any) {
  logger.error(`Database connection failed: ${error.message}`, {
    service: "about-us-ms",
    error,
  });
  process.exit(1);
}

global.config = envConfig;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(i18n.init);

// Regular API routes - require JWT authentication
app.use("/", authenticateJWT, routes);

// Celebrate error handling middleware
app.use(HandleErrorMessage);

app.listen(envConfig.services["about-us-ms"].PORT, () => {
  logger.info(
    `About Us microservice is running on port ${envConfig.services["about-us-ms"].PORT}`,
    {
      service: "about-us-ms",
      port: envConfig.services["about-us-ms"].PORT,
    }
  );
});

export default app;
