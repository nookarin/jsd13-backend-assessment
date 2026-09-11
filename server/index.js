import express from "express";
import cors from "cors";
import productsRouter from "./routes/products.js";
import "dotenv/config";
import mongoose from "mongoose";

const app = express();
const PORT = 3000;

// middleware for logging every request.
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// allow React app to get responses from server.
app.use(cors());

// parse JSON requests.
app.use(express.json());

// check if server works.
app.get("/", (req, res) => {
  res.status(200).json({
    message: "API is running",
  });
});

app.use("/products", productsRouter);

// unknown route.
app.use((req, res) => {
  res.status(404).json({
    message: "unknown route",
  });
});

// error-handling 500.
app.use((err, req, res, next) => {
  console.error(err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: Object.values(err.errors)
        .map((error) => error.message)
        .join("; "),
    });
  }

  const status = err.status || 500;

  res.status(status).json({
    message: status === 500 ? "something went wrong" : err.message,
  });
});

// start server
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from server/.env");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "product_manager",
      serverSelectionTimeoutMS: 10000,
    });

    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Server startup failed:", err.message);
    process.exit(1);
  }
}

startServer();
