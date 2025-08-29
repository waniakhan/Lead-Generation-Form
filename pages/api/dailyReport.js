import mongoose from "mongoose";
import nodemailer from "nodemailer";
import { Parser } from "json2csv";

// --- MongoDB connection ---
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) throw new Error("❌ MONGO_URI not set in env");

if (!global.mongoose) global.mongoose = { conn: null, promise: null };

async function dbConnect() {
  if (global.mongoose.conn) return global.mongoose.conn;
  if (!global.mongoose.promise) {
    global.mongoose.promise = mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
  global.mongoose.conn = await global.mongoose.promise;
  return global.mongoose.conn;
}

// --- Schema ---
const LeadSchema = new mongoose.Schema(
  {
    name: String,
    cnic: String,
    mobile: String,
    city: String,
    income: String,
    products: String,
  },
  { timestamps: true } // 👈 createdAt & updatedAt automatically add ho jayenge
);

const Lead = mongoose.models.Lead || mongoose.model("Lead", LeadSchema);

// --- API Handler ---
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();

    // 🔎 Last 4 days ka filter
    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

    // Agar sirf last 4 days chahiye:
    // const leads = await Lead.find({ createdAt: { $gte: fourDaysAgo } }).lean();

    // ⚡ Abhi sabhi leads laane ke liye:
    const leads = await Lead.find().lean();

    if (!leads.length) {
      return res.status(200).json({ message: "No leads found" });
    }

    // Date readable bana do
    const leadsWithDate = leads.map((l) => ({
      ...l,
      createdAt: new Date(l.createdAt).toLocaleString("en-GB", {
        timeZone: "Asia/Karachi",
      }),
    }));

    // CSV me convert karo
    const parser = new Parser({
      fields: ["name", "cnic", "mobile", "city", "income", "products", "createdAt"],
    });
    const csv = parser.parse(leadsWithDate);

    // Nodemailer config
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Mail bhejo
    await transporter.sendMail({
      from: `"Daily Leads Report" <${process.env.EMAIL_USER}>`,
      to: "missshabana943@gmail.com", // 👈 Boss ki email
      subject: `📊 Daily Leads Report - ${new Date().toLocaleDateString("en-GB")}`,
      text: "Attached is the daily leads report.",
      attachments: [
        {
          filename: `leads-${Date.now()}.csv`,
          content: csv,
        },
      ],
    });

    return res.status(200).json({ message: "✅ Report sent successfully" });
  } catch (err) {
    console.error("❌ Error in daily report:", err);
    return res.status(500).json({ message: "Failed to send report", error: err.message });
  }
}
