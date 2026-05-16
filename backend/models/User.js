const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  walletBalance: { type: Number, default: 10000 }, // Fake UPI wallet balance
  dailyLimit: { type: Number, default: 2000 },
  monthlyBudget: { type: Number, default: 15000 },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
