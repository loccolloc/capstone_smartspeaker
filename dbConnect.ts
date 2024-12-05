import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const DB_ENDPOINT = process.env.DBURI;

if (!DB_ENDPOINT) {
  throw new Error("DB_URI is not defined in the environment variables");
}

mongoose.connect(DB_ENDPOINT)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error: Error) => console.error("MongoDB connection error:", error));

export default mongoose;
