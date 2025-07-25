const router = require("express").Router();
const { getAnalytics } = require("../controller/adminController");
const jwt = require("jsonwebtoken");

// Simple admin check: only allow a specific email (e.g., admin@admin.com)
function isAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "Unauthorized" });
  try {
    const decoded = jwt.verify(auth, process.env.Secret_key);
    if (decoded.email === "admin@admin.com") return next();
    return res.status(403).json({ message: "Forbidden: Admins only" });
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

router.get("/analytics", isAdmin, getAnalytics);

module.exports = router;
