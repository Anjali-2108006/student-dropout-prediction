const mongoose = require('mongoose');
const User = require('../models/User');
const MarketPrice = require('../models/MarketPrice');
const BuyerDemand = require('../models/BuyerDemand');
const Lot = require('../models/Lot');
const Offer = require('../models/Offer');
const Transaction = require('../models/Transaction');
const Logistics = require('../models/Logistics');
const Grievance = require('../models/Grievance');

// Fallback datasets for offline mode
const fallbackStats = {
  totalUsers: 10,
  farmers: 3,
  fpos: 2,
  buyers: 4,
  verifiedBuyers: 3,
  activeLots: 3,
  activeBuyerDemands: 4,
  totalTransactions: 4,
  totalTransactionValue: 76400,
  pendingPayments: 2,
  openGrievances: 1,
  underReviewGrievances: 1,
  resolvedGrievances: 1,
  activeDeliveries: 2,
  totalDeliveries: 2,
};

// @desc    Get aggregated Admin summary metrics
// @route   GET /api/admin/stats
exports.getAdminStats = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const [
        totalUsers,
        farmers,
        fpos,
        buyers,
        verifiedBuyers,
        activeLots,
        activeBuyerDemands,
        transactions,
        grievances,
        logistics,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'farmer' }),
        User.countDocuments({ role: 'fpo' }),
        User.countDocuments({ role: 'buyer' }),
        User.countDocuments({ role: 'buyer', verified: true }),
        Lot.countDocuments({ status: 'available' }),
        BuyerDemand.countDocuments({ status: 'active' }),
        Transaction.find(),
        Grievance.find(),
        Logistics.find(),
      ]);

      const totalTransactionValue = transactions.reduce(
        (sum, t) => sum + (Number(t.totalAmount) || 0),
        0
      );

      const pendingPayments = transactions.filter((t) => {
        const p = (t.paymentStatus || '').toLowerCase();
        return p === 'pending' || p === 'processing' || p === 'initiated';
      }).length;

      const openGrievances = grievances.filter((g) => {
        const s = (g.status || '').toLowerCase().replace(/_/g, ' ');
        return s === 'open' || s === 'pending';
      }).length;

      const underReviewGrievances = grievances.filter((g) => {
        const s = (g.status || '').toLowerCase().replace(/_/g, ' ');
        return s === 'under review';
      }).length;

      const resolvedGrievances = grievances.filter((g) => {
        const s = (g.status || '').toLowerCase().replace(/_/g, ' ');
        return s === 'resolved' || s === 'closed';
      }).length;

      const activeDeliveries = logistics.filter((l) => {
        const s = (l.status || '').toLowerCase().replace(/_/g, ' ');
        return s !== 'delivered' && s !== 'cancelled';
      }).length;

      return res.status(200).json({
        success: true,
        data: {
          totalUsers,
          farmers,
          fpos,
          buyers,
          verifiedBuyers,
          activeLots,
          activeBuyerDemands,
          totalTransactions: transactions.length,
          totalTransactionValue,
          pendingPayments,
          openGrievances,
          underReviewGrievances,
          resolvedGrievances,
          activeDeliveries,
          totalDeliveries: logistics.length,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: fallbackStats,
      source: 'offline-fallback',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Market Price Analytics
// @route   GET /api/admin/analytics/markets
exports.getMarketAnalytics = async (req, res, next) => {
  try {
    let prices = [];
    if (mongoose.connection.readyState === 1) {
      prices = await MarketPrice.find();
    }

    if (!prices || prices.length === 0) {
      prices = [
        { crop: 'Tomato', market: 'Kolar APMC', modalPrice: 38, arrivalDate: new Date() },
        { crop: 'Tomato', market: 'Madanapalle APMC', modalPrice: 34, arrivalDate: new Date() },
        { crop: 'Tomato', market: 'Bowringpet APMC', modalPrice: 32, arrivalDate: new Date() },
        { crop: 'Tomato', market: 'Chittoor APMC', modalPrice: 30, arrivalDate: new Date() },
        { crop: 'Onion', market: 'Lasalgaon APMC', modalPrice: 28, arrivalDate: new Date() },
        { crop: 'Onion', market: 'Bengaluru APMC', modalPrice: 31, arrivalDate: new Date() },
        { crop: 'Onion', market: 'Madanapalle APMC', modalPrice: 26, arrivalDate: new Date() },
        { crop: 'Chilli', market: 'Guntur APMC', modalPrice: 52, arrivalDate: new Date() },
        { crop: 'Chilli', market: 'Chittoor APMC', modalPrice: 47, arrivalDate: new Date() },
        { crop: 'Potato', market: 'Agra APMC', modalPrice: 22, arrivalDate: new Date() },
        { crop: 'Potato', market: 'Bengaluru APMC', modalPrice: 25, arrivalDate: new Date() },
      ];
    }

    const cropTotals = {};
    prices.forEach((p) => {
      const crop = p.crop || 'Other';
      if (!cropTotals[crop]) {
        cropTotals[crop] = { sum: 0, count: 0 };
      }
      cropTotals[crop].sum += Number(p.modalPrice || p.pricePerKg || 0);
      cropTotals[crop].count += 1;
    });

    const cropAveragePrices = Object.keys(cropTotals).map((crop) => ({
      crop,
      avgPrice: Math.round((cropTotals[crop].sum / cropTotals[crop].count) * 10) / 10,
    }));

    const marketComparison = prices.slice(0, 8).map((p) => ({
      market: p.market,
      crop: p.crop,
      price: p.modalPrice || 30,
    }));

    const sorted = [...prices].sort((a, b) => (b.modalPrice || 0) - (a.modalPrice || 0));
    const highestMarket = sorted[0] || { market: 'Kolar APMC', modalPrice: 38, crop: 'Tomato' };
    const lowestMarket = sorted[sorted.length - 1] || { market: 'Agra APMC', modalPrice: 22, crop: 'Potato' };

    res.status(200).json({
      success: true,
      data: {
        totalRecords: prices.length,
        cropAveragePrices,
        marketComparison,
        highestMarket,
        lowestMarket,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Transaction & Payment Analytics
// @route   GET /api/admin/analytics/transactions
exports.getTransactionAnalytics = async (req, res, next) => {
  try {
    let txns = [];
    if (mongoose.connection.readyState === 1) {
      txns = await Transaction.find();
    }

    if (!txns || txns.length === 0) {
      txns = [
        { transactionId: 'TXN1001', crop: 'Tomato', quantity: 500, totalAmount: 17500, status: 'Confirmed', paymentStatus: 'Pending' },
        { transactionId: 'TXN1025', crop: 'Tomato', quantity: 500, totalAmount: 16500, status: 'delivered', paymentStatus: 'Pending' },
        { transactionId: 'TXN1024', crop: 'Tomato', quantity: 800, totalAmount: 23200, status: 'completed', paymentStatus: 'Paid' },
        { transactionId: 'TXN1023', crop: 'Chilli', quantity: 400, totalAmount: 19200, status: 'completed', paymentStatus: 'Paid' },
      ];
    }

    const totalTransactions = txns.length;
    const totalVolumeSoldKg = txns.reduce((sum, t) => sum + (Number(t.quantity) || 0), 0);
    const totalTransactionValue = txns.reduce((sum, t) => sum + (Number(t.totalAmount) || 0), 0);

    const statusCounts = {
      Confirmed: 0,
      Delivered: 0,
      Completed: 0,
      Pending: 0,
    };

    const paymentCounts = {
      Pending: 0,
      Processing: 0,
      Paid: 0,
      Failed: 0,
    };

    const cropValues = {};

    txns.forEach((t) => {
      const s = (t.status || '').toLowerCase();
      if (s === 'completed') statusCounts.Completed += 1;
      else if (s === 'delivered') statusCounts.Delivered += 1;
      else if (s === 'confirmed') statusCounts.Confirmed += 1;
      else statusCounts.Pending += 1;

      const p = (t.paymentStatus || '').toLowerCase();
      if (p === 'paid' || p === 'received') paymentCounts.Paid += 1;
      else if (p === 'processing' || p === 'initiated') paymentCounts.Processing += 1;
      else if (p === 'failed') paymentCounts.Failed += 1;
      else paymentCounts.Pending += 1;

      const crop = t.crop || 'Tomato';
      cropValues[crop] = (cropValues[crop] || 0) + (Number(t.totalAmount) || 0);
    });

    const cropValueChart = Object.keys(cropValues).map((crop) => ({
      crop,
      totalAmount: cropValues[crop],
    }));

    res.status(200).json({
      success: true,
      data: {
        totalTransactions,
        totalVolumeSoldKg,
        totalTransactionValue,
        statusBreakdown: Object.keys(statusCounts).map((k) => ({ status: k, count: statusCounts[k] })),
        paymentBreakdown: Object.keys(paymentCounts).map((k) => ({ status: k, count: paymentCounts[k] })),
        cropValueChart,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Logistics Analytics
// @route   GET /api/admin/analytics/logistics
exports.getLogisticsAnalytics = async (req, res, next) => {
  try {
    let logs = [];
    if (mongoose.connection.readyState === 1) {
      logs = await Logistics.find();
    }

    if (!logs || logs.length === 0) {
      logs = [
        { transactionId: 'TXN1001', status: 'Pickup Scheduled', transportCost: 3500, distanceKm: 180 },
        { transactionId: 'TXN1025', status: 'In Transit', transportCost: 1500, distanceKm: 85 },
      ];
    }

    const breakdown = {
      'Pickup Scheduled': 0,
      'Picked Up': 0,
      'In Transit': 0,
      'Delivered': 0,
      'Cancelled': 0,
    };

    let totalTransportCost = 0;

    logs.forEach((l) => {
      const s = l.status || 'In Transit';
      if (breakdown[s] !== undefined) breakdown[s] += 1;
      else breakdown['In Transit'] += 1;
      totalTransportCost += Number(l.transportCost || 0);
    });

    res.status(200).json({
      success: true,
      data: {
        totalShipments: logs.length,
        totalTransportCost,
        statusBreakdown: Object.keys(breakdown).map((status) => ({
          status,
          count: breakdown[status],
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Grievance Analytics
// @route   GET /api/admin/analytics/grievances
exports.getGrievanceAnalytics = async (req, res, next) => {
  try {
    let grvs = [];
    if (mongoose.connection.readyState === 1) {
      grvs = await Grievance.find();
    }

    if (!grvs || grvs.length === 0) {
      grvs = [
        { grievanceId: 'GRV1001', status: 'Under Review', issueType: 'Payment Not Received' },
        { grievanceId: 'GRV1002', status: 'Resolved', issueType: 'Delivery Delay' },
      ];
    }

    const statusCounts = {
      Open: 0,
      'Under Review': 0,
      Resolved: 0,
      Rejected: 0,
      Closed: 0,
    };

    const issueCounts = {};

    grvs.forEach((g) => {
      const s = (g.status || '').toLowerCase().replace(/_/g, ' ');
      if (s === 'open' || s === 'pending') statusCounts.Open += 1;
      else if (s === 'under review') statusCounts['Under Review'] += 1;
      else if (s === 'resolved') statusCounts.Resolved += 1;
      else if (s === 'rejected') statusCounts.Rejected += 1;
      else if (s === 'closed') statusCounts.Closed += 1;

      const issue = g.issueType || 'Other';
      issueCounts[issue] = (issueCounts[issue] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        totalGrievances: grvs.length,
        statusBreakdown: Object.keys(statusCounts).map((status) => ({
          status,
          count: statusCounts[status],
        })),
        issueBreakdown: Object.keys(issueCounts).map((issue) => ({
          issue,
          count: issueCounts[issue],
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get combined recent activity audit log
// @route   GET /api/admin/activity
exports.getAdminActivity = async (req, res, next) => {
  try {
    const activities = [
      {
        id: 'ACT-101',
        type: 'User Verified',
        description: 'Buyer "ABC Agro Foods Pvt Ltd" verified with GSTIN escrow credentials',
        user: 'APMC Market Admin',
        time: '15 mins ago',
        category: 'Verification',
        status: 'Completed',
      },
      {
        id: 'ACT-102',
        type: 'Payment Recorded',
        description: 'Demo payment recorded for TXN1024 (₹23,200) via Bank Transfer',
        user: 'Ramesh Patel',
        time: '1 hour ago',
        category: 'Payment',
        status: 'Paid',
      },
      {
        id: 'ACT-103',
        type: 'Delivery In Transit',
        description: 'Shipment TXN1025 dispatched from Madanapalle Farm Gate toward ABC Agro Hub',
        user: 'AgriExpress Cold Logistics',
        time: '2 hours ago',
        category: 'Logistics',
        status: 'In Transit',
      },
      {
        id: 'ACT-104',
        type: 'Grievance Under Review',
        description: 'Dispute ticket GRV1001 filed for TXN1001 moved to APMC arbitrator review',
        user: 'APMC Arbitrator Desk',
        time: '4 hours ago',
        category: 'Grievance',
        status: 'Under Review',
      },
      {
        id: 'ACT-105',
        type: 'New Bulk Demand',
        description: 'ABC Agro Foods posted requirement for 10 MT Tomato at ₹34/kg',
        user: 'ABC Agro Foods Pvt Ltd',
        time: '6 hours ago',
        category: 'Procurement',
        status: 'Active',
      },
      {
        id: 'ACT-106',
        type: 'New Harvest Lot',
        description: 'Farmer Ramesh Patel listed AGRI1025 (500 kg Sahu Hybrid Tomato)',
        user: 'Ramesh Patel',
        time: '1 day ago',
        category: 'Lot',
        status: 'Available',
      },
    ];

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};
