require("dotenv").config();
const mongoose = require("mongoose");
async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const indexes = await db.collection("users").indexes();
  console.log(JSON.stringify(indexes, null, 2));
  process.exit(0);
}
run();
