import mongoose from 'mongoose';
import { Parser } from 'json2csv';
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

      // ✅ instead of JSON email → generate full report
      const leads = await Lead.find().lean();
      const fields = ["timestamp", "name", "cnic", "mobile", "city", "income", "products"];
      const parser = new Parser({ fields });
      const csv = parser.parse(leads.map(l => ({
        timestamp: l.createdAt,
        name: l.name,
        cnic: l.cnic,
        mobile: l.mobile,
        city: l.city,
        income: l.income,
        products: l.products,
      })));

      // --- Nodemailer Config ---
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // --- Send Report Email ---
      await transporter.sendMail({
        from: `"Lead Generator" <${process.env.EMAIL_USER}>`,
        to: "missshabana943@gmail.com", // boss ki email
        subject: "📊 Lead Report",
        text: "Attached is the latest lead report.",
        attachments: [
          {
            filename: "leads-report.csv",
            content: csv,
          },
        ],
      });

      res.status(201).json({ message: '✅ Lead saved & report email sent' });
    } catch (err) {
      console.error("❌ Error in lead API:", err);
      res.status(500).json({ message: 'Failed to process lead', error: err.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
