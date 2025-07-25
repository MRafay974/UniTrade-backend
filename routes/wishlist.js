const router = require("express").Router();
const Wishlist = require("../models/wishlist");
const Product = require("../models/product");
const jwt = require("jsonwebtoken");

function getUserId(req) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  try {
    const decoded = jwt.verify(auth, process.env.Secret_key);
    return decoded._id;
  } catch {
    return null;
  }
}

// Get user's wishlist
router.get("/", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  const wishlist = await Wishlist.findOne({ user: userId }).populate(
    "products"
  );
  res.json(wishlist || { user: userId, products: [] });
});

// Add to wishlist
router.post("/add", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  const { productId } = req.body;
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) wishlist = new Wishlist({ user: userId, products: [] });
  if (!wishlist.products.includes(productId)) {
    wishlist.products.push(productId);
  }
  await wishlist.save();
  res.json(wishlist);
});

// Remove from wishlist
router.delete("/remove", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  const { productId } = req.body;
  const wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) return res.status(404).json({ message: "Wishlist not found" });
  wishlist.products = wishlist.products.filter(
    (p) => p.toString() !== productId
  );
  await wishlist.save();
  res.json(wishlist);
});

module.exports = router;
