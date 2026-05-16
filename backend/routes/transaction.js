const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Get all transactions for the logged in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a manual transaction
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { amount, merchant, category, type, paymentMethod } = req.body;
    
    if (!amount || !merchant || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const transaction = new Transaction({
      user: req.user.id,
      amount: Number(amount),
      merchant,
      category,
      type: type || 'Debit',
      paymentMethod: paymentMethod || 'Cash',
      status: 'Success'
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Fake UPI Payment Simulation
router.post('/upi-pay', authMiddleware, async (req, res) => {
  try {
    const { amount, merchant, category, location } = req.body;

    const user = await User.findById(req.user.id);
    
    // Check if enough balance
    if (user.walletBalance < amount) {
      return res.status(400).json({ error: 'Insufficient balance in Fake UPI Wallet', code: 'INSUFFICIENT_FUNDS' });
    }

    // Check Daily Limit (Naive check for today's transactions)
    const today = new Date();
    today.setHours(0,0,0,0);
    const todaysTransactions = await Transaction.aggregate([
      { $match: { user: user._id, createdAt: { $gte: today }, type: 'Debit' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const todaysSpent = todaysTransactions.length > 0 ? todaysTransactions[0].total : 0;
    let limitWarning = null;
    if (todaysSpent + amount > user.dailyLimit) {
      limitWarning = 'You have exceeded your daily spending limit. The payment was processed as an emergency.';
    }

    // Process Transaction
    user.walletBalance -= amount;
    await user.save();

    const transaction = new Transaction({
      user: user._id,
      amount,
      category,
      merchant,
      paymentMethod: 'UPI',
      type: 'Debit',
      status: 'Success',
      location: location || 'Unknown'
    });
    await transaction.save();

    res.status(201).json({ 
      message: 'Payment successful', 
      transaction, 
      newBalance: user.walletBalance,
      limitWarning 
    });

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
