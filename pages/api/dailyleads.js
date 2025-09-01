import mongoose from "mongoose";
import { Parser } from "json2csv";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
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

const LeadSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    cnic: String,
    mobile: String,
    city: String,
    income: String,
    products: String,
    accountType: String,
  },
  { timestamps: true }
);

const Lead = mongoose.models.Lead || mongoose.model("Lead", LeadSchema);

export default async function handler(req, res) {
  try {
    await dbConnect();

    const leads = await Lead.find().lean();
    if (!leads.length) {
      return res.status(200).json({ message: "⚠️ No leads found for report" });
    }

    const fields = [
      "timestamp",
      "name",
      "email",
      "cnic",
      "mobile",
      "city",
      "income",
      "products",
      "accountType",
    ];
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

    // 🔑 Encode CSV to base64
    const base64Csv = Buffer.from(csv).toString("base64");

    // ✅ Send with encoding
    await resend.emails.send({
      from: "DoNotReply <donotreply@faysalbank.com>",
      to: ["missshabana943@gmail.com", "HarisShakir@faysalbank.com"],
      subject: `📊 Daily Leads Report - ${new Date().toLocaleDateString("en-GB")}`,
      text: "Attached is the daily leads report.",
      attachments: [
        {
          filename: `leads-${Date.now()}.csv`,
          content: base64Csv,
          encoding: "base64", // 👈 very important
        },
      ],
    });

    res.status(200).json({ message: "✅ Daily report sent successfully" });
  } catch (err) {
    console.error("❌ Error sending report:", err);
    res
      .status(500)
      .json({ message: "Failed to send daily report", error: err.message });
  }
}
