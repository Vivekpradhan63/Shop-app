/**
 * One-time migration: backfill order.phone from the user's phone number
 * Run once: node seed/backfillOrderPhone.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Order = require("../models/Order");
const User = require("../models/User");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  // Find all orders where phone is empty/missing
  const orders = await Order.find({ $or: [{ phone: "" }, { phone: { $exists: false } }] });
  console.log(`Found ${orders.length} order(s) with missing phone`);

  let updated = 0;
  for (const order of orders) {
    const user = await User.findById(order.user).select("phone");
    if (user?.phone) {
      order.phone = user.phone;
      await order.save();
      updated++;
      console.log(`  ✓ Order ${order._id} → phone: ${user.phone}`);
    } else {
      console.log(`  ⚠ Order ${order._id} → user has no phone, skipping`);
    }
  }

  console.log(`\nDone. Updated ${updated} / ${orders.length} orders.`);
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
