import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// GET /products — list, search, and sort
router.get("/", async (req, res, next) => {
  try {
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

    const products = await Product.find();
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
  } catch (err) {
    next(err);
  }
});

// GET /products/:id — get one product
router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findOne({
      id: req.params.id,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
});

// POST /products — create a product
router.post("/", async (req, res, next) => {
  try {
    if (
      req.body === null ||
      typeof req.body !== "object" ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({
        message: "Request body must be a JSON object",
      });
    }

    const { name, price, quantity = 1 } = req.body;

    if (typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({
        message: "Price must be a non-negative number",
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        message: "Quantity must be a whole number of at least 1",
      });
    }

    const newProduct = await Product.create({
      name: name.trim(),
      price,
      quantity,
    });

    res.status(201).json(newProduct);
  } catch (err) {
    next(err);
  }
});

// PATCH /products/:id — update a product
router.patch("/:id", async (req, res, next) => {
  try {
    if (
      req.body === null ||
      typeof req.body !== "object" ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({
        message: "Request body must be a JSON object",
      });
    }

    const product = await Product.findOne({
      id: req.params.id,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const { name, price, quantity } = req.body;

    if (
      name === undefined &&
      price === undefined &&
      quantity === undefined
    ) {
      return res.status(400).json({
        message: "Provide a name, price, or quantity to update",
      });
    }

    if (
      name !== undefined &&
      (typeof name !== "string" || name.trim() === "")
    ) {
      return res.status(400).json({
        message: "Name must be a non-empty string",
      });
    }

    if (
      price !== undefined &&
      (!Number.isFinite(price) || price < 0)
    ) {
      return res.status(400).json({
        message: "Price must be a non-negative number",
      });
    }

    if (
      quantity !== undefined &&
      (!Number.isInteger(quantity) || quantity < 1)
    ) {
      return res.status(400).json({
        message: "Quantity must be a whole number of at least 1",
      });
    }

    // Apply changes only after every field passes validation.
    if (name !== undefined) product.name = name.trim();
    if (price !== undefined) product.price = price;
    if (quantity !== undefined) product.quantity = quantity;

    await product.save();

    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
});

// DELETE /products/:id — delete a product
router.delete("/:id", async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete({
      id: req.params.id,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product deleted",
    });
  } catch (err) {
    next(err);
  }
});

export default router;