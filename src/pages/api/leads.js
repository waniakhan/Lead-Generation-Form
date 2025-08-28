import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}
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
});
const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);

export default async function handler(req, res) {
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
      const lead = new Lead(req.body);
      await lead.save();
      res.status(201).json({ message: 'Lead saved successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to save lead' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}