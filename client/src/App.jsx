import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadProducts() {
      try {
        const response = await fetch(`${API_URL}/products`);

        if (!response.ok) {
          throw new Error(`could not load products (${response.status})`);
        }

        const data = await response.json();

        if (!ignore) {
          setProducts(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      ignore = true;
    };
  }, []);

  async function handleAddProduct(event) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setFormError("");

    // submit handler
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          price: Number(price),
          quantity: Number(quantity),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not add product");
      }

      setProducts((currentProducts) => [...currentProducts, data]);

      setName("");
      setPrice("");
      setQuantity("1");
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Loading products...</p>;
  }

  if (error) {
    return <p role="alert">Error: {error}</p>;
  }

  return (
    <main>
      <h1>Products</h1>

      <form onSubmit={handleAddProduct}>
        <h2>Add a product</h2>

        <fieldset disabled={saving}>
          <legend>Product information</legend>

          <div>
            <label htmlFor="product-name">Name</label>
            <input
              id="product-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="product-price">Price</label>
            <input
              id="product-price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="product-quantity">Quantity</label>
            <input
              id="product-quantity"
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              required
            />
          </div>

          <button type="submit">{saving ? "Adding..." : "Add product"}</button>
        </fieldset>

        {formError && <p role="alert">{formError}</p>}
      </form>

      {products.length === 0 ? (
        <p>No products yet.</p>
      ) : (
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              <h2>{product.name}</h2>
              <p>Price: {product.price.toFixed(2)}</p>
              <p>Quantity: {product.quantity}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default App;
