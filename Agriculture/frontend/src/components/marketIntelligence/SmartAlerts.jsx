import React, { useState } from 'react';
import {
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Truck,
  CreditCard,
  AlertCircle,
  X,
  Bell
} from 'lucide-react';

const ALERT_CONFIG = {
  'PRICE ALERT': {
    icon: TrendingUp,
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    badge: 'bg-emerald-600 text-white',
    iconColor: 'text-emerald-600',
  },
  'DEMAND ALERT': {
    icon: Sparkles,
    bg: 'bg-blue-50 text-blue-800 border-blue-200',
    badge: 'bg-blue-600 text-white',
    iconColor: 'text-blue-600',
  },
  'SALE ALERT': {
    icon: CheckCircle2,
    bg: 'bg-amber-50 text-amber-900 border-amber-200',
    badge: 'bg-amber-500 text-white',
    iconColor: 'text-amber-600',
  },
  'DELIVERY ALERT': {
    icon: Truck,
    bg: 'bg-purple-50 text-purple-900 border-purple-200',
    badge: 'bg-purple-600 text-white',
    iconColor: 'text-purple-600',
  },
  'PAYMENT ALERT': {
    icon: CreditCard,
    bg: 'bg-sky-50 text-sky-900 border-sky-200',
    badge: 'bg-sky-600 text-white',
    iconColor: 'text-sky-600',
  },
  'GRIEVANCE ALERT': {
    icon: AlertCircle,
    bg: 'bg-slate-50 text-slate-800 border-slate-200',
    badge: 'bg-slate-600 text-white',
    iconColor: 'text-slate-600',
  },
};

export default function SmartAlerts({ alerts = [] }) {
  const [dismissed, setDismissed] = useState({});

  if (!alerts || alerts.length === 0) return null;

  const activeAlerts = alerts.filter((a) => !dismissed[a.id]);
  if (activeAlerts.length === 0) return null;

  const handleDismiss = (id) => {
    setDismissed((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <Bell className="w-3.5 h-3.5 text-emerald-600" />
          <span>Smart Market Alerts ({activeAlerts.length})</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {activeAlerts.map((alert) => {
          const cfg = ALERT_CONFIG[alert.type] || ALERT_CONFIG['PRICE ALERT'];
          const Icon = cfg.icon;

          return (
            <div
              key={alert.id}
              className={`p-3 rounded-xl border flex items-start justify-between gap-3 shadow-2xs transition-all ${cfg.bg}`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className={`mt-0.5 p-1 rounded-lg bg-white shadow-2xs ${cfg.iconColor} flex-shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                      {alert.type}
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">{alert.timestamp}</span>
                  </div>
                  <p className="text-xs font-semibold leading-relaxed text-gray-900">
                    {alert.message}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDismiss(alert.id)}
                className="text-gray-400 hover:text-gray-600 p-0.5 rounded-md hover:bg-white/60 transition-colors flex-shrink-0"
                title="Dismiss alert"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
