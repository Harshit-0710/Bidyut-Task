import { useState, useEffect, useCallback, useRef } from "react";

const API = import.meta.env.VITE_API_URL || "";

// ── Debounce hook ─────────────────────────────────────────────────────────
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Product Card ──────────────────────────────────────────────────────────
function ProductCard({ product, index }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div className="card" style={{ animationDelay: `${index * 40}ms` }}>
      <div className="card-img-wrap">
        {!imgErr ? (
          <img
            src={product.image_url}
            alt={product.name}
            onError={() => setImgErr(true)}
            loading="lazy"
          />
        ) : (
          <div className="card-img-placeholder">
            <span>📦</span>
          </div>
        )}
        <span className="card-badge">{product.category}</span>
      </div>
      <div className="card-body">
        <h3 className="card-name">{product.name}</h3>
        <div className="card-footer">
          <span className="card-price">${Number(product.price).toFixed(2)}</span>
          <button className="card-btn">Add to cart</button>
        </div>
      </div>
    </div>
  );
}

// ── Range Slider ──────────────────────────────────────────────────────────
function RangeSlider({ min, max, value, onChange }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="range-wrap">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--pct": `${pct}%` }}
        className="range-input"
      />
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [category, setCategory] = useState("All");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);
  const [sortBy, setSortBy] = useState("default");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const debouncedMin = useDebounce(minPrice);
  const debouncedMax = useDebounce(maxPrice);

  // Fetch categories once
  useEffect(() => {
    fetch(`${API}/api/categories`)
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  // Fetch products whenever filters change
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedMin > 0) params.set("minPrice", debouncedMin);
      if (debouncedMax < 500) params.set("maxPrice", debouncedMax);
      if (category !== "All") params.set("category", category);
      if (sortBy !== "default") params.set("sortBy", sortBy);

      const res = await fetch(`${API}/api/products?${params}`);
      if (!res.ok) throw new Error("Network error");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (e) {
      setError("Could not load products. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, [category, debouncedMin, debouncedMax, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const resetFilters = () => {
    setCategory("All");
    setMinPrice(0);
    setMaxPrice(500);
    setSortBy("default");
  };

  const activeFilters =
    category !== "All" || minPrice > 0 || maxPrice < 500 || sortBy !== "default";

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-dot" />
            ShopFlow
          </div>
          <div className="header-right">
            <span className="product-count">{products.length} products</span>
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen((v) => !v)}
              title="Toggle filters"
            >
              {sidebarOpen ? "✕ Hide Filters" : "⊞ Filters"}
            </button>
          </div>
        </div>
      </header>

      <div className="layout">
        {/* ── Sidebar ── */}
        {sidebarOpen && (
          <aside className="sidebar">
            <div className="sidebar-head">
              <span>Filters</span>
              {activeFilters && (
                <button className="reset-btn" onClick={resetFilters}>
                  Reset all
                </button>
              )}
            </div>

            {/* Category */}
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <div className="cat-list">
                {["All", ...categories].map((c) => (
                  <button
                    key={c}
                    className={`cat-chip ${category === c ? "active" : ""}`}
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="filter-group">
              <label className="filter-label">
                Price Range
                <span className="price-display">
                  ${minPrice} — ${maxPrice === 500 ? "500+" : maxPrice}
                </span>
              </label>
              <div className="price-sliders">
                <div className="slider-row">
                  <span>Min</span>
                  <RangeSlider
                    min={0}
                    max={500}
                    value={minPrice}
                    onChange={(v) => setMinPrice(Math.min(v, maxPrice - 1))}
                  />
                </div>
                <div className="slider-row">
                  <span>Max</span>
                  <RangeSlider
                    min={0}
                    max={500}
                    value={maxPrice}
                    onChange={(v) => setMaxPrice(Math.max(v, minPrice + 1))}
                  />
                </div>
              </div>
            </div>

            {/* Sort */}
            <div className="filter-group">
              <label className="filter-label">Sort by Price</label>
              <div className="sort-btns">
                {[
                  { val: "default", label: "Default" },
                  { val: "price_asc", label: "↑ Low → High" },
                  { val: "price_desc", label: "↓ High → Low" },
                ].map((o) => (
                  <button
                    key={o.val}
                    className={`sort-btn ${sortBy === o.val ? "active" : ""}`}
                    onClick={() => setSortBy(o.val)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* ── Main ── */}
        <main className="main">
          {error && (
            <div className="error-banner">
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div className="skeleton-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="sk sk-img" />
                  <div className="sk sk-title" />
                  <div className="sk sk-price" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🔍</span>
              <p>No products match your filters.</p>
              <button className="reset-btn" onClick={resetFilters}>
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </main>
      </div>

      <style>{`
        /* ── Layout ── */
        .app { display: flex; flex-direction: column; min-height: 100vh; }

        .header {
          position: sticky; top: 0; z-index: 100;
          background: rgba(13,13,13,0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
        }
        .header-inner {
          max-width: 1400px; margin: 0 auto;
          padding: 16px 24px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .logo {
          font-family: var(--font-head);
          font-size: 22px; font-weight: 800; letter-spacing: -0.5px;
          display: flex; align-items: center; gap: 8px;
        }
        .logo-dot {
          width: 10px; height: 10px; border-radius: 50%;
          background: var(--accent); display: inline-block;
          box-shadow: 0 0 12px var(--accent);
        }
        .header-right { display: flex; align-items: center; gap: 16px; }
        .product-count { color: var(--muted); font-size: 13px; }
        .sidebar-toggle {
          background: var(--surface2); border: 1px solid var(--border);
          color: var(--text); padding: 7px 14px; border-radius: 8px;
          cursor: pointer; font-size: 13px; font-family: var(--font-body);
          transition: all .2s;
        }
        .sidebar-toggle:hover { border-color: var(--accent); color: var(--accent); }

        .layout {
          display: flex; flex: 1;
          max-width: 1400px; margin: 0 auto; width: 100%;
          padding: 24px;  gap: 24px;
        }

        /* ── Sidebar ── */
        .sidebar {
          width: 240px; flex-shrink: 0;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 20px;
          height: fit-content;
          position: sticky; top: 80px;
        }
        .sidebar-head {
          display: flex; align-items: center; justify-content: space-between;
          font-family: var(--font-head); font-weight: 700; font-size: 14px;
          margin-bottom: 20px; padding-bottom: 14px;
          border-bottom: 1px solid var(--border);
          text-transform: uppercase; letter-spacing: .08em;
        }
        .reset-btn {
          background: none; border: none; color: var(--accent2);
          cursor: pointer; font-size: 12px; font-family: var(--font-body);
          text-decoration: underline;
        }
        .filter-group { margin-bottom: 24px; }
        .filter-label {
          display: flex; justify-content: space-between;
          font-size: 11px; font-weight: 500; text-transform: uppercase;
          letter-spacing: .1em; color: var(--muted); margin-bottom: 10px;
        }
        .price-display { color: var(--accent); font-weight: 600; }

        .cat-list { display: flex; flex-wrap: wrap; gap: 6px; }
        .cat-chip {
          background: var(--surface2); border: 1px solid var(--border);
          color: var(--muted); padding: 5px 11px; border-radius: 20px;
          cursor: pointer; font-size: 12px; font-family: var(--font-body);
          transition: all .2s;
        }
        .cat-chip:hover { border-color: var(--text); color: var(--text); }
        .cat-chip.active {
          background: var(--accent); border-color: var(--accent);
          color: #000; font-weight: 600;
        }

        /* Range Slider */
        .price-sliders { display: flex; flex-direction: column; gap: 10px; }
        .slider-row {
          display: flex; align-items: center; gap: 8px;
          font-size: 11px; color: var(--muted);
        }
        .slider-row > span { width: 24px; flex-shrink: 0; }
        .range-wrap { flex: 1; }
        .range-input {
          -webkit-appearance: none; width: 100%; height: 4px;
          background: linear-gradient(to right, var(--accent) var(--pct), var(--border) var(--pct));
          border-radius: 2px; outline: none; cursor: pointer;
        }
        .range-input::-webkit-slider-thumb {
          -webkit-appearance: none; width: 16px; height: 16px;
          background: var(--accent); border-radius: 50%;
          box-shadow: 0 0 8px rgba(232,255,71,.4);
          transition: transform .15s;
        }
        .range-input::-webkit-slider-thumb:hover { transform: scale(1.2); }

        .sort-btns { display: flex; flex-direction: column; gap: 6px; }
        .sort-btn {
          background: var(--surface2); border: 1px solid var(--border);
          color: var(--muted); padding: 8px 12px; border-radius: 8px;
          cursor: pointer; font-size: 12px; font-family: var(--font-body);
          text-align: left; transition: all .2s;
        }
        .sort-btn:hover { border-color: var(--text); color: var(--text); }
        .sort-btn.active { border-color: var(--accent); color: var(--accent); background: rgba(232,255,71,.06); }

        /* ── Main Grid ── */
        .main { flex: 1; min-width: 0; }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }

        /* ── Card ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          animation: fadeUp .4s both;
          transition: transform .2s, border-color .2s, box-shadow .2s;
        }
        .card:hover {
          transform: translateY(-4px);
          border-color: #3a3a3a;
          box-shadow: 0 12px 40px rgba(0,0,0,.4);
        }
        .card-img-wrap {
          position: relative; aspect-ratio: 1/1; overflow: hidden;
          background: var(--surface2);
        }
        .card-img-wrap img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform .4s;
        }
        .card:hover .card-img-wrap img { transform: scale(1.06); }
        .card-img-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          font-size: 40px;
        }
        .card-badge {
          position: absolute; top: 10px; left: 10px;
          background: rgba(13,13,13,.8); backdrop-filter: blur(6px);
          border: 1px solid var(--border);
          color: var(--muted); font-size: 10px; padding: 3px 8px;
          border-radius: 20px; letter-spacing: .05em;
        }
        .card-body { padding: 14px; }
        .card-name {
          font-family: var(--font-head); font-size: 14px; font-weight: 600;
          margin-bottom: 12px; line-height: 1.3;
        }
        .card-footer { display: flex; align-items: center; justify-content: space-between; }
        .card-price {
          font-family: var(--font-head); font-size: 18px; font-weight: 800;
          color: var(--accent);
        }
        .card-btn {
          background: var(--surface2); border: 1px solid var(--border);
          color: var(--text); padding: 6px 12px; border-radius: 8px;
          cursor: pointer; font-size: 11px; font-family: var(--font-body);
          transition: all .2s;
        }
        .card-btn:hover { background: var(--accent); border-color: var(--accent); color: #000; font-weight: 600; }

        /* ── Skeleton ── */
        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .skeleton-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius); overflow: hidden; padding: 0 0 14px;
        }
        .sk {
          background: linear-gradient(90deg, var(--surface2) 25%, #252525 50%, var(--surface2) 75%);
          background-size: 400px 100%;
          animation: shimmer 1.2s infinite linear;
          border-radius: 6px;
        }
        .sk-img { width: 100%; aspect-ratio: 1/1; border-radius: 0; }
        .sk-title { height: 14px; margin: 14px 14px 8px; }
        .sk-price { height: 18px; width: 60%; margin: 0 14px; }

        /* ── Empty / Error ── */
        .empty-state {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 12px;
          padding: 80px 24px; color: var(--muted);
        }
        .empty-icon { font-size: 48px; }
        .empty-state p { font-size: 16px; }
        .error-banner {
          background: rgba(255,107,53,.1); border: 1px solid rgba(255,107,53,.3);
          color: var(--accent2); padding: 14px 18px; border-radius: 10px;
          margin-bottom: 20px; font-size: 14px;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .layout { flex-direction: column; padding: 16px; gap: 16px; }
          .sidebar { width: 100%; position: static; }
          .cat-list { gap: 5px; }
          .grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
        }
      `}</style>
    </div>
  );
}
