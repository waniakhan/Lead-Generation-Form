const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  timestamp: String,
  name: String,
  cnic: String,
  mobile: String,
  city: String,
  income: String,
  products: String
});

module.exports = mongoose.model('Lead', leadSchema);
