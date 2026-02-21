const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());

// ✅ Correct PORT
const PORT = process.env.DB_PORT || 3000;

// ✅ Proper DB Config
const DBConfig = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
});

// -------------------- CORS --------------------
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.REACT_APP_API_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
  })
);



// ================== GET ALL ==================
app.get("/books", async (req, res) => {
  try {
    const [rows] = await DBConfig.execute("SELECT * FROM books");
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});


// ================== DELETE ==================
app.delete("/books/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [result] = await DBConfig.execute(
      "DELETE FROM books WHERE id=?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});


// ================== INSERT ==================
app.post("/books", async (req, res) => {
  try {
    const { title, genre, price, qty } = req.body;

    const [result] = await DBConfig.execute(
      "INSERT INTO books (title, genre, price, qty) VALUES (?, ?, ?, ?)",
      [title, genre, price, qty]
    );

    return res.status(201).json({
      message: "Book created successfully",
      insertId: result.insertId,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});


// ================== UPDATE ==================
app.put("/books/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, genre, price, qty } = req.body;

    const [result] = await DBConfig.execute(
      "UPDATE books SET title=?, genre=?, price=?, qty=? WHERE id=?",
      [title, genre, price, qty, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json({ message: "Updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});


// ================== 404 ==================
app.use((req, res) => {
  return res.status(404).json({ message: "Route not found" });
});


app.listen(PORT, () => {
  console.log(`Server Running at ${PORT}`);
});