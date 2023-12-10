import dotenv from "dotenv";
import express from "express";
import mongoose, { mongo } from "mongoose";
import cors from "cors";

// Loads .env data
dotenv.config();

console.log("Attempting to connect to mongodb...");

const mongoUri = process.env.MONGO_URI
  ? process.env.MONGO_URI
  : "mongodb://mongodb:mongodb@127.0.0.1:27017";

// Connect to db
await mongoose.connect(mongoUri);

// Create express app
const app = express();

// Enables parsing of incoming data into json
app.use(express.json());

// Logs incoming requests to console
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// IMPORTANT NOTE
// Change the origin to the domain during production
app.use(
  cors({
    origin: "*",
  })
);

// Load in root router
// app.use("/api", rootRouter);

// Start listening for requests
app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});

export default app;
