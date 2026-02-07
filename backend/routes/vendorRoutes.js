const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const MenuItem = require('../models/MenuItem');

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

module.exports = router;
