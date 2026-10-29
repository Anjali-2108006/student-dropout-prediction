const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: () => `TXN${Math.floor(1000 + Math.random() * 9000)}`,
    },
    lot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lot',
      required: false,
    },
    crop: {
      type: String,
      default: '',
      trim: true,
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
    quantity: {
      type: Number,
      required: [true, 'Transaction quantity in kg is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    pricePerKg: {
      type: Number,
      required: [true, 'Price per kg is required'],
      min: [0, 'Price per kg cannot be negative'],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: [
          'order_created',
          'offer_accepted',
          'dispatched',
          'delivered',
          'completed',
          'Confirmed',
          'confirmed',
          'Pending',
          'pending',
        ],
        message: '{VALUE} is not a valid transaction status',
      },
      default: 'Confirmed',
    },
    paymentStatus: {
      type: String,
      enum: {
        values: [
          'Pending',
          'pending',
          'Processing',
          'processing',
          'Paid',
          'paid',
          'Failed',
          'failed',
          'initiated',
          'Initiated',
          'received',
          'Received',
        ],
        message: '{VALUE} is not a valid payment status',
      },
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Bank Transfer', 'Cash', 'Other', ''],
      default: '',
    },
    paymentReference: {
      type: String,
      default: '',
      trim: true,
    },
    paymentDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-compute totalAmount before saving if not explicitly supplied
transactionSchema.pre('validate', function (next) {
  if (this.quantity && this.pricePerKg && (!this.totalAmount || this.totalAmount === 0)) {
    this.totalAmount = Math.round(this.quantity * this.pricePerKg);
  }
  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
