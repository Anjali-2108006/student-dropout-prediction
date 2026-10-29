import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import RoleSelectionPage from './pages/public/RoleSelectionPage';
import LoginPage from './pages/public/LoginPage';
import AboutPage from './pages/public/AboutPage';

// Farmer Pages
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import MarketPricesPage from './pages/farmer/MarketPricesPage';
import LotsPage from './pages/farmer/LotsPage';
import LotDetailsPage from './pages/farmer/LotDetailsPage';
import CreateLotPage from './pages/farmer/CreateLotPage';
import BuyerOffersPage from './pages/farmer/BuyerOffersPage';
import TransactionsPage from './pages/farmer/TransactionsPage';
import LogisticsPage from './pages/farmer/LogisticsPage';
import GrievancesPage from './pages/farmer/GrievancesPage';
import FarmerProfilePage from './pages/farmer/FarmerProfilePage';

// Buyer Pages
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import FindProducePage from './pages/buyer/FindProducePage';
import BuyerRequirementsPage from './pages/buyer/BuyerRequirementsPage';

// FPO Pages
import FPODashboard from './pages/fpo/FPODashboard';
import FPOMembersPage from './pages/fpo/FPOMembersPage';
import FPOAggregationPage from './pages/fpo/FPOAggregationPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/select-role" element={<RoleSelectionPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/about" element={<AboutPage />} />

      {/* Farmer Portal Routes */}
      <Route path="/farmer" element={<DashboardLayout role="farmer" />}>
        <Route index element={<Navigate to="/farmer/dashboard" replace />} />
        <Route path="dashboard" element={<FarmerDashboard />} />
        <Route path="market-prices" element={<MarketPricesPage />} />
        <Route path="intelligence" element={<MarketPricesPage />} />
        <Route path="lots" element={<LotsPage />} />
        <Route path="lots/:id" element={<LotDetailsPage />} />
        <Route path="lots/create" element={<CreateLotPage />} />
        <Route path="offers" element={<BuyerOffersPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="logistics" element={<LogisticsPage />} />
        <Route path="grievances" element={<GrievancesPage />} />
        <Route path="profile" element={<FarmerProfilePage />} />
      </Route>

      {/* Buyer Portal Routes */}
      <Route path="/buyer" element={<DashboardLayout role="buyer" />}>
        <Route index element={<Navigate to="/buyer/dashboard" replace />} />
        <Route path="dashboard" element={<BuyerDashboard />} />
        <Route path="find-produce" element={<FindProducePage />} />
        <Route path="requirements" element={<BuyerRequirementsPage />} />
        <Route path="offers" element={<BuyerOffersPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="profile" element={<FarmerProfilePage />} />
      </Route>

      {/* FPO Portal Routes */}
      <Route path="/fpo" element={<DashboardLayout role="fpo" />}>
        <Route index element={<Navigate to="/fpo/dashboard" replace />} />
        <Route path="dashboard" element={<FPODashboard />} />
        <Route path="farmers" element={<FPOMembersPage />} />
        <Route path="lots" element={<FPOAggregationPage />} />
        <Route path="market-intelligence" element={<MarketPricesPage />} />
        <Route path="buyer-matching" element={<BuyerOffersPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="profile" element={<FarmerProfilePage />} />
      </Route>

      {/* Admin Portal Routes */}
      <Route path="/admin" element={<DashboardLayout role="admin" />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="markets" element={<AdminDashboard />} />
        <Route path="verifications" element={<AdminDashboard />} />
        <Route path="grievances" element={<GrievancesPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
      </Route>

      {/* Fallback to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
