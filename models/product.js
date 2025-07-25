const { Schema, model } = require("mongoose");

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "other", // optional
    },
    imageURL: {
      type: [String],
      default: [
        "https://img.freepik.com/free-vector/garage-sale-items-concept_23-2148468435.jpg?semt=ais_hybrid&w=740",
      ],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Product = model("product", productSchema);
module.exports = Product;
