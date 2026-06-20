const Worker = require('../models/Worker');

exports.createWorker = async (req, res) => {
  try {
    const { name, phone, email, field, experience, hourlyRate, dailyRate, skills, bio } = req.body;

    const worker = new Worker({
      name,
      phone,
      email,
      field,
      experience,
      hourlyRate,
      dailyRate,
      skills,
      bio,
      contractor: req.user.userId,
      isVerified: true
    });

    await worker.save();
    res.status(201).json({ message: 'Worker created successfully', worker });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getWorkers = async (req, res) => {
  try {
    const { field, city, minRating } = req.query;
    let query = {};

    if (field) query.field = field;
    if (minRating) query.rating = { $gte: minRating };

    const workers = await Worker.find(query).populate('contractor', 'name phone');
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getWorkerById = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id).populate('contractor', 'name phone email');
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateWorker = async (req, res) => {
  try {
    const { name, phone, experience, hourlyRate, dailyRate, skills, bio, availability } = req.body;

    let worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    // Check if contractor owns this worker
    if (worker.contractor.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this worker' });
    }

    worker.name = name || worker.name;
    worker.phone = phone || worker.phone;
    worker.experience = experience || worker.experience;
    worker.hourlyRate = hourlyRate || worker.hourlyRate;
    worker.dailyRate = dailyRate || worker.dailyRate;
    worker.skills = skills || worker.skills;
    worker.bio = bio || worker.bio;
    worker.availability = availability !== undefined ? availability : worker.availability;

    await worker.save();
    res.json({ message: 'Worker updated successfully', worker });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.searchWorkers = async (req, res) => {
  try {
    const { keyword, field, maxPrice } = req.query;
    let query = { isVerified: true };

    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { skills: { $in: [new RegExp(keyword, 'i')] } }
      ];
    }

    if (field) query.field = field;
    if (maxPrice) query.dailyRate = { $lte: maxPrice };

    const workers = await Worker.find(query)
      .sort({ rating: -1 })
      .populate('contractor', 'name phone');
    
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getContractorWorkers = async (req, res) => {
  try {
    const workers = await Worker.find({ contractor: req.user.userId });
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
