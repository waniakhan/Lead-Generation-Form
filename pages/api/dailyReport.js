import mongoose from "mongoose";
import { Parser } from "json2csv";
import nodemailer from "nodemailer";

const MONGO_URI = process.env.MONGO_URI;
const EMAIL_USER = process.env.EMAIL_USER; // your Gmail
const EMAIL_PASS = process.env.EMAIL_PASS; // Gmail App password

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

const LeadSchema = new mongoose.Schema(
  {
    name: String,
    cnic: String,
    mobile: String,
    city: String,
    intent: String,
    products: String,
    accountType: String,
  },
  { timestamps: true }
);

const Lead =
  mongoose.models.Lead || mongoose.model("Lead", LeadSchema);

export default async function handler(req, res) {
  try {
    await dbConnect();
    const leads = await Lead.find().lean();

    if (!leads.length) {
      return res
        .status(200)
        .json({ message: "⚠️ No leads found for report" });
    }

    // CSV banao
    const fields = [
      "timestamp",
      "name",
      "cnic",
      "mobile",
      "city",
      "intent",
      "product"
    ];

    const parser = new Parser({ fields });

    const csv = parser.parse(
      leads.map((l) => ({
        timestamp: l.createdAt,
        name: l.name,
        cnic: l.cnic,
        mobile: l.mobile,
        city: l.city,
        intent: l.intent,
        product: l.product,
      }))
    );

    // Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Daily Leads Report" <${EMAIL_USER}>`,
      to: "UzmaRauf@faysalbank.com",
      cc: [
        "MAqibAslam@faysalbank.com",
        "salmanmalik@faysalbank.com",
        "Khaldoonaslam@faysalbank.com",
        "HarisShakir@faysalbank.com",
      ],
      subject: `📊 Daily Leads Report - ${new Date().toLocaleDateString(
        "en-GB"
      )}`,
      text: "Attached is the daily leads report.",
      attachments: [
        {
          filename: `leads-${Date.now()}.csv`,
          content: csv,
        },
      ],
    });

    res
      .status(200)
      .json({ message: "✅ Daily report sent successfully via Gmail SMTP" });
  } catch (err) {
    console.error("❌ Error sending report:", err);
    res.status(500).json({
      message: "Failed to send daily report",
      error: err.message,
    });
  }
}
