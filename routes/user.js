const express = require("express");
const router = express.Router();
const User = require("../models/user");
const authMiddleware = require("../middleware/userValidation");

// ✅ Fetch user profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password"); // exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
