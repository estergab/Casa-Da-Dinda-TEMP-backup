const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const larSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  hostName: {
    type: String,
    required: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  phone: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true,
    maxlength: 2,
    minlength: 2
  },
  address: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  hasYard: {
    type: Boolean,
    default: false
  },
  hasFence: {
    type: Boolean,
    default: false
  },
  experience: {
    type: String
  },
  availableFor: [{
    type: String,
    enum: ['Cães', 'Gatos', 'Cães de Grande Porte', 'Filhotes'],
    required: true
  }],
  description: {
    type: String
  },
  imageUrl: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Lar', larSchema);