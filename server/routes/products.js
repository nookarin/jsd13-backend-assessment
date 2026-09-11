import express from "express";

const router = express.Router();

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

// check if server works.
router.get("/", (req, res) => {
  const { search = "", sort = "" } = req.query;

  if (typeof search !== "string" || typeof sort !== "string") {
    return res.status(400).json({
      message: "Search and sort must be strings",
    });
  }

  const allowedSorts = ["", "price-asc", "price-desc", "name-asc"];

  if (!allowedSorts.includes(sort)) {
    return res.status(400).json({
      message: "Invalid sort option",
    });
  }

  const searchText = search.trim().toLowerCase();

  const results = products.filter((product) =>
    product.name.toLowerCase().includes(searchText)
  );

  if (sort === "price-asc") {
    results.sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    results.sort((a, b) => b.price - a.price);
  } else if (sort === "name-asc") {
    results.sort((a, b) => a.name.localeCompare(b.name));
  }

  res.status(200).json(results);
});

// listing product from search
router.get("/products", (req, res) => {
  const search = req.query.search;

  if (search !== undefined && typeof search !== "string") {
    return res.status(400).json({
      message: "must be string",
    });
  }

  const filteredProducts = search
    ? products.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase()),
      )
    : products;

  res.status(200).json(filteredProducts);
});

// route for find product
router.get("/products/:id", (req, res) => {
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
router.post("/products", (req, res) => {
  const { name, price, quantity = 1 } = req.body ?? {};

  if (
    req.body === null ||
    typeof req.body !== "object" ||
    Array.isArray(req.body)
  ) {
    return res.status(400).json({
      message: "request body must be a JSON object",
    });
  }

  if (typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({
      message: "required name",
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
router.patch("/products/:id", (req, res) => {
  const product = products.find((product) => product.id === req.params.id);

  if (
    req.body === null ||
    typeof req.body !== "object" ||
    Array.isArray(req.body)
  ) {
    return res.status(400).json({
      message: "request body must be a JSON object",
    });
  }

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  const { name, price, quantity } = req.body ?? {};

  if (name === undefined && price === undefined && quantity === undefined) {
    return res.status(400).json({
      message: "provide a name, price, or quantity to update",
    });
  }

  if (name !== undefined && (typeof name !== "string" || name.trim() === "")) {
    return res.status(400).json({
      message: "name must be a non-empty string",
    });
  }

  if (price !== undefined && (!Number.isFinite(price) || price < 0)) {
    return res.status(400).json({
      message: "price must be a non-negative number",
    });
  }

  if (quantity !== undefined && (!Number.isInteger(quantity) || quantity < 1)) {
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
router.delete("/products/:id", (req, res) => {
  const index = products.findIndex((product) => product.id === req.params.id);

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

export default router;
