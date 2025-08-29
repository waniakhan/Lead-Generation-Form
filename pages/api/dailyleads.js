import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

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

export async function GET(req) {
  // Cron secret check
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    await dbConnect();
    const leads = await Lead.find({});

    if (!leads.length) return NextResponse.json({ message: 'No leads today' });

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
      to: 'boss@example.com', // yahan apna boss ka email daalo
      subject: 'Daily Leads Report',
      text: 'Attached is the daily leads report.',
      attachments: [{ filename: 'leads.csv', content: csv }],
    });

    return NextResponse.json({ message: 'Daily leads sent!' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Failed to send leads', error: err }, { status: 500 });
  }
}
