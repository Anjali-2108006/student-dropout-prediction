require('dotenv').config();
const mongoose = require ('mongoose');

// Import all models
const User = require('./models/User');
const MarketPrice = require('./models/MarketPrice');
const BuyerDemand = require('./models/BuyerDemand');
const Lot = require('./models/Lot');
const Offer = require('./models/Offer');
const Transaction = require('./models/Transaction');
const Logistics = require('./models/Logistics');
const Grievance = require('./models/Grievance');

// Seed Data Definition
const seedUsers = [
  // 3 Farmers
  {
    name: 'Ramesh Patel',
    email: 'ramesh.farmer@agrilink.in',
    phone: '+91 98450 12345',
    password: 'password123',
    role: 'farmer',
    location: 'Madanapalle, Andhra Pradesh',
    verified: true,
  },
  {
    name: 'Srinivasulu Reddy',
    email: 'srinivasulu.reddy@agrilink.in',
    phone: '+91 98450 67890',
    password: 'password123',
    role: 'farmer',
    location: 'Chittoor, Andhra Pradesh',
    verified: true,
  },
  {
    name: 'Venkatamma K.',
    email: 'venkatamma.k@agrilink.in',
    phone: '+91 98450 11223',
    password: 'password123',
    role: 'farmer',
    location: 'Tirupati, Andhra Pradesh',
    verified: true,
  },

  // 1 FPO
  {
    name: 'Rayalaseema Horticulture Producers FPO',
    email: 'contact@rayalaseemafpo.in',
    phone: '+91 98450 55443',
    password: 'password123',
    role: 'fpo',
    location: 'Madanapalle Cluster, Andhra Pradesh',
    verified: true,
  },

  // 4 Buyers
  {
    name: 'ABC Agro Foods Pvt Ltd',
    email: 'procurement@abcagrofoods.com',
    phone: '+91 98765 11223',
    password: 'password123',
    role: 'buyer',
    location: 'Bengaluru, Karnataka',
    verified: true,
  },
  {
    name: 'Kisan Fresh Mart',
    email: 'purchasing@kisanfreshmart.in',
    phone: '+91 98765 33445',
    password: 'password123',
    role: 'buyer',
    location: 'Chittoor, Andhra Pradesh',
    verified: true,
  },
  {
    name: 'South Green Retailers',
    email: 'sourcing@southgreen.in',
    phone: '+91 98765 66778',
    password: 'password123',
    role: 'buyer',
    location: 'Tirupati, Andhra Pradesh',
    verified: true,
  },
  {
    name: 'Heritage Foods Bulk',
    email: 'bulk@heritagefoods.com',
    phone: '+91 98765 99887',
    password: 'password123',
    role: 'buyer',
    location: 'Bengaluru, Karnataka',
    verified: true,
  },

  // 1 Admin
  {
    name: 'APMC Market Surveillance Admin',
    email: 'admin@agrilink.gov.in',
    phone: '+91 98000 00001',
    password: 'adminpassword',
    role: 'admin',
    location: 'Amaravati / Bengaluru',
    verified: true,
  },
];

// At least 20 market price records across Tomato, Onion, Chilli, Potato and markets
const seedMarketPrices = [
  // Tomato in Bengaluru (Date trend Sept 1 - Sept 5)
  { crop: 'Tomato', market: 'Bengaluru', location: 'Bengaluru APMC, KA', date: new Date('2026-09-01'), pricePerKg: 25, arrivalVolume: 350, unit: 'kg', source: 'APMC Electronic Portal' },
  { crop: 'Tomato', market: 'Bengaluru', location: 'Bengaluru APMC, KA', date: new Date('2026-09-02'), pricePerKg: 26, arrivalVolume: 340, unit: 'kg', source: 'APMC Electronic Portal' },
  { crop: 'Tomato', market: 'Bengaluru', location: 'Bengaluru APMC, KA', date: new Date('2026-09-03'), pricePerKg: 27, arrivalVolume: 310, unit: 'kg', source: 'APMC Electronic Portal' },
  { crop: 'Tomato', market: 'Bengaluru', location: 'Bengaluru APMC, KA', date: new Date('2026-09-04'), pricePerKg: 29, arrivalVolume: 305, unit: 'kg', source: 'APMC Electronic Portal' },
  { crop: 'Tomato', market: 'Bengaluru', location: 'Bengaluru APMC, KA', date: new Date('2026-09-05'), pricePerKg: 35, arrivalVolume: 300, unit: 'kg', source: 'APMC Electronic Portal' },

  // Tomato in Madanapalle, Chittoor, Tirupati
  { crop: 'Tomato', market: 'Madanapalle', location: 'Madanapalle Mandi, AP', date: new Date('2026-09-05'), pricePerKg: 28, arrivalVolume: 120, unit: 'kg', source: 'Mandi Board Data' },
  { crop: 'Tomato', market: 'Chittoor', location: 'Chittoor APMC, AP', date: new Date('2026-09-05'), pricePerKg: 30, arrivalVolume: 150, unit: 'kg', source: 'Mandi Board Data' },
  { crop: 'Tomato', market: 'Tirupati', location: 'Tirupati Mandi, AP', date: new Date('2026-09-05'), pricePerKg: 32, arrivalVolume: 180, unit: 'kg', source: 'Mandi Board Data' },
  { crop: 'Tomato', market: 'Madanapalle', location: 'Madanapalle Mandi, AP', date: new Date('2026-09-04'), pricePerKg: 26, arrivalVolume: 130, unit: 'kg', source: 'Mandi Board Data' },

  // Onion across markets
  { crop: 'Onion', market: 'Madanapalle', location: 'Madanapalle Mandi, AP', date: new Date('2026-09-05'), pricePerKg: 22, arrivalVolume: 85, unit: 'kg', source: 'Mandi Board Data' },
  { crop: 'Onion', market: 'Chittoor', location: 'Chittoor APMC, AP', date: new Date('2026-09-05'), pricePerKg: 24, arrivalVolume: 110, unit: 'kg', source: 'Mandi Board Data' },
  { crop: 'Onion', market: 'Tirupati', location: 'Tirupati Mandi, AP', date: new Date('2026-09-05'), pricePerKg: 25, arrivalVolume: 140, unit: 'kg', source: 'Mandi Board Data' },
  { crop: 'Onion', market: 'Bengaluru', location: 'Bengaluru APMC, KA', date: new Date('2026-09-05'), pricePerKg: 27, arrivalVolume: 210, unit: 'kg', source: 'APMC Electronic Portal' },
  { crop: 'Onion', market: 'Bengaluru', location: 'Bengaluru APMC, KA', date: new Date('2026-09-04'), pricePerKg: 26, arrivalVolume: 220, unit: 'kg', source: 'APMC Electronic Portal' },

  // Chilli across markets
  { crop: 'Chilli', market: 'Madanapalle', location: 'Madanapalle Mandi, AP', date: new Date('2026-09-05'), pricePerKg: 42, arrivalVolume: 40, unit: 'kg', source: 'Mandi Board Data' },
  { crop: 'Chilli', market: 'Chittoor', location: 'Chittoor APMC, AP', date: new Date('2026-09-05'), pricePerKg: 45, arrivalVolume: 60, unit: 'kg', source: 'Mandi Board Data' },
  { crop: 'Chilli', market: 'Tirupati', location: 'Tirupati Mandi, AP', date: new Date('2026-09-05'), pricePerKg: 46, arrivalVolume: 75, unit: 'kg', source: 'Mandi Board Data' },
  { crop: 'Chilli', market: 'Bengaluru', location: 'Bengaluru APMC, KA', date: new Date('2026-09-05'), pricePerKg: 50, arrivalVolume: 120, unit: 'kg', source: 'APMC Electronic Portal' },

  // Potato across markets
  { crop: 'Potato', market: 'Madanapalle', location: 'Madanapalle Mandi, AP', date: new Date('2026-09-05'), pricePerKg: 18, arrivalVolume: 90, unit: 'kg', source: 'Mandi Board Data' },
  { crop: 'Potato', market: 'Chittoor', location: 'Chittoor APMC, AP', date: new Date('2026-09-05'), pricePerKg: 20, arrivalVolume: 120, unit: 'kg', source: 'Mandi Board Data' },
  { crop: 'Potato', market: 'Tirupati', location: 'Tirupati Mandi, AP', date: new Date('2026-09-05'), pricePerKg: 21, arrivalVolume: 135, unit: 'kg', source: 'Mandi Board Data' },
  { crop: 'Potato', market: 'Bengaluru', location: 'Bengaluru APMC, KA', date: new Date('2026-09-05'), pricePerKg: 24, arrivalVolume: 280, unit: 'kg', source: 'APMC Electronic Portal' },
];

const seedBuyerDemands = [
  { buyerName: 'ABC Agro Foods Pvt Ltd', crop: 'Tomato', quantity: '10 MT', qualityGrade: 'Grade A', offeredPrice: 34, location: 'Bengaluru Central Hub, KA', requiredBy: new Date('2026-09-10'), status: 'active' },
  { buyerName: 'Kisan Fresh Mart', crop: 'Onion', quantity: '25 MT', qualityGrade: 'Grade A', offeredPrice: 25, location: 'Chittoor Industrial Area, AP', requiredBy: new Date('2026-09-12'), status: 'active' },
  { buyerName: 'South Green Retailers', crop: 'Chilli', quantity: '5 MT', qualityGrade: 'Grade B', offeredPrice: 48, location: 'Tirupati Mandi Hub, AP', requiredBy: new Date('2026-09-08'), status: 'active' },
  { buyerName: 'Heritage Foods Bulk', crop: 'Potato', quantity: '20 MT', qualityGrade: 'Grade A', offeredPrice: 22, location: 'Bengaluru Wholesale Terminal, KA', requiredBy: new Date('2026-09-15'), status: 'active' },
  { buyerName: 'Nilgiri Food Processing', crop: 'Tomato', quantity: '15 MT', qualityGrade: 'Grade C', offeredPrice: 28, location: 'Hosur Processing Center, TN', requiredBy: new Date('2026-09-11'), status: 'active' },
];

const seedLots = [
  { lotId: 'AGRI1025', farmerName: 'Ramesh Patel', crop: 'Tomato', variety: 'Sahu Hybrid', quantity: '500 kg', qualityGrade: 'Grade A', harvestDate: new Date('2026-09-03'), expectedPrice: 32, location: 'Madanapalle, AP', availableFrom: new Date('2026-09-05'), status: 'available' },
  { lotId: 'AGRI1026', farmerName: 'Ramesh Patel', crop: 'Onion', variety: 'Nashik Red', quantity: '1,200 kg', qualityGrade: 'Grade A', harvestDate: new Date('2026-09-02'), expectedPrice: 24, location: 'Madanapalle, AP', availableFrom: new Date('2026-09-04'), status: 'offer_received' },
  { lotId: 'AGRI1027', farmerName: 'Srinivasulu Reddy', crop: 'Chilli', variety: 'G4 Superhot', quantity: '300 kg', qualityGrade: 'Grade B', harvestDate: new Date('2026-09-04'), expectedPrice: 45, location: 'Chittoor, AP', availableFrom: new Date('2026-09-06'), status: 'available' },
];

const seedOffers = [
  { lotId: 'AGRI1025', buyerName: 'ABC Agro Foods Pvt Ltd', offeredPrice: 33, quantity: '500 kg', message: 'Ready to arrange direct farm pickup with 100% escrow.', status: 'pending' },
  { lotId: 'AGRI1025', buyerName: 'Kisan Fresh Mart', offeredPrice: 32.5, quantity: '500 kg', message: 'Immediate settlement upon digital weighment.', status: 'pending' },
  { lotId: 'AGRI1026', buyerName: 'South Green Retailers', offeredPrice: 25, quantity: '1,200 kg', message: 'Bulk purchase for retail chain supply.', status: 'pending' },
];

const seedTransactions = [
  { transactionId: 'TXN1001', crop: 'Tomato', farmerName: 'Ramesh Patel', buyerName: 'ABC Agro Foods Pvt Ltd', quantity: 500, pricePerKg: 35, totalAmount: 17500, status: 'Confirmed', paymentStatus: 'Pending', paymentMethod: '', paymentReference: '', paymentDate: null },
  { transactionId: 'TXN1025', crop: 'Tomato', farmerName: 'Ramesh Patel', buyerName: 'ABC Agro Foods Pvt Ltd', quantity: 500, pricePerKg: 33, totalAmount: 16500, status: 'delivered', paymentStatus: 'Pending', paymentMethod: '', paymentReference: '', paymentDate: null },
  { transactionId: 'TXN1024', crop: 'Tomato', farmerName: 'Ramesh Patel', buyerName: 'FreshRoots Wholesalers', quantity: 800, pricePerKg: 29, totalAmount: 23200, status: 'completed', paymentStatus: 'Paid', paymentMethod: 'Bank Transfer', paymentReference: 'DEMO-PAY-1024', paymentDate: new Date('2026-08-29') },
];

const seedLogistics = [
  {
    transactionId: 'TXN1001',
    pickupLocation: 'Madanapalle, AP',
    destination: 'Bengaluru APMC, KA',
    distanceKm: 180,
    transportCost: 3500,
    transporter: 'ABC Logistics',
    expectedDeliveryDate: new Date('2026-09-12T10:00:00.000Z'),
    status: 'Pickup Scheduled',
  },
  {
    transactionId: 'TXN1025',
    pickupLocation: 'Madanapalle, AP (Farm Gate)',
    destination: 'Bengaluru, KA (ABC Agro Hub)',
    distanceKm: 85,
    transportCost: 1500,
    transporter: 'AgriExpress Cold Logistics (KA-04-E-4921)',
    expectedDeliveryDate: new Date('2026-09-05T16:30:00.000Z'),
    status: 'In Transit',
  },
];

const seedGrievances = [
  {
    grievanceId: 'GRV1001',
    transactionRef: 'TXN1001',
    complainantName: 'Ramesh Patel',
    againstEntity: 'ABC Agro Foods Pvt Ltd',
    issueType: 'Payment Not Received',
    description: 'Produce delivered 18 hours ago but escrow release is still in pending status.',
    status: 'Under Review',
    resolution: '',
  },
  {
    grievanceId: 'GRV1002',
    transactionRef: 'TXN1024',
    complainantName: 'Ramesh Patel',
    againstEntity: 'Kisan Logistics Partner',
    issueType: 'Delivery Delay',
    description: 'Vehicle arrived 4 hours late beyond agreed farm-gate pickup slot.',
    status: 'Resolved',
    resolution: 'Transporter provided fuel rebate on return trip.',
  },
];

const runSeed = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agrilink';

  try {
    console.log(`Connecting to MongoDB at: ${mongoURI}`);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected successfully for database seeding.\n');

    // 1. Clean existing collections
    console.log('Clearing old collections...');
    await User.deleteMany({});
    await MarketPrice.deleteMany({});
    await BuyerDemand.deleteMany({});
    await Lot.deleteMany({});
    await Offer.deleteMany({});
    await Transaction.deleteMany({});
    await Logistics.deleteMany({});
    await Grievance.deleteMany({});
    console.log('Old collections cleared.\n');

    // 2. Insert Users
    const insertedUsers = await User.insertMany(seedUsers);
    console.log(`[x] Inserted ${insertedUsers.length} Users (3 Farmers, 1 FPO, 4 Buyers, 1 Admin)`);

    // Map inserted User ObjectIds
    const farmerRamesh = insertedUsers.find((u) => u.name === 'Ramesh Patel');
    const buyerABC = insertedUsers.find((u) => u.name === 'ABC Agro Foods Pvt Ltd');

    // 3. Insert Market Prices
    const insertedPrices = await MarketPrice.insertMany(seedMarketPrices);
    console.log(`[x] Inserted ${insertedPrices.length} Market Price records (historical dates & trend data)`);

    // 4. Insert Buyer Demands
    const demandsWithBuyerRef = seedBuyerDemands.map((d) => ({
      ...d,
      buyer: buyerABC ? buyerABC._id : undefined,
    }));
    const insertedDemands = await BuyerDemand.insertMany(demandsWithBuyerRef);
    console.log(`[x] Inserted ${insertedDemands.length} Buyer Demands`);

    // 5. Insert Lots
    const lotsWithFarmerRef = seedLots.map((l) => ({
      ...l,
      farmer: farmerRamesh ? farmerRamesh._id : undefined,
    }));
    const insertedLots = await Lot.insertMany(lotsWithFarmerRef);
    console.log(`[x] Inserted ${insertedLots.length} Sample Lots`);

    // 6. Insert Offers
    const lotTomato = insertedLots.find((l) => l.lotId === 'AGRI1025');
    const offersWithRefs = seedOffers.map((o) => ({
      ...o,
      lot: lotTomato ? lotTomato._id : undefined,
      buyer: buyerABC ? buyerABC._id : undefined,
    }));
    const insertedOffers = await Offer.insertMany(offersWithRefs);
    console.log(`[x] Inserted ${insertedOffers.length} Sample Buyer Offers`);

    // 7. Insert Transactions
    const txnsWithRefs = seedTransactions.map((t) => ({
      ...t,
      lot: lotTomato ? lotTomato._id : undefined,
      farmer: farmerRamesh ? farmerRamesh._id : undefined,
      buyer: buyerABC ? buyerABC._id : undefined,
    }));
    const insertedTxns = await Transaction.insertMany(txnsWithRefs);
    console.log(`[x] Inserted ${insertedTxns.length} Sample Transactions`);

    // 8. Insert Logistics
    const txn1025 = insertedTxns.find((t) => t.transactionId === 'TXN1025');
    const logisticsWithRefs = seedLogistics.map((l) => ({
      ...l,
      transaction: txn1025 ? txn1025._id : undefined,
    }));
    const insertedLogistics = await Logistics.insertMany(logisticsWithRefs);
    console.log(`[x] Inserted ${insertedLogistics.length} Sample Logistics record`);

    // 9. Insert Grievances
    const grievancesWithRefs = seedGrievances.map((g) => ({
      ...g,
      transaction: txn1025 ? txn1025._id : undefined,
      raisedBy: farmerRamesh ? farmerRamesh._id : undefined,
    }));
    const insertedGrievances = await Grievance.insertMany(grievancesWithRefs);
    console.log(`[x] Inserted ${insertedGrievances.length} Sample Grievances`);

    console.log('\n=========================================');
    console.log('AgriLink Database Seeding Completed Successfully!');
    console.log('=========================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`\nSeeding Failed: ${error.message}`);
    console.log('If local MongoDB is not running, ensure MongoDB is installed or provide a valid MONGODB_URI (e.g. MongoDB Atlas) in backend/.env');
    process.exit(1);
  }
};

runSeed();
