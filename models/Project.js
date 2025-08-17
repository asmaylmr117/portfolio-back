
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  Id: {
    type: String,
    required: true,
    unique: true
  },
  pImg: {
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
  sub: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: true
  },
  Industry: {
    type: String,
    default: ''
  },
  Country: {
    type: String,
    default: ''
  },
  Technologies1: {
    type: String,
    default: ''
  },
  Technologies2: {
    type: String,
    default: ''
  },
  thumb1: {
    type: String,
    default: ''
  },
  thumb2: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'general'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'in-progress', 'on-hold'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create indexes
projectSchema.index({ slug: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ status: 1 });

module.exports = mongoose.model('Project', projectSchema);