const express = require("express");
const http = require("node:http");
import * as config from "../shared/config.json";
import i18n from "./src/services/i18n.service";
import routes from "./src/routes/index";
import connectDB from "../shared/db";
import { authenticateJWT } from "../shared/middleware/auth";
import logger from "../shared/services/logger.service";
import HandleErrorMessage from "../shared/middleware/validator";

const app = express();
const server = http.createServer(app);

require("dotenv").config();

const environment = process.env.NODE_ENV! || "dev";
const envConfig: any = JSON.parse(JSON.stringify(config))[environment];

try {
  connectDB();
  logger.info("Database connected successfully", { service: "chat-ms" });
} catch (error: any) {
  logger.error(`Database connection failed: ${error.message}`, {
    service: "chat-ms",
    error,
  });
  process.exit(1);
}

// @ts-ignore - Set global config variable that's defined in global.d.ts
global.config = envConfig;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(i18n.init);

// Regular API routes - require JWT authentication
app.use("/", authenticateJWT, routes);

app.use(HandleErrorMessage);

server.listen(envConfig.services["chat-ms"].PORT, () => {
  logger.info(
    `Chat microservice is running on port ${envConfig.services["chat-ms"].PORT}`,
    {
      service: "chat-ms",
      port: envConfig.services["chat-ms"].PORT,
    }
  );
});

export default app;
