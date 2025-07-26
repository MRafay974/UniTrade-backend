const router = require("express").Router();
const Order = require("../models/order");
const Cart = require("../models/cart");
const jwt = require("jsonwebtoken");

function getUserId(req) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  
  const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : auth; // Extract token
  try {
    const decoded = jwt.verify(token, process.env.Secret_key);
    return decoded._id;
  } catch {
    return null;
  }
}

// Place order from cart
// router.post("/place", async (req, res) => {
//   const userId = getUserId(req);
//   if (!userId) return res.status(401).json({ message: "Unauthorized" });
//   const { shippingAddress, paymentMethod } = req.body;
//   const cart = await Cart.findOne({ user: userId }).populate("items.product");
//   if (!cart || cart.items.length === 0)
//     return res.status(400).json({ message: "Cart is empty" });
//   const items = cart.items.map((i) => ({
//     product: i.product._id,
//     quantity: i.quantity,
//     price: i.product.price,
//   }));
//   const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
//   const order = new Order({
//     user: userId,
//     items,
//     total,
//     status: "pending",
//     shippingAddress,
//     paymentMethod,
//   });
//   await order.save();
//   cart.items = [];
//   await cart.save();
//   res.json(order);
// });

router.post("/place", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const { shippingAddress, paymentMethod, buyerName, buyerPhone } = req.body;

  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart || cart.items.length === 0)
    return res.status(400).json({ message: "Cart is empty" });

  const items = cart.items.map((i) => ({
    product: i.product._id,
    quantity: i.quantity,
    price: i.product.price
  }));

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const order = new Order({
    user: userId,
    items,
    total,
    buyer: {
      name: buyerName,
      phone: buyerPhone
    },
    paymentMethod,
    shippingAddress,
    status: paymentMethod === "card" ? "pending_payment" : "pending_cash"
  });

  await order.save();
  cart.items = [];
  await cart.save();

  res.json({ success: true, message: "Order placed successfully", order });
});


// Get user's orders
router.get("/my", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  const orders = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate("items.product", "name price");
  res.json(orders);
});

// Get order by id
router.get("/:id", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  const order = await Order.findOne({
    _id: req.params.id,
    user: userId,
  }).populate("items.product", "name price");
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
});

module.exports = router;
