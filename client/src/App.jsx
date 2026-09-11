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
  const [editingId, setEditingId] = useState(null);

  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

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

  async function handleSaveProduct(event) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setFormError("");

    const isEditing = editingId !== null;

    const url = isEditing
      ? `${API_URL}/products/${editingId}`
      : `${API_URL}/products`;

    try {
      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
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
        throw new Error(data.message || "Could not save product");
      }

      setProducts((currentProducts) => {
        if (isEditing) {
          return currentProducts.map((product) =>
            product.id === data.id ? data : product,
          );
        }

        return [...currentProducts, data];
      });

      resetForm();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function startEditing(product) {
    setEditingId(product.id);
    setName(product.name);
    setPrice(String(product.price));
    setQuantity(String(product.quantity));
    setFormError("");
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setPrice("");
    setQuantity("1");
    setFormError("");
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

      <form onSubmit={handleSaveProduct}>
        <h2>{editingId !== null ? "Edit product" : "Add a product"}</h2>

        <fieldset disabled={saving || deletingId !== null}>
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

          <button type="submit">
            {saving
              ? "Saving..."
              : editingId !== null
                ? "Save changes"
                : "Add product"}
          </button>

          {editingId !== null && (
            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </fieldset>

        {formError && <p role="alert">{formError}</p>}
      </form>

      {deleteError && <p role="alert">{deleteError}</p>}

      {products.length === 0 ? (
        <p>No products yet.</p>
      ) : (
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              <h2>{product.name}</h2>
              <p>Price: {product.price.toFixed(2)}</p>
              <p>Quantity: {product.quantity}</p>

              <button
                type="button"
                onClick={() => startEditing(product)}
                disabled={saving || deletingId !== null}
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => handleDeleteProduct(product.id)}
                disabled={saving || deletingId !== null}
              >
                {deletingId === product.id ? "Deleting..." : "Delete"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default App;
