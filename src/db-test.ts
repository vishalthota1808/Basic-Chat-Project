import pool from "./db.js";

async function testdb() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("Db conncected Successfully");
    console.log("Time: ", result.rows[0].now);
  } catch (error) {
    console.error("Db connection failed", error);
  } finally {
    await pool.end();
  }
}

testdb();
