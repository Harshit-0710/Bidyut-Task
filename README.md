# 🛒 Product Listing App — Full Stack Project

A full-stack web application built using **React (Vite)**, **Node.js/Express**, and **MySQL**.
This app allows users to view, filter, and sort products dynamically.

---

# 🚀 Tech Stack

### 🔹 Frontend

* React.js (Vite)
* CSS (or Tailwind if added)
* Fetch API

### 🔹 Backend

* Node.js
* Express.js
* dotenv (for environment variables)
* mysql2 (for DB connection)
* cors (for cross-origin requests)

### 🔹 Database

* MySQL

---

# 📁 Project Structure

```
project/
└── backend/
    ├── server.js          # Express backend
    ├── package.json
    ├── .env               # Environment variables
    └── frontend/          # React frontend
        ├── package.json
        ├── vite.config.js
        ├── index.html
        └── src/
            ├── App.jsx    # Main UI component
            ├── main.jsx   # Entry point
            └── index.css  # Styling
```

---

# ⚙️ Backend Explanation (Node + Express)

## 📌 `server.js`

This is the **core backend file**.

### 🔹 1. Import Dependencies

```js
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();
```

### 🔹 2. Middleware

```js
app.use(cors());
app.use(express.json());
```

* Enables frontend-backend communication
* Parses JSON data

---

### 🔹 3. Database Connection

```js
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
```

👉 Uses `.env` file for secure credentials

---

### 🔹 4. Table Creation

```js
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  price INT,
  category VARCHAR(255)
)
```

👉 Automatically creates table if not exists

---

### 🔹 5. Sample Data Seeding

```js
INSERT INTO products (...)
```

👉 Adds initial products for testing

---

### 🔹 6. API Endpoint

#### ✅ GET `/api/products`

Supports filters:

```js
if (req.query.minPrice)
if (req.query.maxPrice)
if (req.query.category)
```

👉 Dynamically builds SQL query

---

### 🔹 Example API Call

```
/api/products?category=Electronics&minPrice=100
```

---

# 🎨 Frontend Explanation (React)

## 📌 `main.jsx`

```js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
```

👉 Entry point of React app

---

## 📌 `App.jsx`

This is the **main UI component**

### 🔹 Responsibilities:

* Fetch products from backend
* Display products
* Handle filters (price, category)
* Handle sorting

---

### 🔹 Example Fetch Call

```js
useEffect(() => {
  fetch("http://localhost:5000/api/products")
    .then(res => res.json())
    .then(data => setProducts(data));
}, []);
```

---

### 🔹 State Management

```js
const [products, setProducts] = useState([]);
```

👉 Stores fetched data

---

### 🔹 Rendering Products

```js
products.map(product => (
  <div key={product.id}>
    <h3>{product.name}</h3>
    <p>{product.price}</p>
  </div>
));
```

---

# 🔌 API Endpoints

| Method | Endpoint        | Description      |
| ------ | --------------- | ---------------- |
| GET    | /api/products   | Get all products |
| GET    | /api/categories | Get categories   |

---

# 🔍 Features

* ✅ Dynamic filtering (price & category)
* ✅ Sorting (ascending / descending)
* ✅ Real-time DB queries
* ✅ Responsive UI
* ✅ Auto database setup
* ✅ Environment variable support

---

# 🔐 Environment Variables

## 📌 `.env`

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=product_db
PORT=5000
```

