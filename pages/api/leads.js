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
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// 🟢 Schema with validations
const LeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    cnic: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    city: String,
    income: String,
    products: String,
    accountType: { type: String, required: true }, // 👈 New field
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

      const { name, email, cnic, mobile, city, income, products, accountType } = req.body;

      // 🟢 Check duplicates separately
      if (await Lead.findOne({ name })) {
        return res.status(400).json({ message: "Name already registered" });
      }
      if (await Lead.findOne({ email })) {
        return res.status(400).json({ message: "Email already registered" });
      }
      if (await Lead.findOne({ cnic })) {
        return res.status(400).json({ message: "CNIC already registered" });
      }
      if (await Lead.findOne({ mobile })) {
        return res.status(400).json({ message: "Mobile already registered" });
      }

      // Save new lead
      const lead = new Lead({ name, email, cnic, mobile, city, income, products, accountType });
      await lead.save();
      console.log("Lead saved:", req.body);

      return res.status(201).json({ message: '✅ Lead saved successfully' });
    } catch (err) {
      console.error("❌ Error in lead API:", err);
      return res.status(500).json({ message: 'Failed to process lead', error: err.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
