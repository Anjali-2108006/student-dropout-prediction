const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    lot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lot',
      required: false,
    },
    lotId: {
      type: String,
      default: '',
      trim: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    buyerName: {
      type: String,
      default: '',
      trim: true,
    },
    offeredPrice: {
      type: Number,
      required: [true, 'Offered price is required'],
      min: [0, 'Offered price cannot be negative'],
    },
    quantity: {
      type: String,
      required: [true, 'Quantity is required'],
      trim: true,
    },
    message: {
      type: String,
      default: '',
      trim: true,
    },
    counterPrice: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'rejected', 'negotiating', 'Pending', 'Accepted', 'Rejected', 'Negotiating'],
        message: '{VALUE} is not a valid offer status',
      },
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;
