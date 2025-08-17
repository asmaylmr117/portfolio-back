const express = require('express');
const router = express.Router();
const Team = require('../models/Team');

// GET all team members
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, active, title, search } = req.query;
    const query = {};

    if (active !== undefined) query.isActive = active === 'true';
    if (title) query.title = new RegExp(title, 'i');
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { title: new RegExp(search, 'i') },
        { bio: new RegExp(search, 'i') },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const teams = await Team.find(query)
      .sort({ joinDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Team.countDocuments(query);

    res.json({
      teams,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single team member by ID or slug
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findOne({
      $or: [{ Id: req.params.id }, { slug: req.params.id }]
    });
    
    if (!team) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new team member
router.post('/', async (req, res) => {
  try {
    const team = new Team(req.body);
    const newTeam = await team.save();
    res.status(201).json(newTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update team member
router.put('/:id', async (req, res) => {
  try {
    const team = await Team.findOneAndUpdate(
      { $or: [{ Id: req.params.id }, { slug: req.params.id }] },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!team) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    
    res.json(team);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE team member
router.delete('/:id', async (req, res) => {
  try {
    const team = await Team.findOneAndDelete({
      $or: [{ Id: req.params.id }, { slug: req.params.id }]
    });
    
    if (!team) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    
    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET team members by position/title
router.get('/position/:title', async (req, res) => {
  try {
    const teams = await Team.find({ 
      title: new RegExp(req.params.title, 'i'),
      isActive: true 
    }).sort({ joinDate: -1 });
    
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET active team members
router.get('/active/all', async (req, res) => {
  try {
    const teams = await Team.find({ isActive: true })
      .sort({ joinDate: -1 });
    
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST toggle team member status
router.post('/:id/toggle-status', async (req, res) => {
  try {
    const team = await Team.findOne({
      $or: [{ Id: req.params.id }, { slug: req.params.id }]
    });
    
    if (!team) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    
    team.isActive = !team.isActive;
    await team.save();
    
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET team statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalMembers = await Team.countDocuments();
    const activeMembers = await Team.countDocuments({ isActive: true });
    const inactiveMembers = await Team.countDocuments({ isActive: false });
    
    // Count by positions
    const positionStats = await Team.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$title', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      totalMembers,
      activeMembers,
      inactiveMembers,
      positionStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;