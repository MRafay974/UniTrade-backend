const router = require("express").Router();
const Cart = require("../models/cart");
const Product = require("../models/product");
const jwt = require("jsonwebtoken");

// Middleware to get user from JWT
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

// Get user's cart
router.get("/", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  res.json(cart || { user: userId, items: [] });
});

// Add item to cart
router.post("/add", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  const { productId, quantity } = req.body;
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = new Cart({ user: userId, items: [] });
  const idx = cart.items.findIndex((i) => i.product.toString() === productId);
  if (idx > -1) {
    cart.items[idx].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }
  await cart.save();
  res.json(cart);
});

// Update quantity
router.put("/update", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  const { productId, quantity } = req.body;
  const cart = await Cart.findOne({ user: userId });
  if (!cart) return res.status(404).json({ message: "Cart not found" });
  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) return res.status(404).json({ message: "Item not found" });
  item.quantity = quantity;
  await cart.save();
  res.json(cart);
});

// Remove item
router.delete("/remove", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  const { productId } = req.body;
  const cart = await Cart.findOne({ user: userId });
  if (!cart) return res.status(404).json({ message: "Cart not found" });
  cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  await cart.save();
  res.json(cart);
});

module.exports = router;
