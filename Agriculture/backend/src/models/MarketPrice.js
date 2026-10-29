const mongoose = require('mongoose');

const marketPriceSchema = new mongoose.Schema(
  {
    crop: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
    },
    market: {
      type: String,
      required: [true, 'Market / Mandi name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    pricePerKg: {
      type: Number,
      required: [true, 'Price per kg is required'],
      min: [0, 'Price per kg cannot be negative'],
    },
    arrivalVolume: {
      type: Number,
      required: [true, 'Arrival volume is required'],
      min: [0, 'Arrival volume cannot be negative'],
    },
    unit: {
      type: String,
      default: 'kg',
      trim: true,
    },
    source: {
      type: String,
      default: 'Demo Data',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const MarketPrice = mongoose.model('MarketPrice', marketPriceSchema);

module.exports = MarketPrice;
