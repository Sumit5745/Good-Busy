const express = require("express");
import * as config from "../shared/config.json";
import { createProxyMiddleware } from "http-proxy-middleware";
import connectDB from "../shared/db";
import i18n from "../shared/services/i18n.service";
const path = require("path");
const swaggerUi = require("swagger-ui-express");
import { Server } from "socket.io";
import { socketHandler } from "../chat-ms/src/socket";
const http = require("http");
import responseHandler from "../shared/middleware/responseHandler.middleware";

require("dotenv").config();

const app = express();

const router = express.Router();

connectDB();

const environment = process.env.NODE_ENV! || "dev";

const envConfig: any = JSON.parse(JSON.stringify(config))[environment];

global.config = envConfig;

// Apply middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(i18n.init);
app.use(responseHandler); // Add response handler middleware

// Load Swagger documentation
const swaggerDocument = require("./swagger.json");
// Update the swagger info to show this is Good-Busy API
swaggerDocument.info.title = "Good-Busy API Documentation";
swaggerDocument.info.description =
  "API documentation for Good-Busy microservices";

// Try to load and merge goal-ms and social-ms swagger docs
try {
  const goalSwagger = require("../goal-ms/swagger.json");
  const socialSwagger = require("../social-ms/swagger.json");

  // Merge goal paths
  if (goalSwagger && goalSwagger.paths) {
    for (const path in goalSwagger.paths) {
      swaggerDocument.paths[`/goals${path}`] = goalSwagger.paths[path];
    }
  }

  // Merge social paths
  if (socialSwagger && socialSwagger.paths) {
    for (const path in socialSwagger.paths) {
      swaggerDocument.paths[`/social${path}`] = socialSwagger.paths[path];
    }
  }

  // Merge schemas
  if (goalSwagger && goalSwagger.components && goalSwagger.components.schemas) {
    for (const schema in goalSwagger.components.schemas) {
      if (!swaggerDocument.components.schemas[schema]) {
        swaggerDocument.components.schemas[schema] =
          goalSwagger.components.schemas[schema];
      }
    }
  }

  if (
    socialSwagger &&
    socialSwagger.components &&
    socialSwagger.components.schemas
  ) {
    for (const schema in socialSwagger.components.schemas) {
      if (!swaggerDocument.components.schemas[schema]) {
        swaggerDocument.components.schemas[schema] =
          socialSwagger.components.schemas[schema];
      }
    }
  }
} catch (error: any) {
  console.log("Error merging microservice swagger docs:", error.message);
}

// Filter the tags to include only microservices we have
const relevantTags = [
  "Authentication",
  "User",
  "Notification",
  "Contact Us",
  "Goals",
  "Social",
  "Chat",
  "About Us",
  "Privacy Policy",
  "Terms & Conditions",
  "Changelogs",
  "Mail",
];
swaggerDocument.tags = swaggerDocument.tags.filter((tag) =>
  relevantTags.includes(tag.name)
);

// Remove any endpoints that don't match our available services
const relevantPaths = {};
Object.keys(swaggerDocument.paths).forEach((path) => {
  // Keep paths that match our microservices
  if (
    path.startsWith("/auth/") ||
    path.startsWith("/user/") ||
    path.startsWith("/notifications/") ||
    path.startsWith("/contact-us/") ||
    path.startsWith("/goals") ||
    path.startsWith("/social/") ||
    path.startsWith("/chat/") ||
    path.startsWith("/about-us/") ||
    path.startsWith("/privacy-policy/") ||
    path.startsWith("/terms-condition/") ||
    path.startsWith("/changelogs/") ||
    path.startsWith("/mails/")
  ) {
    relevantPaths[path] = swaggerDocument.paths[path];
  }
});
swaggerDocument.paths = relevantPaths;

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

router.use(
  "/uploads",
  express.static(path.resolve(__dirname, "../shared/uploads"))
);

router.use(
  "/v1/auth",
  createProxyMiddleware({
    target: `http://127.0.0.1:${envConfig.services["auth-ms"].PORT}`,
    changeOrigin: true,
  })
);
router.use(
  "/v1/user",
  createProxyMiddleware({
    target: `http://127.0.0.1:${envConfig.services["user-ms"].PORT}`,
    changeOrigin: true,
  })
);

// Remove unused microservices routes

router.use(
  "/v1/notifications",
  createProxyMiddleware({
    target: `http://127.0.0.1:${envConfig.services["notification-ms"].PORT}`,
    changeOrigin: true,
  })
);

router.use(
  "/v1/contact-us",
  createProxyMiddleware({
    target: `http://127.0.0.1:${envConfig.services["contact-us-ms"].PORT}`,
    changeOrigin: true,
  })
);

router.use(
  "/v1/privacy-policy",
  createProxyMiddleware({
    target: `http://127.0.0.1:${envConfig.services["privacy-policy-ms"].PORT}`,
    changeOrigin: true,
  })
);

router.use(
  "/v1/terms-condition",
  createProxyMiddleware({
    target: `http://127.0.0.1:${envConfig.services["terms-condition-ms"].PORT}`,
    changeOrigin: true,
  })
);

router.use(
  "/v1/about-us",
  createProxyMiddleware({
    target: `http://127.0.0.1:${envConfig.services["about-us-ms"].PORT}`,
    changeOrigin: true,
  })
);

router.use(
  "/v1/changelogs",
  createProxyMiddleware({
    target: `http://127.0.0.1:${envConfig.services["changelogs-ms"].PORT}`,
    changeOrigin: true,
  })
);

router.use(
  "/v1/mails",
  createProxyMiddleware({
    target: `http://127.0.0.1:${envConfig.services["mail-ms"].PORT}`,
    changeOrigin: true,
  })
);

router.use(
  "/v1/chat",
  createProxyMiddleware({
    target: `http://127.0.0.1:${envConfig.services["chat-ms"].PORT}`,
    changeOrigin: true,
  })
);

router.use(
  "/v1/goals",
  createProxyMiddleware({
    target: `http://127.0.0.1:${envConfig.services["goal-ms"].PORT}`,
    changeOrigin: true,
  })
);

router.use(
  "/v1/social",
  createProxyMiddleware({
    target: `http://127.0.0.1:${envConfig.services["social-ms"].PORT}`,
    changeOrigin: true,
  })
);

app.use(router);

const server = http.createServer(app);

server.listen(envConfig.PORT, () => {
  console.log(`Server is running on port ${envConfig.PORT}`);
  console.log(
    `API Documentation available at http://localhost:${envConfig.PORT}/api-docs`
  );
});

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Initialize socket handlers
io.on("connection", (socket: any) => {
  console.log("New connection", socket.id);
  socketHandler(io, socket);
});

export default app;
