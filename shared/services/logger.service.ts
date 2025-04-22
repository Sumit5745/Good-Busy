import * as winston from "winston";
import * as path from "path";

// const logger = winston.createLogger({
//     level: 'info',
//     format: winston.format.json(),
//     transports: [
//         new winston.transports.File({ filename: path.resolve(__dirname, '..', '..', 'logs', 'error.log'), level: 'error' }),
//         new winston.transports.Console({ format: winston.format.simple() }),
//     ],
// });
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.resolve(__dirname, "..", "..", "logs", "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.resolve(__dirname, "..", "..", "logs", "warning.log"),
      level: "warn",
    }),
    new winston.transports.File({
      filename: path.resolve(__dirname, "..", "..", "logs", "combined.log"),
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

export default logger;
