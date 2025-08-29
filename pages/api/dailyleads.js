import mongoose from 'mongoose';
import nodemailer from 'nodemailer';

const MONGO_URI = process.env.MONGO_URI;

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

const LeadSchema = new mongoose.Schema({
  name: String,
  cnic: String,
  mobile: String,
  city: String,
  income: String,
  products: String,
}, { timestamps: true });

const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);

export default async function handler(req, res) {
  // Cron secret check
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const leads = await Lead.find({});

    if (!leads.length) return res.status(200).json({ message: 'No leads today' });

    const headers = ['Name', 'CNIC', 'Mobile', 'City', 'Income', 'Products'];
    const rows = leads.map(l => [l.name, l.cnic, l.mobile, l.city, l.income, l.products]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'boss@example.com',
      subject: 'Daily Leads Report',
      text: 'Attached is the daily leads report.',
      attachments: [{ filename: 'leads.csv', content: csv }],
    });

    res.status(200).json({ message: 'Daily leads sent!' });
  } catch (err) {
    console.error('Error sending daily leads:', err);
    res.status(500).json({ message: 'Failed to send leads', error: err.message });
  }
}
