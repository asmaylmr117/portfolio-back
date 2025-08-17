
const express = require('express');
const router = express.Router();
const Blog = require('../models/Blogs');

// GET all blogs
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, author, thumb, search } = req.query;
    const query = { isPublished: true };

    if (author) query.author = new RegExp(author, 'i');
    if (thumb) query.thumb = new RegExp(thumb, 'i');
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Blog.countDocuments(query);

    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single blog by ID
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findOne({ 
      $or: [{ id: req.params.id }, { slug: req.params.id }] 
    });
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new blog
router.post('/', async (req, res) => {
  try {
    const blog = new Blog(req.body);
    const newBlog = await blog.save();
    res.status(201).json(newBlog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update blog
router.put('/:id', async (req, res) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { $or: [{ id: req.params.id }, { slug: req.params.id }] },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.json(blog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE blog
router.delete('/:id', async (req, res) => {
  try {
    const blog = await Blog.findOneAndDelete({
      $or: [{ id: req.params.id }, { slug: req.params.id }]
    });
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET blogs by category/thumb
router.get('/category/:thumb', async (req, res) => {
  try {
    const blogs = await Blog.find({ 
      thumb: new RegExp(req.params.thumb, 'i'),
      isPublished: true 
    }).sort({ createdAt: -1 });
    
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET recent blogs
router.get('/recent/:count', async (req, res) => {
  try {
    const count = parseInt(req.params.count) || 5;
    const blogs = await Blog.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .limit(count);
    
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;