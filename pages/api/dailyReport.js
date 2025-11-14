// pages/api/dailyReport.js
import mongoose from "mongoose";
import { Parser } from "json2csv";
import fetch from "node-fetch";

const MONGO_URI = process.env.MONGO_URI;
const RESEND_API_KEY = process.env.RESEND_API_KEY; // Resend API key
const RESEND_DOMAIN = process.env.RESEND_DOMAIN; // e.g. yourname.resend.email

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

const LeadSchema = new mongoose.Schema({
  name: String,
  email: String,
  cnic: String,
  mobile: String,
  city: String,
  income: String,
  products: String,
  accountType: String,
}, { timestamps: true });

const Lead = mongoose.models.Lead || mongoose.model("Lead", LeadSchema);

export default async function handler(req, res) {
  try {
    await dbConnect();
    const leads = await Lead.find().lean();

    if (!leads.length) {
      return res.status(200).json({ message: "⚠️ No leads found for report" });
    }

    const fields = ["timestamp","name","email","cnic","mobile","city","income","products","accountType"];
    const parser = new Parser({ fields });
    const csv = parser.parse(
      leads.map(l => ({
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

    // --- Send via Resend API ---
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_DOMAIN,
        to: ["salmanmalik@faysalbank.com"],   // jisko bhejna hai
        cc: ["MAqibAslam@faysalbank.com","UzmaRauf@faysalbank.com","Khaldoonaslam@faysalbank.com","HarisShakir@faysalbank.com"],
        subject: `📊 Daily Leads Report - ${new Date().toLocaleDateString("en-GB")}`,
        text: "Attached is the daily leads report.",
        attachments: [
          {
            name: `leads-${Date.now()}.csv`,
            content: Buffer.from(csv).toString("base64"),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Resend API failed: ${errText}`);
    }

    res.status(200).json({ message: "✅ Daily report sent successfully via Resend" });
  } catch (err) {
    console.error("❌ Error sending report:", err);
    res.status(500).json({ message: "Failed to send daily report", error: err.message });
  }
}
