const mongoose = require('mongoose');

const lotSchema = new mongoose.Schema(
  {
    lotId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: () => `AGRI${Math.floor(1000 + Math.random() * 9000)}`,
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    farmerName: {
      type: String,
      default: '',
      trim: true,
    },
    crop: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
    },
    variety: {
      type: String,
      default: '',
      trim: true,
    },
    quantity: {
      type: String,
      required: [true, 'Produce quantity is required'],
      trim: true,
    },
    qualityGrade: {
      type: String,
      required: [true, 'Quality grade is required'],
      trim: true,
    },
    harvestDate: {
      type: Date,
      default: Date.now,
    },
    expectedPrice: {
      type: Number,
      required: [true, 'Expected price per kg is required'],
      min: [0, 'Expected price cannot be negative'],
    },
    location: {
      type: String,
      required: [true, 'Farm gate location is required'],
      trim: true,
    },
    availableFrom: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: [
          'available',
          'offer_received',
          'accepted',
          'dispatched',
          'delivered',
          'completed',
        ],
        message: '{VALUE} is not a valid lot status',
      },
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
);

const Lot = mongoose.model('Lot', lotSchema);

module.exports = Lot;
