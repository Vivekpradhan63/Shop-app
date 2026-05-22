const AuthService = require("../../services/authService");
const User = require("../../models/User");

// Mock environment variables
process.env.JWT_SECRET = "test-secret";

describe("AuthService", () => {
  describe("registerUser", () => {
    it("should successfully register a new user", async () => {
      const userData = {
        name: "Test User",
        phone: "1234567890",
        email: "test@example.com",
        password: "password123",
      };
      const result = await AuthService.registerUser(userData, "127.0.0.1");

      expect(result).toHaveProperty("token");
      expect(result.user).toHaveProperty("_id");
      expect(result.user.name).toBe("Test User");
      expect(result.user.phone).toBe("1234567890");
    });

    it("should fail if phone already exists", async () => {
      const userData = {
        name: "Test User",
        phone: "1234567890",
        password: "password123",
      };
      await AuthService.registerUser(userData, "127.0.0.1");
      
      await expect(AuthService.registerUser(userData, "127.0.0.1"))
        .rejects
        .toThrow("User already exists with this phone number");
    });
  });

  describe("loginUser", () => {
    beforeEach(async () => {
      await AuthService.registerUser({
        name: "Login User",
        email: "login@example.com",
        password: "password123"
      }, "127.0.0.1");
    });

    it("should successfully login with correct credentials", async () => {
      const result = await AuthService.loginUser("login@example.com", "password123", "127.0.0.1");
      expect(result).toHaveProperty("token");
      expect(result.user.email).toBe("login@example.com");
    });

    it("should fail with incorrect credentials", async () => {
      await expect(AuthService.loginUser("login@example.com", "wrongpass", "127.0.0.1"))
        .rejects
        .toThrow("Invalid credentials");
    });

    it("should lock account after 5 failed attempts", async () => {
      for (let i = 0; i < 4; i++) {
        await expect(AuthService.loginUser("login@example.com", "wrongpass", "127.0.0.1"))
          .rejects
          .toThrow("Invalid credentials");
      }
      
      // 5th attempt locks it
      await expect(AuthService.loginUser("login@example.com", "wrongpass", "127.0.0.1"))
        .rejects
        .toThrow("Invalid credentials");

      // 6th attempt should throw lock error
      await expect(AuthService.loginUser("login@example.com", "wrongpass", "127.0.0.1"))
        .rejects
        .toThrow("Account is temporarily locked due to multiple failed login attempts. Please try again later.");
    });
  });
});
