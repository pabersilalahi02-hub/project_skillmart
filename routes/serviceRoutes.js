const express = require('express');
const Service = require('../models/Service');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/services (Publik - mendukung ?search=...&category=...)
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let filter = {};

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    if (category) {
      filter.category = category;
    }

    const services = await Service.find(filter)
      .populate('provider', 'name email contact bio')
      .populate('category', 'name');
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/services/:id (Publik)
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('provider', 'name email contact bio portfolio')
      .populate('category', 'name');
    if (!service) return res.status(404).json({ message: 'Jasa tidak ditemukan' });
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/services (Diproteksi JWT)
router.post('/', protect, async (req, res) => {
  try {
    const service = await Service.create({
      ...req.body,
      provider: req.user._id
    });
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/services/:id (Diproteksi JWT)
router.put('/:id', protect, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Jasa tidak ditemukan' });

    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bukan pemilik jasa ini' });
    }

    const updatedService = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedService);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/services/:id (Diproteksi JWT)
router.delete('/:id', protect, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Jasa tidak ditemukan' });

    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bukan pemilik jasa ini' });
    }

    await service.deleteOne();
    res.json({ message: 'Jasa berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;