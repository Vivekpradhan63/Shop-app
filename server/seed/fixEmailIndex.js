/**
 * One-time fix: drop the non-sparse email_1 index on users collection
 * and recreate it as a sparse unique index.
 * Run: node seed/fixEmailIndex.js
 */
require("dotenv").config();
const mongoose = require("mongoose");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  const db = mongoose.connection.db;
  const collection = db.collection("users");

  // List current indexes
  const indexes = await collection.indexes();
  console.log("Current indexes:", indexes.map((i) => i.name));

  // Drop the old non-sparse email index if it exists
  const emailIndex = indexes.find((i) => i.name === "email_1");
  if (emailIndex) {
    await collection.dropIndex("email_1");
    console.log("✓ Dropped old email_1 index");
  } else {
    console.log("⚠ email_1 index not found, nothing to drop");
  }

  // Recreate as sparse unique index
  await collection.createIndex(
    { email: 1 },
    { unique: true, sparse: true, name: "email_1" }
  );
  console.log("✓ Recreated email_1 as sparse unique index");

  // Verify
  const newIndexes = await collection.indexes();
  const newEmailIndex = newIndexes.find((i) => i.name === "email_1");
  console.log("New email index:", newEmailIndex);

  await mongoose.disconnect();
  console.log("\nDone! Phone-only users can now register without email conflicts.");
}

run().catch((e) => { console.error(e); process.exit(1); });
