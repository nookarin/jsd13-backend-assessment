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

// listing product from search
app.get("/products", (req, res) => {
  const search = req.query.search;

  if (search !== undefined && typeof search !== "string") {
    return res.status(400).json({
      message: "must be string",
    });
  }

  const filteredProducts = search
    ? products.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  res.status(200).json(filteredProducts);
});

// route for a product
app.get("/products/:id", (req, res) => {
  const id = req.params.id;

  const product = products.find((product) => product.id === id);

  if (!product) {
    return res.status(404).json({
      message: "product not found",
    });
  }

  res.status(200).json(product);
});

// post route
app.post("/products", (req, res) => {
  const { name, price, quantity = 1 } = req.body ?? {};

  if (typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({
      message: "prequired name",
    });
  }

  if (!Number.isFinite(price) || price < 0) {
    return res.status(400).json({
      message: "price must not be a negative number",
    });
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({
      message: "quantity must be at least 1 and whole number",
    });
  }

  const newProduct = {
    id: String(Date.now()),
    name: name.trim(),
    price,
    quantity,
  };

  products.push(newProduct);

  res.status(201).json(newProduct);
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