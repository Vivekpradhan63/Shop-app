require("dotenv").config();
const mongoose = require("mongoose");
async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    console.log(`Collection: ${col.name} - Documents: ${count}`);
  }
  await mongoose.disconnect();
}
run().catch(console.error);
