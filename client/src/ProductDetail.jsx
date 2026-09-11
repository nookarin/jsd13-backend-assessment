import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

const API_URL = import.meta.env.VITE_API_URL;

export default function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadProduct() {
      setLoading(true);
      setError("");
      setProduct(null);

      try {
        const response = await fetch(
          `${API_URL}/products/${encodeURIComponent(id)}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Product not found."
              : data.message || "could not load product."
          );
        }

        if (!ignore) {
          setProduct(data);
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

    loadProduct();

    return () => {
      ignore = true;
    };
  }, [id, refreshKey]);

  return (
    <main className="page">
      <section className="hero">
        <h1 className="hero__title">Product details</h1>

        <Link className="btn btn--ghost" to="/">
          Back to products
        </Link>
      </section>

      {loading ? (
        <section className="panel state-panel" role="status">
          <span className="spinner" />
          <p>Loading product…</p>
        </section>
      ) : error ? (
        <section
          className="panel state-panel state-panel--error"
          role="alert"
        >
          <p>{error}</p>

          <button
            className="btn btn--primary"
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
          >
            Retry
          </button>
        </section>
      ) : product ? (
        <section className="panel">
          <div className="panel__header">
            <h2 className="panel__title">{product.name}</h2>
          </div>

          <dl>
            <dt>Price</dt>
            <dd>{product.price.toFixed(2)}</dd>

            <dt>Quantity</dt>
            <dd>{product.quantity}</dd>
          </dl>
        </section>
      ) : null}
    </main>
  );
}