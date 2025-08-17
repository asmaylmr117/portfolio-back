
const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
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
  screens: {
    type: String,
    required: true
  },
  bSingle: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  authorTitle: {
    type: String,
    required: true
  },
  create_at: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    default: '0'
  },
  thumb: {
    type: String,
    required: true
  },
  blClass: {
    type: String,
    default: 'format-standard-image'
  },
  views: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create indexes
blogSchema.index({ slug: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ thumb: 1 });

module.exports = mongoose.model('Blog', blogSchema);