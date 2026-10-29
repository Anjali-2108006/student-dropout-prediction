const mongoose = require('mongoose');

const logisticsSchema = new mongoose.Schema(
  {
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      required: false,
    },
    transactionId: {
      type: String,
      default: '',
      trim: true,
    },
    pickupLocation: {
      type: String,
      required: [true, 'Pickup location is required'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination mandi/hub is required'],
      trim: true,
    },
    distanceKm: {
      type: Number,
      required: [true, 'Distance in km is required'],
      min: [0, 'Distance cannot be negative'],
    },
    transportCost: {
      type: Number,
      required: [true, 'Transport freight cost is required'],
      min: [0, 'Transport cost cannot be negative'],
    },
    transporter: {
      type: String,
      default: 'AgriExpress Cold Logistics',
      trim: true,
    },
    expectedDeliveryDate: {
      type: Date,
      default: () => new Date(+new Date() + 24 * 60 * 60 * 1000), // Default 24 hrs from creation
    },
    status: {
      type: String,
      enum: {
        values: [
          'Pending',
          'Pickup Scheduled',
          'Picked Up',
          'In Transit',
          'Delivered',
          'Cancelled',
          'pending',
          'pickup_scheduled',
          'assigned',
          'picked_up',
          'in_transit',
          'delivered',
          'cancelled'
        ],
        message: '{VALUE} is not a valid logistics status',
      },
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

const Logistics = mongoose.model('Logistics', logisticsSchema);

module.exports = Logistics;
