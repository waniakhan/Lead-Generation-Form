const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const leadsRoute = require("./routes/lead");

const app = express();

// CORS options
const corsOptions = {
  origin: "https://lead-generation-form-nu.vercel.app",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json()); // Parse JSON bodies

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
