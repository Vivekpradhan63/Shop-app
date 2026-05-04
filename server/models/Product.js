const mongoose = require("mongoose");

const CATEGORY_OPTIONS = [
  "Vegetables",
  "Fruits",
  "Dairy",
  "Bakery",
  "Beverages",
  "Snacks",
  "Other",
];

const UNIT_OPTIONS = ["per kg", "per piece", "per litre", "per pack"];

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: CATEGORY_OPTIONS,
      default: "Other",
    },
    unit: {
      type: String,
      enum: UNIT_OPTIONS,
      default: "per piece",
    },
    images: [{ type: String }],
    stock: { type: Number, default: 0, min: 0 },
    available: { type: Boolean, default: true },
    ratings: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
