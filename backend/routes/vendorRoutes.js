const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Vendor = require('../models/Vendor');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY }); // User provides this in .env

// GET /api/vendors - List all vendors
router.get('/', async (req, res) => {
  try {
    const vendors = await Vendor.findAll();
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/vendor/menu - Fetch menu (Expects vendorId in query for now: ?vendorId=1)
router.get('/menu', async (req, res) => {
  try {
    const { vendorId } = req.query;
    if (!vendorId) {
      return res.status(400).json({ error: 'Vendor ID is required' });
    }
    const menuItems = await MenuItem.findAll({ where: { vendor_id: vendorId } });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/vendor/menu - Add item
router.post('/menu', async (req, res) => {
  try {
    const { vendorId, name, price, base_prep_time, category } = req.body;
    if (!vendorId || !name || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const newItem = await MenuItem.create({
      vendor_id: vendorId,
      name,
      price,
      base_prep_time: base_prep_time || 5, // Default 5 mins
      category: category || 'General',
    });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/vendor/status - Update shop status
router.put('/status', async (req, res) => {
  try {
    const { vendorId, status } = req.body;
    if (!vendorId || !status) {
      return res.status(400).json({ error: 'Vendor ID and status are required' });
    }
    const vendor = await Vendor.findByPk(vendorId);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    vendor.status = status;
    await vendor.save();
    res.json({ message: 'Status updated', vendor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /:id/insight - Get AI insight
router.get('/:id/insight', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Context
    const activeOrders = await Order.count({
        where: {
            vendor_id: id,
            status: { [Op.in]: ['pending', 'preparing'] }
        }
    });
    
    // Heuristic: 5 mins per order
    const estimatedWait = activeOrders * 5;

    // 2. Groq
    const chatCompletion = await groq.chat.completions.create({
        messages: [{
            role: 'user',
            content: `Context: Campus Canteen. Vendor has ${activeOrders} active orders in queue. Estimated backlog is ${estimatedWait} mins.
            Task: Write a very short (max 15 words) status message for a student app. 
            Tone: Helpful, transparent.
            Examples:
            - "Kitchen is quiet! Great time to grab a quick bite."
            - "High demand right now. Expect a ~20 min wait."
            - "Standard rush. Orders are moving steadily."`
        }],
        model: 'openai/gpt-oss-120b',
    });

    const insight = chatCompletion.choices[0]?.message?.content || "Status currently unavailable.";
    
    res.json({ insight });

  } catch (error) {
    console.error("Groq Error:", error);
    // Fallback if API fails or no key
    res.json({ insight: "Live status updates unavailable." });
  }
});

module.exports = router;
