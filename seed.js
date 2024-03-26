const pool = require('./client');

async function ensureTableExists() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS "stocks" (
      "id" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "amount" INTEGER NOT NULL,
      "version" INTEGER NOT NULL,
      CONSTRAINT "stocks_pkey" PRIMARY KEY ("id")
    );
  `;

  try {
    await pool.query(createTableQuery);
    console.log("Table checked/created successfully.");
  } catch (error) {
    console.error("Error ensuring table exists:", error);
  }
}

async function upsertStockItem(id, amount, version) {
  const upsertQuery = `
    INSERT INTO "stocks" ("id", "amount", "version", "updatedAt")
    VALUES ($1, $2, $3, NOW())
    ON CONFLICT ("id") DO UPDATE
    SET "amount" = EXCLUDED.amount,
        "version" = EXCLUDED.version,
        "updatedAt" = NOW();
  `;

  try {
    await pool.query(upsertQuery, [id, amount, version]);
    console.log("Stock item inserted/updated successfully.");
  } catch (error) {
    console.error("Error inserting/updating stock item:", error);
  }
}

async function main() {
  try {
    await ensureTableExists();
    await upsertStockItem("f92ef45b-a729-4938-b580-03d939a80301", 10, 0);
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

main();
