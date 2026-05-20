const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }
    
    let user = await User.findOne({ email });
    if (user) return res.status(409).json({ error: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'supersecret', { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: user._id, name, email, walletBalance: user.walletBalance } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }
    
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'supersecret', { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email, walletBalance: user.walletBalance } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Current User (Protected)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user settings
router.put('/settings', authMiddleware, async (req, res) => {
  try {
    const { monthlyBudget, dailyLimit, name } = req.body;
    const user = await User.findById(req.user.id);
    
    if (monthlyBudget) user.monthlyBudget = Number(monthlyBudget);
    if (dailyLimit) user.dailyLimit = Number(dailyLimit);
    if (name) user.name = name;
    
    await user.save();
    res.json({ message: 'Settings updated successfully', user: { id: user._id, name: user.name, email: user.email, walletBalance: user.walletBalance, monthlyBudget: user.monthlyBudget, dailyLimit: user.dailyLimit } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add Funds to Wallet
router.post('/add-funds', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    const user = await User.findById(req.user.id);
    user.walletBalance = (user.walletBalance || 0) + Number(amount);
    await user.save();
    res.json({ message: 'Funds added successfully', newBalance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Settings (Protected)
router.put('/settings', authMiddleware, async (req, res) => {
  try {
    const { name, monthlyBudget, dailyLimit } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name) user.name = name;
    if (monthlyBudget !== undefined) user.monthlyBudget = Number(monthlyBudget);
    if (dailyLimit !== undefined) user.dailyLimit = Number(dailyLimit);

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
