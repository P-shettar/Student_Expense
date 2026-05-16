const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Get Prediction
router.get('/predict', authMiddleware, async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/predict/expense/${req.user.id}`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to connect to AI Service', details: err.message });
  }
});

// Get Outliers
router.get('/outliers', authMiddleware, async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/analyze/outliers/${req.user.id}`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to connect to AI Service' });
  }
});

// Get Patterns
router.get('/patterns', authMiddleware, async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/analyze/patterns/${req.user.id}`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to connect to AI Service' });
  }
});

// Get Weak Points
router.get('/weak-points', authMiddleware, async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/analyze/weak_points/${req.user.id}`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to connect to AI Service' });
  }
});

// Chat Assistant
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const response = await axios.post(`${AI_SERVICE_URL}/chat/${req.user.id}`, { message });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to connect to AI Chatbot' });
  }
});

// Get Subscriptions
router.get('/subscriptions', authMiddleware, async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/analyze/subscriptions/${req.user.id}`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to connect to AI Service' });
  }
});

module.exports = router;
