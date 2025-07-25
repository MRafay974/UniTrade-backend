const { Schema, model, Types } = require("mongoose");

const cartSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "user", required: true },
    items: [
      {
        product: { type: Types.ObjectId, ref: "product", required: true },
        quantity: { type: Number, default: 1, min: 1 },
      },
    ],
  },
  { timestamps: true }
);

const Cart = model("cart", cartSchema);
module.exports = Cart;
