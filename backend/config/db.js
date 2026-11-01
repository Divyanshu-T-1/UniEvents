const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connect successfully");
  } catch (error) {
    console.error("MongoDb connection failed:", error.message);
    throw error;
  }
};

module.exports = connectDB;