import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Button from '../../components/common/Button';
import { Sprout, Phone, Lock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('farmer');
  const [identifier, setIdentifier] = useState('9845012345');
  const [password, setPassword] = useState('••••••••');

  const handleLogin = (e) => {
    e.preventDefault();
    if (role === 'buyer') {
      navigate('/buyer/dashboard');
    } else if (role === 'fpo') {
      navigate('/fpo/dashboard');
    } else {
      navigate('/farmer/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/60 flex flex-col antialiased">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-xl p-8 sm:p-10">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-600/20">
              <Sprout className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Welcome to AgriLink</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Sign in to access your agricultural trading console</p>
          </div>

          {/* Role selector tabs */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 rounded-xl">
              {[
                { id: 'farmer', label: 'Farmer' },
                { id: 'fpo', label: 'FPO' },
                { id: 'buyer', label: 'Buyer' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    role === r.id
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Mobile Number / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter 10-digit mobile or email"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-gray-900"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Password / OTP
                </label>
                <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-xs text-emerald-700 hover:underline font-medium">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-gray-900"
                />
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                icon={ArrowRight}
                iconPosition="right"
                className="font-bold text-sm"
              >
                Sign In as {role.toUpperCase()}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="md"
                fullWidth
                onClick={() => navigate('/select-role')}
              >
                Create New Account
              </Button>
            </div>
          </form>

          {/* Quick Demo Credentials Info */}
          <div className="mt-8 pt-6 border-t border-gray-100 bg-emerald-50/50 p-4 rounded-xl text-xs text-emerald-900">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>SIH Hackathon Demo Active</span>
            </div>
            <p className="text-gray-600">
              No backend credentials required for evaluation. Click <strong>Sign In</strong> to explore the full {role.toUpperCase()} workflow.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
