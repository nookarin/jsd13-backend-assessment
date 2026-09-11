import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter, Routes, Route, Link } from "react-router";
import ProductDetail from "./ProductDetail.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />

        <Route path="/products/:id" element={<ProductDetail />} />

        <Route
          path="*"
          element={
            <main className="page">
              <h1>Page not found</h1>
              <Link to="/">Back to products</Link>
            </main>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
