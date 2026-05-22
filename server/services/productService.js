const mongoose = require("mongoose");
const Product = require("../models/Product");
const Review = require("../models/Review");
const { v2: cloudinary } = require("cloudinary");
const NodeCache = require("node-cache");

// Cache products for 60 seconds to reduce DB reads
const productCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

const CATEGORY_OPTIONS = ["Vegetables", "Fruits", "Dairy", "Bakery", "Beverages", "Snacks", "Other"];
const UNIT_OPTIONS = ["per kg", "per piece", "per litre", "per pack"];

const normalizeCategory = (value) => {
  if (!value || typeof value !== "string") return "Other";
  const exact = CATEGORY_OPTIONS.find((x) => x.toLowerCase() === value.trim().toLowerCase());
  return exact || "Other";
};

const normalizeUnit = (value) => {
  if (!value || typeof value !== "string") return "per piece";
  const exact = UNIT_OPTIONS.find((x) => x.toLowerCase() === value.trim().toLowerCase());
  return exact || "per piece";
};

class ProductService {
  static async getProducts({ search, category, sort, page = 1, limit = 20 }) {
    const cacheKey = `${search}-${category}-${sort}-${page}-${limit}`;
    const cachedData = productCache.get(cacheKey);
    if (cachedData) return cachedData;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (category && category !== "all") {
      filter.category = normalizeCategory(category);
    }

    let sortObj = { createdAt: -1 };
    if (sort === "price_asc") sortObj = { price: 1 };
    else if (sort === "price_desc") sortObj = { price: -1 };
    else if (sort === "rating_desc") sortObj = { ratings: -1 };
    else if (sort === "rating_asc") sortObj = { ratings: 1 };
    else if (sort === "newest") sortObj = { createdAt: -1 };
    else if (sort === "popular") sortObj = { numReviews: -1, ratings: -1 };

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortObj).skip(skip).limit(limitNumber).lean(), // .lean() for performance
      Product.countDocuments(filter)
    ]);

    const result = {
      products,
      totalPages: Math.ceil(total / limitNumber),
      currentPage: pageNumber,
      total
    };

    productCache.set(cacheKey, result);
    return result;
  }

  static async getProductById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid product id");
    
    // .lean() for performance
    const product = await Product.findById(id).lean();
    if (!product) throw new Error("Product not found");

    const reviews = await Review.find({ product: product._id })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .lean();

    return { ...product, reviews };
  }

  static async createProduct(data) {
    const { name, description, price, category, unit, images, stock, available } = data;
    if (!name || price == null) throw new Error("Name and price are required");

    const normalizedStock = stock != null ? Number(stock) : 0;
    const product = await Product.create({
      name: name.trim(),
      description: description || "",
      price: Number(price),
      category: normalizeCategory(category),
      unit: normalizeUnit(unit),
      images: Array.isArray(images) ? images : images ? [images] : [],
      stock: normalizedStock,
      available: typeof available === "boolean" ? available : normalizedStock > 0,
    });

    productCache.flushAll(); // Invalidate cache
    return product;
  }

  static async updateProduct(id, data) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid product id");
    const product = await Product.findById(id);
    if (!product) throw new Error("Product not found");

    const { name, description, price, category, unit, images, stock, ratings, numReviews, available } = data;
    if (name != null) product.name = String(name).trim();
    if (description != null) product.description = description;
    if (price != null) product.price = Number(price);
    if (category != null) product.category = normalizeCategory(category);
    if (unit != null) product.unit = normalizeUnit(unit);
    if (images != null) product.images = Array.isArray(images) ? images : [images];
    if (stock != null) product.stock = Number(stock);
    if (ratings != null) product.ratings = Number(ratings);
    if (numReviews != null) product.numReviews = Number(numReviews);
    if (available != null) product.available = Boolean(available);

    await product.save();
    productCache.flushAll(); // Invalidate cache
    return product;
  }

  static async deleteProduct(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid product id");
    const product = await Product.findByIdAndDelete(id);
    if (!product) throw new Error("Product not found");
    
    if (product.images && product.images.length > 0) {
      for (const imgUrl of product.images) {
        if (imgUrl.includes("cloudinary.com")) {
          const parts = imgUrl.split("/");
          const filename = parts.pop();
          const folder = parts.pop();
          const publicId = `${folder}/${filename.split(".")[0]}`;
          await cloudinary.uploader.destroy(publicId).catch(err => console.error("Cloudinary destroy error:", err));
        }
      }
    }

    await Review.deleteMany({ product: product._id });
    productCache.flushAll(); // Invalidate cache
    return { message: "Product removed" };
  }

  static async addReview(id, userId, data) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid product id");
    const product = await Product.findById(id);
    if (!product) throw new Error("Product not found");

    const { rating, comment } = data;
    const r = Number(rating);
    if (!r || r < 1 || r > 5) throw new Error("Rating must be between 1 and 5");

    const existing = await Review.findOne({ product: product._id, user: userId });
    if (existing) throw new Error("You have already reviewed this product");

    await Review.create({
      user: userId,
      product: product._id,
      rating: r,
      comment: comment || "",
    });

    const stats = await Review.aggregate([
      { $match: { product: product._id } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    product.ratings = Math.round((stats[0]?.avg ?? r) * 10) / 10;
    product.numReviews = stats[0]?.count ?? 1;
    await product.save();

    const reviews = await Review.find({ product: product._id })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .lean(); // .lean() for performance

    productCache.flushAll(); // Invalidate cache
    return { product, reviews };
  }
}

module.exports = ProductService;
