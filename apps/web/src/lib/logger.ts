import pino from "pino";
import { env } from "./env";

const SENSITIVE_KEYS = [
  "password",
  "passwordHash",
  "token",
  "sessionToken",
  "accessToken",
  "refreshToken",
  "nik",
  "encryptedNik",
  "familyCardNumber",
  "encryptedFamilyCardNumber",
  "authorization",
  "cookie",
  "secret",
  "apiKey",
  "privateKey",
];

function redactPaths(): string[] {
  return SENSITIVE_KEYS.flatMap((k) => [
    k,
    `*.${k}`,
    `*.*.${k}`,
    `req.headers.${k}`,
    `res.headers.${k}`,
  ]);
}

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: redactPaths(),
    censor: "[REDACTED]",
  },
  transport:
    env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
  base: {
    service: "parmaconnect",
    env: env.NODE_ENV,
  },
});

export function createChildLogger(bindings: Record<string, unknown>) {
  return logger.child(bindings);
}
