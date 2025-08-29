import mongoose from 'mongoose';
import nodemailer from 'nodemailer';

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

// Lead Schema
const LeadSchema = new mongoose.Schema({
  name: String,
  cnic: String,
  mobile: String,
  city: String,
  income: String,
  products: String,
}, { timestamps: true });

const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);

// API handler
export default async function handler(req, res) {
  // Temporary CORS
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

      const lead = new Lead(req.body);
      await lead.save();
      console.log("Lead saved:", req.body);

      // --- Nodemailer Config ---
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,  // e.g. hafizawania654@gmail.com
          pass: process.env.EMAIL_PASS,  // 16-digit App password
        },
      });

      // --- Send Email ---
      await transporter.sendMail({
        from: `"Lead Generator" <${process.env.EMAIL_USER}>`,
        to: "missshabana943@gmail.com",  // 👈 Boss ki email
        subject: "New Lead Received",
        text: JSON.stringify(req.body, null, 2),
      });

      res.status(201).json({ message: '✅ Lead saved & email sent' });
    } catch (err) {
      console.error("❌ Error in lead API:", err);
      res.status(500).json({ message: 'Failed to process lead', error: err.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
