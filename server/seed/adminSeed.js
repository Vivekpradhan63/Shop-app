const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const connectDB = require("../config/db");
const User = require("../models/User");

dotenv.config({ path: require("path").resolve(__dirname, "../.env") });

async function seedAdmin() {
  await connectDB();

  const existing = await User.findOne({ role: "admin" });
  if (existing) {
    console.log("Admin already exists");
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await User.create({
    name: "Admin",
    email: "admin@shop.com",
    password: hashedPassword,
    role: "admin",
  });

  console.log("Admin user created");
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
