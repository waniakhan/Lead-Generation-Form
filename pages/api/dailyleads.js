import nodemailer from "nodemailer";
import mongoose from "mongoose";

// --- MongoDB connection ---
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("❌ MONGO_URI is not defined in Vercel environment variables");
}

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (global.mongoose.conn) return global.mongoose.conn;

  if (!global.mongoose.promise) {
    global.mongoose.promise = mongoose
      .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
      .then((mongoose) => mongoose);
  }

  global.mongoose.conn = await global.mongoose.promise;
  return global.mongoose.conn;
}

// --- Schema ---
const leadSchema = new mongoose.Schema({
  name: String,
  email: String,
  cnic: String,
  mobile: String,
  city: String,
  income: String,
  products: String,
  accountType: String, 
});
const Lead = mongoose.models.Lead || mongoose.model("Lead", leadSchema);

// --- API Handler ---
export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      await dbConnect();

      const lead = new Lead(req.body);
      await lead.save();

      // --- Nodemailer Config ---
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS, // Gmail App Password (not your Gmail login password!)
        },
      });

      await transporter.sendMail({
        from: `"Daily Leads Report" <${process.env.EMAIL_USER}>`,
        to: "missshabana943@gmail.com",
        cc: ["UzmaRauf@faysalbank.com", "UmairMohsin@faysalbank.com", "YasserAbbas@faysalbank.com"],
        subject: `📊 Daily Leads Report - ${new Date().toLocaleDateString("en-GB")}`,
        text: "Attached is the daily leads report.",
        attachments: [
          {
            filename: `leads-${Date.now()}.csv`,
            content: csv,
          },
        ],
      });

      return res.status(200).json({ message: "✅ Lead saved & email sent" });
    } catch (err) {
      console.error("❌ Error in API:", err);
      return res.status(500).json({ message: "Failed to send leads", error: err.message });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
