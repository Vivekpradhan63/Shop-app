const express = require("express");
const { getUsers, deleteUser, toggleBlockUser } = require("../controllers/userController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", verifyToken, isAdmin, getUsers);
router.delete("/:id", verifyToken, isAdmin, deleteUser);
router.put("/:id/block", verifyToken, isAdmin, toggleBlockUser);

module.exports = router;
