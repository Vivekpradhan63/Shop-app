const express = require("express");
const { getUsers, deleteUser } = require("../controllers/userController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", verifyToken, isAdmin, getUsers);
router.delete("/:id", verifyToken, isAdmin, deleteUser);

module.exports = router;
