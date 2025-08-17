
const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

// GET all services
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, active, popular, search } = req.query;
    const query = {};

    if (active !== undefined) query.isActive = active === 'true';
    if (popular !== undefined) query.popular = popular === 'true';
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { features: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const services = await Service.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Service.countDocuments(query);

    res.json({
      services,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single service by ID or slug
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findOne({
      $or: [{ Id: req.params.id }, { slug: req.params.id }]
    });
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new service
router.post('/', async (req, res) => {
  try {
    const service = new Service(req.body);
    const newService = await service.save();
    res.status(201).json(newService);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update service
router.put('/:id', async (req, res) => {
  try {
    const service = await Service.findOneAndUpdate(
      { $or: [{ Id: req.params.id }, { slug: req.params.id }] },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE service
router.delete('/:id', async (req, res) => {
  try {
    const service = await Service.findOneAndDelete({
      $or: [{ Id: req.params.id }, { slug: req.params.id }]
    });
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET popular services
router.get('/popular/all', async (req, res) => {
  try {
    const services = await Service.find({ 
      popular: true, 
      isActive: true 
    }).sort({ createdAt: -1 });
    
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET active services
router.get('/active/all', async (req, res) => {
  try {
    const services = await Service.find({ isActive: true })
      .sort({ createdAt: -1 });
    
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST toggle service status
router.post('/:id/toggle-status', async (req, res) => {
  try {
    const service = await Service.findOne({
      $or: [{ Id: req.params.id }, { slug: req.params.id }]
    });
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    service.isActive = !service.isActive;
    await service.save();
    
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;