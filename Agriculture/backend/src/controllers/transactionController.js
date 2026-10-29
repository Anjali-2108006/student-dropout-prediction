const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

const fallbackTransactions = [
  { _id: '64f000000000000000000000', transactionId: 'TXN1001', crop: 'Tomato', farmerName: 'Ramesh Patel', buyerName: 'ABC Agro Foods Pvt Ltd', quantity: 500, pricePerKg: 35, totalAmount: 17500, status: 'Confirmed', paymentStatus: 'Pending', paymentMethod: '', paymentReference: '', paymentDate: null, createdAt: new Date('2026-09-05') },
  { _id: '64f000000000000000000001', transactionId: 'TXN1025', crop: 'Tomato', farmerName: 'Ramesh Patel', buyerName: 'ABC Agro Foods Pvt Ltd', quantity: 500, pricePerKg: 33, totalAmount: 16500, status: 'delivered', paymentStatus: 'Pending', paymentMethod: '', paymentReference: '', paymentDate: null, createdAt: new Date('2026-09-04') },
  { _id: '64f000000000000000000002', transactionId: 'TXN1024', crop: 'Tomato', farmerName: 'Ramesh Patel', buyerName: 'FreshRoots Wholesalers', quantity: 800, pricePerKg: 29, totalAmount: 23200, status: 'completed', paymentStatus: 'Paid', paymentMethod: 'Bank Transfer', paymentReference: 'DEMO-PAY-1024', paymentDate: new Date('2026-08-29'), createdAt: new Date('2026-08-28') },
  { _id: '64f000000000000000000003', transactionId: 'TXN1023', crop: 'Chilli', farmerName: 'Srinivasulu Reddy', buyerName: 'SpiceHub Exporters', quantity: 400, pricePerKg: 48, totalAmount: 19200, status: 'completed', paymentStatus: 'Paid', paymentMethod: 'UPI', paymentReference: 'DEMO-PAY-1023', paymentDate: new Date('2026-08-23'), createdAt: new Date('2026-08-22') },
];

exports.getTransactions = async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    if (mongoose.connection.readyState === 1) {
      const txns = await Transaction.find(filter)
        .populate('farmer', 'name email phone location')
        .populate('buyer', 'name email phone')
        .populate('lot')
        .sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: txns.length, data: txns });
    }

    let filtered = [...fallbackTransactions];
    if (status) filtered = filtered.filter((t) => t.status === status);
    if (paymentStatus) filtered = filtered.filter((t) => t.paymentStatus === paymentStatus);

    res.status(200).json({ success: true, count: filtered.length, data: filtered, source: 'offline-fallback' });
  } catch (error) {
    next(error);
  }
};

exports.getTransactionById = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
      const query = isObjectId ? { $or: [{ _id: req.params.id }, { transactionId: req.params.id }] } : { transactionId: req.params.id };

      const txn = await Transaction.findOne(query)
        .populate('farmer', 'name email phone location')
        .populate('buyer', 'name email phone')
        .populate('lot');

      if (!txn) return res.status(404).json({ success: false, message: 'Transaction not found' });
      return res.status(200).json({ success: true, data: txn });
    }

    const txn = fallbackTransactions.find((t) => t._id === req.params.id || t.transactionId === req.params.id);
    if (!txn) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.status(200).json({ success: true, data: txn });
  } catch (error) {
    next(error);
  }
};

exports.createTransaction = async (req, res, next) => {
  try {
    const { transactionId, lot, crop, farmer, farmerName, buyer, buyerName, quantity, pricePerKg, status, paymentStatus } = req.body;

    const numQty = typeof quantity === 'number' ? quantity : parseFloat(quantity) || 0;
    const numPrice = typeof pricePerKg === 'number' ? pricePerKg : parseFloat(pricePerKg) || 0;

    if (numQty <= 0 || numPrice <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide valid quantity and pricePerKg greater than zero' });
    }

    const assignedId = transactionId || `TXN${Math.floor(1000 + Math.random() * 9000)}`;
    const totalAmount = Math.round(numQty * numPrice);

    if (mongoose.connection.readyState === 1) {
      const newTxn = await Transaction.create({
        transactionId: assignedId,
        lot,
        crop: crop || '',
        farmer,
        farmerName: farmerName || '',
        buyer,
        buyerName: buyerName || '',
        quantity: Number(quantity),
        pricePerKg: Number(pricePerKg),
        totalAmount,
        status: status || 'order_created',
        paymentStatus: paymentStatus || 'pending',
      });
      return res.status(201).json({ success: true, data: newTxn });
    }

    const mockTxn = {
      _id: `mock-${Date.now()}`,
      transactionId: assignedId,
      crop: crop || 'Tomato',
      farmerName: farmerName || 'Ramesh Patel',
      buyerName: buyerName || 'ABC Agro Foods',
      quantity: Number(quantity),
      pricePerKg: Number(pricePerKg),
      totalAmount,
      status: status || 'order_created',
      paymentStatus: paymentStatus || 'pending',
      createdAt: new Date(),
    };
    fallbackTransactions.push(mockTxn);

    res.status(201).json({ success: true, data: mockTxn });
  } catch (error) {
    next(error);
  }
};

exports.updateTransaction = async (req, res, next) => {
  try {
    // If quantity or pricePerKg updated, re-evaluate totalAmount
    if (req.body.quantity && req.body.pricePerKg) {
      req.body.totalAmount = Math.round(Number(req.body.quantity) * Number(req.body.pricePerKg));
    }

    // Auto-populate demo payment reference and date if marking as Paid
    if (req.body.paymentStatus && req.body.paymentStatus.toLowerCase() === 'paid') {
      req.body.paymentStatus = 'Paid';
      if (!req.body.paymentDate) {
        req.body.paymentDate = new Date();
      }
      if (!req.body.paymentReference) {
        const idSuffix = req.params.id.replace(/\D/g, '') || Math.floor(1000 + Math.random() * 9000);
        req.body.paymentReference = `DEMO-PAY-${idSuffix}`;
      }
      if (!req.body.paymentMethod) {
        req.body.paymentMethod = 'UPI';
      }
    } else if (req.body.paymentStatus && req.body.paymentStatus.toLowerCase() === 'processing') {
      req.body.paymentStatus = 'Processing';
    } else if (req.body.paymentStatus && req.body.paymentStatus.toLowerCase() === 'pending') {
      req.body.paymentStatus = 'Pending';
    } else if (req.body.paymentStatus && req.body.paymentStatus.toLowerCase() === 'failed') {
      req.body.paymentStatus = 'Failed';
    }

    if (mongoose.connection.readyState === 1) {
      const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
      const query = isObjectId ? { $or: [{ _id: req.params.id }, { transactionId: req.params.id }] } : { transactionId: req.params.id };

      const updated = await Transaction.findOneAndUpdate(query, req.body, { new: true, runValidators: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Transaction not found' });
      return res.status(200).json({ success: true, data: updated, message: 'Demo payment recorded successfully.' });
    }

    const idx = fallbackTransactions.findIndex((t) => t._id === req.params.id || t.transactionId === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Transaction not found' });
    fallbackTransactions[idx] = { ...fallbackTransactions[idx], ...req.body };
    res.status(200).json({ success: true, data: fallbackTransactions[idx], message: 'Demo payment recorded successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.deleteTransaction = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
      const query = isObjectId ? { $or: [{ _id: req.params.id }, { transactionId: req.params.id }] } : { transactionId: req.params.id };

      const deleted = await Transaction.findOneAndDelete(query);
      if (!deleted) return res.status(404).json({ success: false, message: 'Transaction not found' });
      return res.status(200).json({ success: true, message: 'Transaction deleted successfully' });
    }

    return res.status(200).json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    next(error);
  }
};
