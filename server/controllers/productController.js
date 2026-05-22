const ProductService = require("../services/productService");

const getProducts = async (req, res, next) => {
  try {
    const result = await ProductService.getProducts(req.query);
    res.json(result);
  } catch (e) {
    next(e);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const result = await ProductService.getProductById(req.params.id);
    res.json(result);
  } catch (e) {
    if (e.message.includes("Invalid product id") || e.message.includes("Product not found")) {
      res.status(e.message.includes("Invalid") ? 400 : 404);
    }
    next(e);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const result = await ProductService.createProduct(req.body);
    res.status(201).json(result);
  } catch (e) {
    if (e.message.includes("required")) res.status(400);
    next(e);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const result = await ProductService.updateProduct(req.params.id, req.body);
    res.json(result);
  } catch (e) {
    if (e.message.includes("Invalid") || e.message.includes("not found")) {
      res.status(e.message.includes("Invalid") ? 400 : 404);
    }
    next(e);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const result = await ProductService.deleteProduct(req.params.id);
    res.json(result);
  } catch (e) {
    if (e.message.includes("Invalid") || e.message.includes("not found")) {
      res.status(e.message.includes("Invalid") ? 400 : 404);
    }
    next(e);
  }
};

const addReview = async (req, res, next) => {
  try {
    const result = await ProductService.addReview(req.params.id, req.user._id, req.body);
    res.status(201).json(result);
  } catch (e) {
    if (e.code === 11000 || e.message.includes("already reviewed")) {
      res.status(400);
      return next(new Error("You have already reviewed this product"));
    }
    if (e.message.includes("Invalid") || e.message.includes("not found") || e.message.includes("Rating must be")) {
      res.status(e.message.includes("not found") ? 404 : 400);
    }
    next(e);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
};
