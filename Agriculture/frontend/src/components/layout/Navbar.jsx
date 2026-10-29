import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sprout, Menu, X, ArrowRight, ShieldCheck, UserCircle, LogIn, ChevronDown } from 'lucide-react';
import Button from '../common/Button';

export default function Navbar({ currentRole, isDashboard = false }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 transition-colors flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900">Agri<span className="text-emerald-600">Link</span></span>

              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 font-medium hidden sm:block -mt-0.5">Smart Market Linkage & Price Discovery</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {!isDashboard ? (
            <nav className="hidden md:flex items-center gap-8">
              <Link
                to="/"
                className={`text-sm font-semibold transition-colors ${
                  location.pathname === '/' ? 'text-emerald-700' : 'text-gray-600 hover:text-emerald-600'
                }`}
              >
                Home
              </Link>
              <a href="#why-agrilink" className="text-sm font-semibold text-gray-600 hover:text-emerald-600 transition-colors">
                Why AgriLink
              </a>
              <a href="#how-it-works" className="text-sm font-semibold text-gray-600 hover:text-emerald-600 transition-colors">
                How It Works
              </a>
              <Link
                to="/farmer/market-prices"
                className="text-sm font-semibold text-gray-600 hover:text-emerald-600 transition-colors flex items-center gap-1"
              >
                Live Mandi Prices
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </Link>
            </nav>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              {/* Role Switcher Pill */}
              <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
                <Link
                  to="/farmer/dashboard"
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    location.pathname.startsWith('/farmer') ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-gray-900'
                  }`}
                >
                  Farmer
                </Link>
                <Link
                  to="/fpo/dashboard"
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    location.pathname.startsWith('/fpo') ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-gray-900'
                  }`}
                >
                  FPO
                </Link>
                <Link
                  to="/buyer/dashboard"
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    location.pathname.startsWith('/buyer') ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-gray-900'
                  }`}
                >
                  Buyer
                </Link>
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    location.pathname.startsWith('/admin') ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-gray-900'
                  }`}
                >
                  Admin
                </Link>
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {!isDashboard ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                  icon={LogIn}
                >
                  Log In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/select-role')}
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Join AgriLink
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/farmer/profile"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    RP
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-900 leading-tight">Ramesh Patel</p>
                    <p className="text-[10px] text-emerald-700 font-medium">Madanapalle, AP</p>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-gray-800 hover:text-emerald-600"
          >
            Home
          </Link>
          <Link
            to="/farmer/market-prices"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-gray-800 hover:text-emerald-600"
          >
            Live Mandi Prices
          </Link>
          <Link
            to="/farmer/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-emerald-700"
          >
            Farmer Dashboard
          </Link>
          <Link
            to="/buyer/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-gray-800 hover:text-emerald-600"
          >
            Buyer Dashboard
          </Link>
          <Link
            to="/fpo/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-gray-800 hover:text-emerald-600"
          >
            FPO Dashboard
          </Link>
          <Link
            to="/admin/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-gray-800 hover:text-emerald-600"
          >
            Admin Portal
          </Link>
          <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/login');
              }}
            >
              Log In
            </Button>
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/select-role');
              }}
            >
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
