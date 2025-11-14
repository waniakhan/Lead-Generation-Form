import mongoose from 'mongoose';
import { Parser } from 'json2csv';
import nodemailer from 'nodemailer';

const MONGO_URI = process.env.MONGO_URI;
const EMAIL_USER = process.env.EMAIL_USER; // your Gmail
const EMAIL_PASS = process.env.EMAIL_PASS; // Gmail App password

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

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

const LeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    cnic: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    city: String,
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

      const { name, cnic, mobile, city, product, intent } = req.body; 

      if (await Lead.findOne({ name })) {
         return res.status(400).json({ message: "Name might already be registered. Please check details." });
      }
      if (await Lead.findOne({ cnic })) {
        return res.status(400).json({ message: "CNIC already registered" });
      }
      if (await Lead.findOne({ mobile })) {
        return res.status(400).json({ message: "Mobile already registered" });
      }

      const lead = new Lead({ name, cnic, mobile, city, product, intent });
      await lead.save();
      console.log("Lead saved:", req.body);

      return res.status(201).json({ message: '✅ Lead saved successfully' });
    } catch (err) {
      console.error("❌ Error in lead API:", err);
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
