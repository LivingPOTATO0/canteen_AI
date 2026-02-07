const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vendor = require('../models/Vendor');

// Secret Key (Should be in .env, but for MVP hardcoded or fallback)
const JWT_SECRET = process.env.JWT_SECRET || 'tomato_secret_key_123';

// POST /register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, shopName } = req.body;

        // Check if user exists
        let user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create User
        user = await User.create({
            name,
            email,
            password_hash: hashedPassword,
            role: role || 'student'
        });

        // If Vendor, create Vendor profile
        if (role === 'vendor') {
            if (!shopName) {
                return res.status(400).json({ error: 'Shop Name is required for vendors' });
            }
            await Vendor.create({
                user_id: user.id,
                name: shopName,
                status: 'closed'
            });
        }

        // Generate Token
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// POST /login
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Check User
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check Role (Optional security measure)
        if (role && user.role !== role) {
             return res.status(403).json({ error: `Not authorized as a ${role}` });
        }

        // Check Password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // If Vendor, fetch Vendor ID
        let vendorData = null;
        if (user.role === 'vendor') {
            const vendor = await Vendor.findOne({ where: { user_id: user.id } });
            if (vendor) {
                vendorData = vendor;
            }
        }

        // Generate Token
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                vendorId: vendorData ? vendorData.id : null,
                shopName: vendorData ? vendorData.name : null
            },
            token
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

module.exports = router;
