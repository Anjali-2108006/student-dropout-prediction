const Offer = require('../models/Offer');
const mongoose = require('mongoose');

const fallbackOffers = [
  { _id: '64e000000000000000000001', lotId: 'AGRI1025', buyerName: 'ABC Agro Foods Pvt Ltd', offeredPrice: 33, quantity: '500 kg', message: 'Ready to arrange direct farm pickup with 100% escrow.', status: 'pending', createdAt: new Date() },
  { _id: '64e000000000000000000002', lotId: 'AGRI1025', buyerName: 'Kisan Fresh Mart', offeredPrice: 32.5, quantity: '500 kg', message: 'Immediate settlement upon digital weighment.', status: 'pending', createdAt: new Date() },
  { _id: '64e000000000000000000003', lotId: 'AGRI1026', buyerName: 'South Green Retailers', offeredPrice: 25, quantity: '1,200 kg', message: 'Bulk purchase for retail chain supply.', status: 'pending', createdAt: new Date() },
];

exports.getOffers = async (req, res, next) => {
  try {
    const { status, lotId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (lotId) filter.lotId = lotId;

    if (mongoose.connection.readyState === 1) {
      const offers = await Offer.find(filter).populate('buyer', 'name email phone').populate('lot').sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: offers.length, data: offers });
    }

    let filtered = [...fallbackOffers];
    if (status) filtered = filtered.filter((o) => o.status === status);
    if (lotId) filtered = filtered.filter((o) => o.lotId === lotId);

    res.status(200).json({ success: true, count: filtered.length, data: filtered, source: 'offline-fallback' });
  } catch (error) {
    next(error);
  }
};

exports.getOfferById = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const offer = await Offer.findById(req.params.id).populate('buyer', 'name email phone').populate('lot');
      if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
      return res.status(200).json({ success: true, data: offer });
    }

    const offer = fallbackOffers.find((o) => o._id === req.params.id);
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
    res.status(200).json({ success: true, data: offer });
  } catch (error) {
    next(error);
  }
};

exports.createOffer = async (req, res, next) => {
  try {
    const { lot, lotId, buyer, buyerName, offeredPrice, quantity, message, status } = req.body;

    if (offeredPrice === undefined || !quantity) {
      return res.status(400).json({ success: false, message: 'Please provide offeredPrice and quantity' });
    }

    if (mongoose.connection.readyState === 1) {
      const newOffer = await Offer.create({
        lot,
        lotId: lotId || '',
        buyer,
        buyerName: buyerName || '',
        offeredPrice,
        quantity,
        message: message || '',
        status: status || 'pending',
      });
      return res.status(201).json({ success: true, data: newOffer });
    }

    const mockOffer = {
      _id: `mock-${Date.now()}`,
      lotId: lotId || 'AGRI1025',
      buyerName: buyerName || 'ABC Agro Foods',
      offeredPrice: Number(offeredPrice),
      quantity,
      message: message || '',
      status: status || 'pending',
      createdAt: new Date(),
    };
    fallbackOffers.push(mockOffer);

    res.status(201).json({ success: true, data: mockOffer });
  } catch (error) {
    next(error);
  }
};

exports.updateOffer = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const updated = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Offer not found' });
      return res.status(200).json({ success: true, data: updated });
    }

    const idx = fallbackOffers.findIndex((o) => o._id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Offer not found' });
    fallbackOffers[idx] = { ...fallbackOffers[idx], ...req.body };
    res.status(200).json({ success: true, data: fallbackOffers[idx] });
  } catch (error) {
    next(error);
  }
};

exports.deleteOffer = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const deleted = await Offer.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Offer not found' });
      return res.status(200).json({ success: true, message: 'Offer deleted successfully' });
    }

    return res.status(200).json({ success: true, message: 'Offer deleted successfully' });
  } catch (error) {
    next(error);
  }
};
