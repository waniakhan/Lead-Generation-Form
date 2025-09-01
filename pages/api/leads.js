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

// 🟢 Schema with validations & unique constraints
const LeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
  },
  cnic: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  mobile: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  city: String,
  income: String,
  products: String,
}, { timestamps: true });

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

      // 🟢 Duplicate check (extra safety)
      const exists = await Lead.findOne({
        $or: [
          { name: req.body.name },
          { email: req.body.email },
          { cnic: req.body.cnic },
          { mobile: req.body.mobile },
        ]
      });

      if (exists) {
        return res.status(400).json({ message: '❌ Duplicate entry: Name, Email, CNIC, or Mobile already exists' });
      }

      const lead = new Lead(req.body);
      await lead.save();
      console.log("Lead saved:", req.body);

      res.status(201).json({ message: '✅ Lead saved successfully' });
    } catch (err) {
      console.error("❌ Error in lead API:", err);
      res.status(500).json({ message: 'Failed to process lead', error: err.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
