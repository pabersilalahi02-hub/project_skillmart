const express = require('express');
const Order = require('../models/Order');
const Service = require('../models/Service');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/orders (Diproteksi JWT)
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ customer: req.user._id }, { provider: req.user._id }]
    })
      .populate('service', 'title price')
      .populate('customer', 'name email')
      .populate('provider', 'name email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/orders (Diproteksi JWT)
router.post('/', protect, async (req, res) => {
  try {
    const { serviceId, requirementDescription, scheduledDate } = req.body;
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Jasa tidak ditemukan' });

    const order = await Order.create({
      customer: req.user._id,
      service: service._id,
      provider: service.provider,
      requirementDescription,
      scheduledDate,
      status: 'Menunggu Konfirmasi'
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/orders/:id (Diproteksi JWT)
router.put('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });

    order.status = req.body.status || order.status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;