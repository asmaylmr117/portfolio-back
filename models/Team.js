
const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  Id: {
    type: String,
    required: true,
    unique: true
  },
  tImg: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  email: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  socialLinks: {
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    github: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  skills: {
    type: [String],
    default: []
  },
  experience: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  joinDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes
teamSchema.index({ slug: 1 });
teamSchema.index({ name: 1 });
teamSchema.index({ title: 1 });

module.exports = mongoose.model('Team', teamSchema);