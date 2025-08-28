const express = require('express');
const router = express.Router();
const Lead = require('../models/lead');

// POST new lead
router.post('/', async (req, res) => {
  try {
    const lead = new Lead(req.body);
    await lead.save();
    res.status(201).json({ message: 'Lead saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save lead' });
  }
});

module.exports = router;
