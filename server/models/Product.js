import mongoose from "mongoose";
import { randomUUID } from "node:crypto";

const productSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => randomUUID(),
      unique: true,
      immutable: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isFinite,
        message: "Price must be a finite number",
      },
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number",
      },
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Product", productSchema);
