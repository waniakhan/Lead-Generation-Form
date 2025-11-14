import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI, {
        // Options from user's original code
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// 🟢 SCHEMA MODIFIED to align with the current form fields and remove unnecessary 'required' flags
const LeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    
    // Email is no longer required as it was removed from the frontend form.
    email: { 
      type: String,
      required: false, // <-- CRITICAL FIX: No longer required
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    cnic: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    city: String,

    // 🟢 Mapped fields to match the frontend: 'product' and 'intent'
    product: String, 
    intent: String, 
  },
  { timestamps: true }
);

const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      await dbConnect();
      console.log("DB Connected");

      // 🟢 Destructure updated fields that match the frontend
      const { name, cnic, mobile, city, product, intent } = req.body; 

      // Check for duplication (removed the email check)
      if (await Lead.findOne({ name })) {
         return res.status(400).json({ message: "Name might already be registered. Please check details." });
      }
      if (await Lead.findOne({ cnic })) {
        return res.status(400).json({ message: "CNIC already registered" });
      }
      if (await Lead.findOne({ mobile })) {
        return res.status(400).json({ message: "Mobile already registered" });
      }

      // Save new lead
      // 🟢 Saving the fields sent by the frontend
      const lead = new Lead({ name, cnic, mobile, city, product, intent });
      await lead.save();
      console.log("Lead saved:", req.body);

      return res.status(201).json({ message: '✅ Lead saved successfully' });
    } catch (err) {
      console.error("❌ Error in lead API:", err);
      // Added check for Mongoose Validation error
      if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(val => val.message).join('; ');
        return res.status(400).json({ message: `Validation failed: ${errors}` });
      }
      return res.status(500).json({ message: 'Failed to process lead due to internal server error.', error: err.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}