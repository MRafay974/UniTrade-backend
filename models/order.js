const { Schema, model, Types } = require("mongoose");

const orderSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "user", required: true }, // buyer user ID
    items: [
      {
        product: { type: Types.ObjectId, ref: "product", required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
      }
    ],
    total: { type: Number, required: true },
    buyer: {
      name: String,
      phone: String
    },
    sellerEmail: String,
    paymentMethod: {
      type: String,
      enum: ["cash", "card"],
      required: true
    },
    shippingAddress: String,
    pickupLocation: String,
    status: {
      type: String,
      enum: ["pending_payment", "pending_cash", "paid", "completed", "cancelled"],
      default: "pending_payment"
    },
    stripePaymentId: String
  },
  { timestamps: true }
);

const Order = model("order", orderSchema);
module.exports = Order;
