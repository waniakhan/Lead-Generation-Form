import mongoose from "mongoose";
import { Parser } from "json2csv";
import nodemailer from "nodemailer";

const MONGO_URI = process.env.MONGO_URI;

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
      .then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

const LeadSchema = new mongoose.Schema({
  name: String,
  email: String,
  cnic: String,
  mobile: String,
  city: String,
  income: String,
  products: String,
  accountType: String, // 👈 Added
}, { timestamps: true });

const Lead = mongoose.models.Lead || mongoose.model("Lead", LeadSchema);

export default async function handler(req, res) {
  try {
    await dbConnect();

    const leads = await Lead.find().lean();
    if (!leads.length) {
      return res.status(200).json({ message: "⚠️ No leads found for report" });
    }

    const fields = ["timestamp", "name", "email", "cnic", "mobile", "city", "income", "products", "accountType"];
    const parser = new Parser({ fields });
    const csv = parser.parse(
      leads.map((l) => ({
        timestamp: l.createdAt,
        name: l.name,
        email: l.email,
        cnic: l.cnic,
        mobile: l.mobile,
        city: l.city,
        income: l.income,
        products: l.products,
        accountType: l.accountType,
      }))
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Daily Leads Report" <${process.env.EMAIL_USER}>`,
      to: "missshabana943@gmail.com",
      cc: ["UzmaRauf@faysalbank.com", "UmairMohsin@faysalbank.com", "YasserAbbas@faysalbank.com"],
      subject: `📊 Daily Leads Report - ${new Date().toLocaleDateString("en-GB")}`,
      text: "Attached is the daily leads report.",
      attachments: [{ filename: `leads-${Date.now()}.csv`, content: csv }],
    });

    res.status(200).json({ message: "✅ Daily report sent successfully" });
  } catch (err) {
    console.error("❌ Error sending report:", err);
    res.status(500).json({ message: "Failed to send daily report", error: err.message });
  }
}
