const mongoose = require("mongoose");

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    console.log("✅ Reusing existing MongoDB connection");
    return;
  }

  console.log("⏳ Connecting to MongoDB...");
  try {
    await mongoose.connect(process.env.mongo_conn, {
      serverSelectionTimeoutMS: 10000
    });
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
  }
};

module.exports = connectDB;
