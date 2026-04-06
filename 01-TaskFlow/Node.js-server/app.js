require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const taskRouter = require("./src/routes/Task");

const { HOST, CLIENT_PORT, PORT, DB_CONNECTION_STRING } = process.env;

const corsOptions = {
    origin: [`http://${HOST}:${CLIENT_PORT}`],
    credentials: true,
    methods: 'GET,POST,PUT,DELETE,PATCH',
    allowedHeaders: 'Content-Type,Authorization',
    preflightContinue: false
};

const app = express();
app.use(express.json());
app.use(cors(corsOptions));

// API Routes
app.use("/tasks", taskRouter);

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/build')));

// Catch-all route: serve index.html for any non-API route
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

mongoose.connect(DB_CONNECTION_STRING)
.then(() =>
  console.log("✅ Connected to MongoDB"))
.catch((err) =>
  console.error("❌ MongoDB connection error:", err)
);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
});