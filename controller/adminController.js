const User = require("../models/user");
const Product = require("../models/product");
const Order = require("../models/order");

// Get basic analytics
async function getAnalytics(req, res) {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    // Top 5 products by sales
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      { $project: { _id: 0, product: "$product.name", totalSold: 1 } },
    ]);
    res.json({ totalUsers, totalProducts, totalOrders, topProducts });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching analytics", error: err.message });
  }
}

module.exports = { getAnalytics };
