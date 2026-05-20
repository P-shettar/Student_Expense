const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  category: { 
    type: String, 
    enum: ['Food', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Other'],
    required: true 
  },
  merchant: { type: String, required: true },
  paymentMethod: { type: String, enum: ['UPI', 'Card', 'Cash'], default: 'UPI' },
  type: { type: String, enum: ['Debit', 'Credit'], default: 'Debit' },
  status: { type: String, enum: ['Success', 'Failed', 'Pending'], default: 'Success' },
  location: { type: String, default: 'Unknown' },
  date: { type: String } // YYYY-MM-DD format
}, { timestamps: true });

// Index for faster queries on user and category
transactionSchema.index({ user: 1, category: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
