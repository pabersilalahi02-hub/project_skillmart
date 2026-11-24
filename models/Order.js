const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requirementDescription: { type: String, required: true },
  scheduledDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Menunggu Konfirmasi', 'Diterima', 'Sedang Dikerjakan', 'Selesai', 'Dibatalkan'],
    default: 'Menunggu Konfirmasi'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);