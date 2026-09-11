import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

const LOW_STOCK_THRESHOLD = 5;

function formatMoney(value) {
  return `$${Number(value).toFixed(2)}`;
}

function BoxIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 8.5 12 3 3 8.5v7L12 21l9-5.5v-7Z" />
      <path d="M3 8.5 12 14l9-5.5" />
      <path d="M12 14v7" />
    </svg>
  );
}

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

  async function handleDeleteProduct(id) {
    if (saving || deletingId !== null) return;

    setDeletingId(id);
    setDeleteError("");

    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Could not delete product");
      }

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== id),
      );
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeletingId(null);
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

  return (
    <main className="page">
      <section className="hero">
        <h1 className="hero__title">Product Manager</h1>
        <p className="hero__subtitle">Try add, edit, and delete products. 😊</p>
      </section>

      {loading ? (
        <section className="panel state-panel" role="status">
          <span className="spinner" />
          <p>Loading products…</p>
        </section>
      ) : error ? (
        <section className="panel state-panel state-panel--error" role="alert">
          <p className="state-panel__title">Couldn’t load products.</p>
          <p className="state-panel__hint">{error}</p>
        </section>
      ) : (
        <div className="layout">
          <section
            className="panel products-panel"
            aria-labelledby="list-title"
          >
            <div className="panel__header">
              <h2 id="list-title" className="panel__title">
                All Products
              </h2>
              <span className="panel__count">{products.length}</span>
            </div>

            {products.length === 0 ? (
              <div className="empty">
                <span className="empty__icon">
                  <BoxIcon />
                </span>
                <p className="empty__title">No products yet</p>
                <p className="empty__hint">
                  Add your first product using the form.
                </p>
              </div>
            ) : (
              <ul className="product-list">
                {products.map((product) => (
                  <li className="product-card" key={product.id}>
                    <span className="product-card__icon" aria-hidden="true">
                      <BoxIcon />
                    </span>

                    <div className="product-card__info">
                      <h3 className="product-card__name">{product.name}</h3>
                      <span
                        className={
                          product.quantity <= LOW_STOCK_THRESHOLD
                            ? "product-card__qty product-card__qty--low"
                            : "product-card__qty"
                        }
                      >
                        {product.quantity} in stock
                      </span>
                    </div>

                    <span className="product-card__price">
                      {formatMoney(product.price)}
                    </span>

                    <div className="product-card__actions">
                      <button
                        className="btn btn--ghost"
                        type="button"
                        onClick={() => startEditing(product)}
                        disabled={saving || deletingId !== null}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn--danger"
                        type="button"
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={saving || deletingId !== null}
                      >
                        {deletingId === product.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <aside className="panel form-panel">
            <div className="panel__header">
              <h2 className="panel__title">
                {editingId !== null ? "Edit product" : "Add a product"}
              </h2>
            </div>

            <form onSubmit={handleSaveProduct}>
              <fieldset disabled={saving || deletingId !== null}>
                <legend className="sr-only">Product information</legend>

                <div className="form-field">
                  <label htmlFor="product-name">Name</label>
                  <input
                    className="input"
                    id="product-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Magic Keyboard"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="product-price">Price</label>
                  <input
                    className="input"
                    id="product-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="product-quantity">Quantity</label>
                  <input
                    className="input"
                    id="product-quantity"
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    required
                  />
                </div>
              </fieldset>

              {formError && (
                <p className="alert" role="alert">
                  {formError}
                </p>
              )}

              <div className="form-actions">
                <button
                  className="btn btn--primary"
                  type="submit"
                  disabled={saving || deletingId !== null}
                >
                  {saving
                    ? "Saving…"
                    : editingId !== null
                      ? "Save changes"
                      : "Add product"}
                </button>

                {editingId !== null && (
                  <button
                    className="btn btn--ghost"
                    type="button"
                    onClick={resetForm}
                    disabled={saving || deletingId !== null}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </aside>
        </div>
      )}

      {deleteError && (
        <p className="alert alert--center" role="alert">
          {deleteError}
        </p>
      )}
    </main>
  );
}

export default App;
