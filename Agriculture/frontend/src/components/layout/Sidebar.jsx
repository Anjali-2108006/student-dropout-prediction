import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  PlusCircle,
  Handshake,
  Receipt,
  Truck,
  AlertCircle,
  User,
  Search,
  ClipboardList,
  Users,
  Boxes,
  LineChart,
  ShieldCheck,
  BarChart3,
  LogOut,
  HelpCircle,
  Sprout
} from 'lucide-react';

export default function Sidebar({ role = 'farmer', isOpen = true, onClose }) {
  const location = useLocation();

  const navigationConfigs = {
    farmer: [
      { name: 'Dashboard', path: '/farmer/dashboard', icon: LayoutDashboard },
      { name: 'Market Prices', path: '/farmer/market-prices', icon: TrendingUp, badge: 'Live' },
      { name: 'My Lots', path: '/farmer/lots', icon: Package },
      { name: 'Create Lot', path: '/farmer/lots/create', icon: PlusCircle },
      { name: 'Offers', path: '/farmer/offers', icon: Handshake, count: 7 },
      { name: 'Transactions', path: '/farmer/transactions', icon: Receipt },
      { name: 'Logistics', path: '/farmer/logistics', icon: Truck, badge: 'Active' },
      { name: 'Grievances', path: '/farmer/grievances', icon: AlertCircle },
      { name: 'Profile', path: '/farmer/profile', icon: User },
    ],
    buyer: [
      { name: 'Dashboard', path: '/buyer/dashboard', icon: LayoutDashboard },
      { name: 'Find Produce', path: '/buyer/find-produce', icon: Search, badge: 'New' },
      { name: 'My Requirements', path: '/buyer/requirements', icon: ClipboardList },
      { name: 'Offers Sent', path: '/buyer/offers', icon: Handshake },
      { name: 'Transactions', path: '/buyer/transactions', icon: Receipt },
      { name: 'Profile', path: '/buyer/profile', icon: User },
    ],
    fpo: [
      { name: 'Dashboard', path: '/fpo/dashboard', icon: LayoutDashboard },
      { name: 'Farmers', path: '/fpo/farmers', icon: Users },
      { name: 'Aggregated Lots', path: '/fpo/lots', icon: Boxes },
      { name: 'Market Intelligence', path: '/fpo/market-intelligence', icon: LineChart },
      { name: 'Buyer Matching', path: '/fpo/buyer-matching', icon: Handshake },
      { name: 'Transactions', path: '/fpo/transactions', icon: Receipt },
      { name: 'Profile', path: '/fpo/profile', icon: User },
    ],
    admin: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Market Overview', path: '/admin/markets', icon: BarChart3 },
      { name: 'Buyer Verifications', path: '/admin/verifications', icon: ShieldCheck, count: 3 },
      { name: 'Grievances', path: '/admin/grievances', icon: AlertCircle, count: 2 },
      { name: 'Transactions', path: '/admin/transactions', icon: Receipt },
    ],
  };

  const navItems = navigationConfigs[role] || navigationConfigs.farmer;

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-100 flex flex-col justify-between
        transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-[calc(100vh-4rem)]
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="flex-1 py-6 px-4 space-y-6 overflow-y-auto">
        {/* Role identification */}
        <div className="px-3 py-2 bg-emerald-50/60 rounded-xl border border-emerald-100/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Active Workspace</span>
            <p className="text-sm font-extrabold capitalize text-gray-900">{role} Portal</p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
        </div>

        {/* Nav Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group
                  ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-emerald-50/50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-emerald-600'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {item.count && (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white text-emerald-700' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Help / Switch */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        <NavLink
          to="/select-role"
          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
        >
          <Sprout className="w-4 h-4 text-emerald-600" />
          <span>Switch Role / Exit</span>
        </NavLink>
        <NavLink
          to="/farmer/grievances"
          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-gray-400" />
          <span>Help &amp; Kisan Support</span>
        </NavLink>
      </div>
    </aside>
  );
}
