const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

async function applyDatabaseSchema() {
  const connectionString = process.env.DATABASE_URL;
  const poolConfig = connectionString
    ? { connectionString, ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false }
    : {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        database: process.env.DB_NAME || "cms_printer",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "postgres",
        ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false
      };

  console.log("Connecting to PostgreSQL database...");
  const pool = new Pool(poolConfig);

  try {
    const client = await pool.connect();
    console.log("Database connection successful!");

    const schemaPath = path.join(__dirname, "../db/schema.sql");
    const seedPath = path.join(__dirname, "../db/seed.sql");
    const datasetSeedPath = path.join(__dirname, "../db/seed_dataset_fixtures.sql");

    if (fs.existsSync(schemaPath)) {
      console.log("Executing db/schema.sql...");
      const schemaSql = fs.readFileSync(schemaPath, "utf-8");
      await client.query(schemaSql);
      console.log("Schema applied successfully.");
    }

    if (fs.existsSync(seedPath)) {
      console.log("Executing db/seed.sql...");
      const seedSql = fs.readFileSync(seedPath, "utf-8");
      await client.query(seedSql);
      console.log("Official seed applied successfully.");
    }

    if (fs.existsSync(datasetSeedPath)) {
      console.log("Executing db/seed_dataset_fixtures.sql...");
      const datasetSeedSql = fs.readFileSync(datasetSeedPath, "utf-8");
      await client.query(datasetSeedSql);
      console.log("Dataset seed fixtures applied successfully.");
    }

    client.release();
    await pool.end();
    console.log("All DB setup tasks completed successfully!");
  } catch (err) {
    console.error("Database Setup Error:", err.message);
    console.log("\n[안내] PostgreSQL 연결 실패:");
    console.log("1. 로컬 PostgreSQL 서비스가 실행 중인지 확인하세요 (port 5432).");
    console.log("2. Supabase 또는 원격 DB를 사용하시는 경우 .env 파일의 DATABASE_URL을 설정해주세요.");
    await pool.end();
    process.exit(1);
  }
}

applyDatabaseSchema();
