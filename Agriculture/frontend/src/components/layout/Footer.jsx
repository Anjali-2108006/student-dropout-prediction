import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Heart, Shield, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 pt-16 pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-gray-950 font-bold">
                <Sprout className="w-6 h-6" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">Agri<span className="text-emerald-400">Link</span></span>
            </Link>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              Empowering Indian farmers and FPOs with transparent mandi price discovery, smart selling recommendations, and direct linkages with verified commercial buyers.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/80 text-emerald-400 text-xs font-semibold border border-gray-700">
              <Shield className="w-4 h-4" />
              Smart India Hackathon (SIH) Prototype
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/farmer/market-prices" className="hover:text-emerald-400 transition-colors">
                  Live Mandi Prices
                </Link>
              </li>
              <li>
                <Link to="/farmer/dashboard" className="hover:text-emerald-400 transition-colors">
                  Farmer Dashboard
                </Link>
              </li>
              <li>
                <Link to="/fpo/dashboard" className="hover:text-emerald-400 transition-colors">
                  FPO Aggregation
                </Link>
              </li>
              <li>
                <Link to="/buyer/dashboard" className="hover:text-emerald-400 transition-colors">
                  Buyer Procurement
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="hover:text-emerald-400 transition-colors">
                  Admin Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* User Portals */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Portals</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/select-role" className="hover:text-emerald-400 transition-colors">
                  Role Selection
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors">
                  Farmer / Buyer Login
                </Link>
              </li>
              <li>
                <Link to="/farmer/lots/create" className="hover:text-emerald-400 transition-colors">
                  Create Produce Lot
                </Link>
              </li>
              <li>
                <Link to="/farmer/logistics" className="hover:text-emerald-400 transition-colors">
                  Cold-Chain Logistics
                </Link>
              </li>
              <li>
                <Link to="/farmer/grievances" className="hover:text-emerald-400 transition-colors">
                  Grievance Redressal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact / Kisan Helpline */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Kisan Support</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2.5 text-gray-300">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>1800-180-1551 (Toll-Free)</span>
              </div>
              <div className="flex items-center gap-2.5 text-gray-300">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>support@agrilink.in</span>
              </div>
              <div className="flex items-start gap-2.5 text-gray-300">
                <MapPin className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
                <span>Madanapalle Horticulture Hub, Andhra Pradesh</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 mt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} AgriLink Platform. Built for Smart India Hackathon.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Mandi Code of Conduct</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
