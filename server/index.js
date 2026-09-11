import express from "express";
import cors from "cors";

const app = express();
const PORT = 3000;

// product arrays

const products = [
  {
    id: "1",
    name: "Keyboard",
    price: 49.99,
    quantity: 1,
  },
  {
    id: "2",
    name: "Mouse",
    price: 24.99,
    quantity: 2,
  },
];

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

// unknown route.
app.use((req, res) => {
  res.status(404).json({
    message: "Unknown route",
  });
});

// error-handling 500.
app.use((err, req, res, next) => {
  console.error(err);

  const status = err.status || 500;

  res.status(status).json({
    message:
      status === 500
        ? "Something went wrong"
        : err.message,
  });
});

// start accepting requests.
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});