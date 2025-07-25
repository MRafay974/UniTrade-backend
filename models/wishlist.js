const { Schema, model, Types } = require("mongoose");

const wishlistSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "user", required: true },
    products: [{ type: Types.ObjectId, ref: "product" }],
  },
  { timestamps: true }
);

const Wishlist = model("wishlist", wishlistSchema);
module.exports = Wishlist;
