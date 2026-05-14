const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// Support Ticket Schema
const SupportTicketSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  category: { type: String, enum: ['Booking Issues', 'Venue Management', 'Payouts & Wallet', 'Technical', 'Other'], default: 'Other' },
  description: { type: String, required: true },
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  messages: [{
    sender: { type: String, enum: ['user', 'support'], required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const SupportTicket = mongoose.model('SupportTicket', SupportTicketSchema);

// Get all support tickets for logged-in user
router.get('/tickets', auth, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user_id: req.user.id })
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get single ticket
router.get('/tickets/:id', auth, async (req, res) => {
  try {
    const ticket = await SupportTicket.findOne({ 
      _id: req.params.id, 
      user_id: req.user.id 
    });
    
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }
    
    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create new support ticket
router.post('/tickets', auth, async (req, res) => {
  try {
    const { subject, category, description, priority } = req.body;
    
    if (!subject || !description) {
      return res.status(400).json({ msg: 'Subject and description are required' });
    }

    const ticket = await SupportTicket.create({
      user_id: req.user.id,
      subject,
      category: category || 'Other',
      description,
      priority: priority || 'Medium',
      messages: [{
        sender: 'user',
        message: description,
        timestamp: new Date()
      }]
    });

    res.json({ 
      msg: 'Support ticket created successfully',
      ticket 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add message to ticket
router.post('/tickets/:id/messages', auth, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ msg: 'Message is required' });
    }

    const ticket = await SupportTicket.findOne({ 
      _id: req.params.id, 
      user_id: req.user.id 
    });
    
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    ticket.messages.push({
      sender: 'user',
      message,
      timestamp: new Date()
    });
    
    ticket.updatedAt = new Date();
    await ticket.save();

    res.json({ 
      msg: 'Message added successfully',
      ticket 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update ticket status
router.patch('/tickets/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Open', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }

    const ticket = await SupportTicket.findOne({ 
      _id: req.params.id, 
      user_id: req.user.id 
    });
    
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    ticket.status = status;
    ticket.updatedAt = new Date();
    await ticket.save();

    res.json({ 
      msg: 'Ticket status updated',
      ticket 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Initiate live chat (placeholder)
router.post('/chat/start', auth, async (req, res) => {
  try {
    // TODO: Integrate with live chat service (Intercom, Zendesk, etc.)
    res.json({ 
      msg: 'Live chat integration pending. For now, please create a support ticket.',
      chatAvailable: false,
      supportHours: '8 AM - 10 PM IST',
      alternativeContact: {
        phone: '+91 80 4567 8900',
        email: 'partner-support@turfx.in'
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
