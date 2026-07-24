import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

export const env = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || "development",
  appName: process.env.APP_NAME || "cms-printer-app",
  enableMockAuth:
    process.env.ENABLE_MOCK_AUTH === "true" ||
    (process.env.ENABLE_MOCK_AUTH !== "false" && process.env.NODE_ENV !== "production"),
  databaseUrl: process.env.DATABASE_URL,
  dbHost: process.env.DB_HOST || "localhost",
  dbPort: Number(process.env.DB_PORT || 5432),
  dbName: process.env.DB_NAME || "cms_printer",
  dbUser: process.env.DB_USER || "postgres",
  dbPassword: process.env.DB_PASSWORD || "postgres",
  dbSsl: process.env.DB_SSL === "true",
  dbPoolMax: Number(process.env.DB_POOL_MAX || 10),
  dbIdleTimeoutMs: Number(process.env.DB_IDLE_TIMEOUT_MS || 30_000),
  dbConnectionTimeoutMs: Number(process.env.DB_CONNECTION_TIMEOUT_MS || 5_000),
  snmpCommunity: process.env.SNMP_COMMUNITY || "public",
  snmpTimeoutMs: Number(process.env.SNMP_TIMEOUT_MS || 3_000)
};
