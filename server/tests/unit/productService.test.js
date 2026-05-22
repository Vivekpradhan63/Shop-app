const ProductService = require("../../services/productService");

describe("ProductService", () => {
  describe("createProduct", () => {
    it("should create a product with valid data", async () => {
      const productData = {
        name: "Test Apple",
        price: 2.5,
        category: "Fruits",
        unit: "per kg",
        stock: 50,
      };

      const result = await ProductService.createProduct(productData);

      expect(result).toHaveProperty("_id");
      expect(result.name).toBe("Test Apple");
      expect(result.price).toBe(2.5);
      expect(result.stock).toBe(50);
      expect(result.available).toBe(true);
    });

    it("should throw error if name or price is missing", async () => {
      await expect(ProductService.createProduct({ name: "Apple" }))
        .rejects.toThrow("Name and price are required");
    });
  });

  describe("getProducts", () => {
    beforeEach(async () => {
      await ProductService.createProduct({ name: "Apple", price: 2, category: "Fruits", stock: 10 });
      await ProductService.createProduct({ name: "Banana", price: 1, category: "Fruits", stock: 20 });
      await ProductService.createProduct({ name: "Carrot", price: 1.5, category: "Vegetables", stock: 15 });
    });

    it("should retrieve all products when no filters applied", async () => {
      const result = await ProductService.getProducts({});
      expect(result.products).toHaveLength(3);
      expect(result.total).toBe(3);
    });

    it("should filter by category", async () => {
      const result = await ProductService.getProducts({ category: "Fruits" });
      expect(result.products).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it("should search by name", async () => {
      const result = await ProductService.getProducts({ search: "Apple" });
      expect(result.products).toHaveLength(1);
      expect(result.products[0].name).toBe("Apple");
    });
  });
});
