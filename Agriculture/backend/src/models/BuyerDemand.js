const mongoose = require('mongoose');

const buyerDemandSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Optional ObjectId to allow flexible demo seeding
    },
    buyerName: {
      type: String,
      default: '',
      trim: true,
    },
    crop: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
    },
    quantity: {
      type: String,
      required: [true, 'Demand quantity is required'],
      trim: true,
    },
    qualityGrade: {
      type: String,
      default: 'Grade A',
      trim: true,
    },
    offeredPrice: {
      type: Number,
      required: [true, 'Offered price is required'],
      min: [0, 'Offered price cannot be negative'],
    },
    location: {
      type: String,
      required: [true, 'Delivery location is required'],
      trim: true,
    },
    requiredBy: {
      type: Date,
      default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000), // Default 7 days from now
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'fulfilled', 'closed'],
        message: '{VALUE} is not a valid status. Allowed: active, fulfilled, closed',
      },
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

const BuyerDemand = mongoose.model('BuyerDemand', buyerDemandSchema);

module.exports = BuyerDemand;
