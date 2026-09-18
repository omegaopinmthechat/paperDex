import { readFileSync } from "fs";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL not set"); process.exit(1); }
console.log("Connecting to Aiven...");

const { Client } = pg;
const client = new Client({ connectionString: url });
await client.connect();
console.log("Connected!");

const sql = readFileSync("prisma/migrations/0_init/migration.sql", "utf8");
await client.query(sql);
console.log("All tables created successfully!");

await client.end();
