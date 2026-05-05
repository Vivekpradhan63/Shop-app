const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const connectDB = require("../config/db");
const User = require("../models/User");

dotenv.config({ path: require("path").resolve(__dirname, "../.env") });

async function updateAdmin() {
  await connectDB();

  // Delete any existing user with the target email (non-admin duplicate)
  await User.deleteOne({ email: "pradhanvivek2008@gmail.com", role: { $ne: "admin" } });

  const hashedPassword = await bcrypt.hash("vivek@2008", 10);

  const result = await User.findOneAndUpdate(
    { email: "pradhanvivek2008@gmail.com" },
    {
      name: "Admin",
      email: "pradhanvivek2008@gmail.com",
      phone: "9999999999",
      password: hashedPassword,
      role: "admin"
    },
    { new: true, upsert: true }
  );

  if (!result) {
    console.log("No admin user found.");
  } else {
    console.log(`Admin updated → Email: ${result.email}`);
  }

  process.exit(0);
}

updateAdmin().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
