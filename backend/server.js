const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const leadsRoute = require("./routes/lead");

const app = express();

// Middleware
const allowedOrigins = ["https://lead-generation-form-nu.vercel.app"];
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

app.use(bodyParser.json());

// Routes
app.use("/api/leads", leadsRoute);

// MongoDB connection
mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true, useUnifiedTopology: true }
)
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error(err));

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
