import { Pool } from "pg";
import "dotenv/config";
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "chat-project",
  port: 5432,
  password: process.env.POSTGRES_PASSWORD,
});
export default pool;
