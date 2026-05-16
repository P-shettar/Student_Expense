require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/student_expense';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB...');

    // Clear existing data
    await User.deleteMany({});
    await Transaction.deleteMany({});
    console.log('Cleared existing data.');

    // Create a dummy user
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);
    
    const user = new User({
      name: 'Test Student',
      email: 'student@test.com',
      password,
      walletBalance: 50000,
      dailyLimit: 3000,
      monthlyBudget: 20000
    });
    await user.save();
    console.log('Created test user (student@test.com / password123)');

    // Generate 1000 transactions for the past 6 months
    const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Other'];
    const paymentMethods = ['UPI', 'Card', 'Cash'];
    const transactions = [];

    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    for (let i = 0; i < 1000; i++) {
      const isWeekend = faker.datatype.boolean(); // Simulate weekend behavior later in AI
      let amount = parseFloat(faker.finance.amount({ min: 20, max: 1000, dec: 2 }));
      
      // Some outliers
      if (Math.random() < 0.05) {
        amount = parseFloat(faker.finance.amount({ min: 3000, max: 8000, dec: 2 }));
      }

      transactions.push({
        user: user._id,
        amount,
        category: faker.helpers.arrayElement(categories),
        merchant: faker.company.name(),
        paymentMethod: faker.helpers.arrayElement(paymentMethods),
        type: 'Debit',
        status: 'Success',
        location: faker.location.city(),
        createdAt: faker.date.between({ from: sixMonthsAgo, to: now })
      });
    }

    await Transaction.insertMany(transactions);
    console.log('Successfully seeded 1000 transactions.');
    
    process.exit();
  } catch (err) {
    console.error('Error seeding DB:', err);
    process.exit(1);
  }
};

seedDatabase();
