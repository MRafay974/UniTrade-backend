require("dotenv").config();
const express = require("express");
const app = express();
const corss = require("cors");
const AuthRouter = require("./routes/authRouter");
const productRouter = require("./routes/product");
const cartRouter = require("./routes/cart");
const wishlistRouter = require("./routes/wishlist");
const orderRouter = require("./routes/order");
const adminRouter = require("./routes/admin");
const checkoutRouter=require("./routes/checkout")
const path = require("path");
connectDB=require("./models/db");

connectDB()

app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

const PORT = process.env.PORT || 9000;


app.use(corss());
app.use("/checkout/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // for parsing form data

app.get("/", (req, res) => {
  res.send("Hello World");
});




app.use("/auth", AuthRouter);
app.use("/products", productRouter);
app.use("/cart", cartRouter);
app.use("/wishlist", wishlistRouter);
app.use("/order", orderRouter);
app.use("/admin", adminRouter);
app.use("/user", userRoutes);



app.use("/checkout", checkoutRouter)



app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
});
