const router = require("express").Router();
const multer = require("multer");
const Product = require("../models/product");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Multer destination called");
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    console.log("Multer filename called:", file.originalname);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Add product (status defaults to 'pending')
router.post("/addProduct", upload.array("images", 3), async (req, res) => {
  try {
    const { name, price, description, category } = req.body;
    const imageURLs = req.files.map((file) => `/uploads/${file.filename}`);
    const newProduct = new Product({
      name,
      price,
      description,
      category,
      imageURL: imageURLs.length > 0 ? imageURLs : undefined,
      // status: 'pending' // default
    });
    await newProduct.save();
    res
      .status(201)
      .json({
        message: "Successfully Added Product. Awaiting admin approval.",
      });
  } catch (error) {
    console.error("Server Error:", error);
    res
      .status(500)
      .json({ message: "Error creating product", error: error.message });
  }
});

// Fetch only approved products
router.get("/fetchProduct", async (req, res) => {
  try {
    const products = await Product.find({ status: "approved" });
    res.status(200).json(products);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
});

// ADMIN: Fetch all pending products
router.get("/pending", async (req, res) => {
  try {
    const products = await Product.find({ status: "pending" });
    res.status(200).json(products);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching pending products",
        error: error.message,
      });
  }
});

// ADMIN: Approve a product
router.post("/approve/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product approved", product });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error approving product", error: error.message });
  }
});

// ADMIN: Reject a product
router.post("/reject/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product rejected", product });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error rejecting product", error: error.message });
  }
});

module.exports = router;
