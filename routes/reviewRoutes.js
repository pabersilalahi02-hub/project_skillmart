const express = require('express');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Service = require('../models/Service');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/reviews/:serviceId (Publik)
router.get('/:serviceId', async (req, res) => {
  try {
    const reviews = await Review.find({ service: req.params.serviceId })
      .populate('customer', 'name');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/reviews (Diproteksi JWT)
router.post('/', protect, async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Anda tidak berhak mengulas pesanan ini' });
    }
    if (order.status !== 'Selesai') {
      return res.status(400).json({ message: 'Ulasan hanya dapat diberikan jika pesanan sudah Selesai' });
    }

    const review = await Review.create({
      order: order._id,
      service: order.service,
      customer: req.user._id,
      rating,
      comment
    });

    const allReviews = await Review.find({ service: order.service });
    const avgRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;

    await Service.findByIdAndUpdate(order.service, {
      ratingAverage: avgRating.toFixed(1),
      totalReviews: allReviews.length
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;