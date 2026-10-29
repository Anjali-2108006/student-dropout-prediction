const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema(
  {
    grievanceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: () => `GRV${Math.floor(1000 + Math.random() * 9000)}`,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      required: false,
    },
    transactionRef: {
      type: String,
      default: '',
      trim: true,
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    complainantName: {
      type: String,
      default: '',
      trim: true,
    },
    againstEntity: {
      type: String,
      default: '',
      trim: true,
    },
    issueType: {
      type: String,
      enum: {
        values: [
          'Payment Not Received',
          'Quantity Mismatch',
          'Quality Dispute',
          'Delivery Delay',
          'Damaged Goods',
          'Incorrect Price',
          'Other',
          'payment_delay',
          'quality_dispute',
          'quantity_dispute',
          'transport_issue',
          'other',
        ],
        message: '{VALUE} is not a valid grievance issue type',
      },
      required: [true, 'Issue type classification is required'],
    },
    description: {
      type: String,
      required: [true, 'Detailed grievance description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: [
          'Open',
          'Under Review',
          'Resolved',
          'Rejected',
          'Closed',
          'pending',
          'under_review',
          'resolved',
          'rejected',
          'closed',
        ],
        message: '{VALUE} is not a valid grievance status',
      },
      default: 'Open',
    },
    resolution: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Grievance = mongoose.model('Grievance', grievanceSchema);

module.exports = Grievance;
