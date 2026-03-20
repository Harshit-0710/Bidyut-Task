// const express = require("express");
// const mysql = require("mysql2/promise");
// const cors = require("cors");
// require("dotenv").config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// // ── MySQL Connection Pool ──────────────────────────────────────────────────
// const pool = mysql.createPool({
//   host: process.env.DB_HOST || "localhost",
//   user: process.env.DB_USER || "root",
//   password: process.env.DB_PASSWORD || "",
//   database: process.env.DB_NAME || "product_db",
//   waitForConnections: true,
//   connectionLimit: 10,
// });

// // ── DB Init: create table + seed data if empty ────────────────────────────
// async function initDB() {
//   const conn = await pool.getConnection();
//   await conn.query(`
//     CREATE TABLE IF NOT EXISTS products (
//       id INT AUTO_INCREMENT PRIMARY KEY,
//       name VARCHAR(255) NOT NULL,
//       price DECIMAL(10,2) NOT NULL,
//       category VARCHAR(100) NOT NULL,
//       image_url VARCHAR(500)
//     )
//   `);

//   const [rows] = await conn.query("SELECT COUNT(*) as count FROM products");
//   if (rows[0].count === 0) {
//     await conn.query(`
//       INSERT INTO products (name, price, category, image_url) VALUES
//       ('Wireless Headphones',  89.99,  'Electronics',  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'),
//       ('Running Shoes',        59.99,  'Footwear',     'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'),
//       ('Coffee Maker',         49.99,  'Kitchen',      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400'),
//       ('Backpack',             39.99,  'Accessories',  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'),
//       ('Smart Watch',         199.99,  'Electronics',  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'),
//       ('Yoga Mat',             29.99,  'Sports',       'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400'),
//       ('Sunglasses',           79.99,  'Accessories',  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400'),
//       ('Bluetooth Speaker',   129.99,  'Electronics',  'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400'),
//       ('Leather Wallet',       24.99,  'Accessories',  'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400'),
//       ('Desk Lamp',            34.99,  'Home',         'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400'),
//       ('Protein Powder',       44.99,  'Sports',       'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400'),
//       ('Air Fryer',            79.99,  'Kitchen',      'https://images.unsplash.com/photo-1626082927389-6cd097cee6b6?w=400'),
//       ('Sneakers',             99.99,  'Footwear',     'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400'),
//       ('Laptop Stand',         45.99,  'Electronics',  'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400'),
//       ('Water Bottle',         19.99,  'Sports',       'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400')
//     `);
//     console.log("✅ Database seeded with sample products");
//   }
//   conn.release();
// }

// // ── GET /api/products ─────────────────────────────────────────────────────
// // Query params: minPrice, maxPrice, category, sortBy (price_asc | price_desc)
// app.get("/api/products", async (req, res) => {
//   try {
//     const { minPrice, maxPrice, category, sortBy } = req.query;

//     let query = "SELECT * FROM products WHERE 1=1";
//     const params = [];

//     if (minPrice !== undefined && minPrice !== "") {
//       query += " AND price >= ?";
//       params.push(Number(minPrice));
//     }
//     if (maxPrice !== undefined && maxPrice !== "") {
//       query += " AND price <= ?";
//       params.push(Number(maxPrice));
//     }
//     if (category && category !== "All") {
//       query += " AND category = ?";
//       params.push(category);
//     }

//     if (sortBy === "price_asc") query += " ORDER BY price ASC";
//     else if (sortBy === "price_desc") query += " ORDER BY price DESC";
//     else query += " ORDER BY id ASC";

//     const [rows] = await pool.query(query, params);
//     res.json({ success: true, count: rows.length, products: rows });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // ── GET /api/categories ───────────────────────────────────────────────────
// app.get("/api/categories", async (req, res) => {
//   try {
//     const [rows] = await pool.query(
//       "SELECT DISTINCT category FROM products ORDER BY category ASC"
//     );
//     res.json({ success: true, categories: rows.map((r) => r.category) });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // ── Health check ──────────────────────────────────────────────────────────
// app.get("/", (req, res) => res.json({ message: "Products API running ✅" }));

// const PORT = process.env.PORT || 5000;
// initDB()
//   .then(() => {
//     app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
//   })
//   .catch((err) => {
//     console.error("❌ DB init failed:", err.message);
//     process.exit(1);
//   });


const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// DB connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect DB
db.connect((err) => {
  if (err) {
    console.log("DB Error:", err);
  } else {
    console.log("✅ MySQL Connected");
  }
});

// Create table if not exists
db.query(`
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  price INT,
  category VARCHAR(255)
)
`);

// Insert sample data (only once)
db.query("SELECT COUNT(*) as count FROM products", (err, result) => {
  if (result[0].count === 0) {
    db.query(`
      INSERT INTO products (name, price, category) VALUES
      ('iPhone', 800, 'Electronics'),
      ('Shoes', 50, 'Fashion'),
      ('Laptop', 1200, 'Electronics')
    `);
  }
});

// API
app.get("/api/products", (req, res) => {
  let query = "SELECT * FROM products WHERE 1=1";

  if (req.query.minPrice) {
    query += ` AND price >= ${req.query.minPrice}`;
  }
  if (req.query.maxPrice) {
    query += ` AND price <= ${req.query.maxPrice}`;
  }
  if (req.query.category) {
    query += ` AND category='${req.query.category}'`;
  }

  db.query(query, (err, result) => {
    res.json(result);
  });
});

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});