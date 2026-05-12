import { pino } from "pino";
import { config } from "../config.js";

const isDev = config.NODE_ENV === "development";

export const logger = pino(
  {
    level: isDev ? "debug" : "info",
    redact: {
      paths: ["INTERNAL_SECRET", "DISCORD_BOT_TOKEN", "answer", "question"],
      censor: "[REDACTED]",
    },
  },
  isDev
    ? pino.transport({ target: "pino-pretty", options: { colorize: true } })
    : undefined
);
