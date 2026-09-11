import express from "express";
import cors from "cors";
import productsRouter from "./routes/products.js";

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

// listing products with optional search and sort
app.get("/products", (req, res) => {
  const search = req.query.search;
  const sort = req.query.sort;

  if (search !== undefined && typeof search !== "string") {
    return res.status(400).json({
      message: "must be string",
    });
  }

  const validSorts = new Set(["", "price-asc", "price-desc", "name-asc"]);

  if (sort !== undefined && !validSorts.has(sort)) {
    return res.status(400).json({
      message: "sort must be one of price-asc, price-desc, or name-asc",
    });
  }

  let filteredProducts = search
    ? products.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  if (sort === "price-asc") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) => a.price - b.price
    );
  } else if (sort === "price-desc") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) => b.price - a.price
    );
  } else if (sort === "name-asc") {
    filteredProducts = [...filteredProducts].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  res.status(200).json(filteredProducts);
});

// route for find product
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

// patch route
app.patch("/products/:id", (req, res) => {
  const product = products.find(
    (product) => product.id === req.params.id
  );

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  const { name, price, quantity } = req.body ?? {};

  if (
    name === undefined &&
    price === undefined &&
    quantity === undefined
  ) {
    return res.status(400).json({
      message: "provide a name, price, or quantity to update",
    });
  }

  if (
    name !== undefined &&
    (typeof name !== "string" || name.trim() === "")
  ) {
    return res.status(400).json({
      message: "name must be a non-empty string",
    });
  }

  if (
    price !== undefined &&
    (!Number.isFinite(price) || price < 0)
  ) {
    return res.status(400).json({
      message: "price must be a non-negative number",
    });
  }

  if (
    quantity !== undefined &&
    (!Number.isInteger(quantity) || quantity < 1)
  ) {
    return res.status(400).json({
      message: "quantity must be a whole number of at least 1",
    });
  }

  // change fields only after all validation has passed.
  if (name !== undefined) product.name = name.trim();
  if (price !== undefined) product.price = price;
  if (quantity !== undefined) product.quantity = quantity;

  res.status(200).json(product);
});

// delete route
app.delete("/products/:id", (req, res) => {
  const index = products.findIndex(
    (product) => product.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      message: "product not found",
    });
  }

  products.splice(index, 1);

  res.status(200).json({
    message: "product deleted",
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

  const status = err.status || 500;

  res.status(status).json({
    message:
      status === 500
        ? "something went wrong"
        : err.message,
  });
});

// start accepting requests.
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});