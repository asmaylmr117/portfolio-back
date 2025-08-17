
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  Id: {
    type: String,
    required: true,
    unique: true
  },
  sImg: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  thumb1: {
    type: String,
    default: ''
  },
  thumb2: {
    type: String,
    default: ''
  },
  col: {
    type: String,
    default: 'col-lg-4'
  },
  description: {
    type: String,
    default: ''
  },
  features: {
    type: [String],
    default: []
  },
  price: {
    type: Number,
    default: 0
  },
  duration: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  popular: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create indexes
serviceSchema.index({ slug: 1 });
serviceSchema.index({ title: 1 });
serviceSchema.index({ isActive: 1 });

module.exports = mongoose.model('Service', serviceSchema);