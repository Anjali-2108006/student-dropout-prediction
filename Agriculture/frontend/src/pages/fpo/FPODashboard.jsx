import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { fpoDashboardData } from '../../data/demoData';
import {
  Users,
  Boxes,
  LineChart,
  Handshake,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  Building2,
  TrendingUp
} from 'lucide-react';

export default function FPODashboard() {
  const navigate = useNavigate();
  const d = fpoDashboardData;

  const lotColumns = [
    {
      title: 'Aggregated Lot ID',
      key: 'lotId',
      render: (val) => (
        <span className="font-mono font-bold text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
          {val}
        </span>
      ),
    },
    {
      title: 'Crop Commodity',
      key: 'crop',
      render: (val) => <span className="font-bold text-gray-900">{val}</span>,
    },
    {
      title: 'Aggregated Volume',
      key: 'totalQty',
      render: (val) => <span className="font-extrabold text-emerald-800">{val}</span>,
    },
    {
      title: 'Farmers Aggregated',
      key: 'farmersCount',
      render: (val) => (
        <span className="text-xs text-gray-600 font-medium">
          {val} Member Farmers
        </span>
      ),
    },
    {
      title: 'Target Price',
      key: 'targetPrice',
      render: (val) => <span className="font-extrabold text-gray-900">{val}</span>,
    },
    {
      title: 'Buyer Inquiries',
      key: 'offers',
      render: (val) => (
        <span className="font-bold text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
          {val} Active Offers
        </span>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} size="sm" />,
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: () => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/fpo/lots')}
          className="text-xs font-semibold"
        >
          Manage
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>NABARD / SFAC Registered FPO</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            {d.fpoName}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200 mt-1">
            CIN: {d.cin} • Covering {d.memberVillages} village clusters across Madanapalle belt
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="success"
            size="md"
            onClick={() => navigate('/fpo/lots')}
            icon={PlusCircle}
            className="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold border-none"
          >
            Aggregate New Lot
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/fpo/farmers')}
            icon={Users}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            Member Directory
          </Button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Registered Farmers"
          value={d.registeredFarmers}
          subtitle="14 Village Panchayats"
          iconName="Users"
          color="emerald"
        />
        <StatCard
          title="Aggregated Produce"
          value={d.aggregatedProduce}
          subtitle="Stored &amp; in grading"
          iconName="Boxes"
          color="blue"
        />
        <StatCard
          title="Active Lots"
          value={d.activeLots}
          subtitle="Listed on mandi board"
          iconName="Package"
          color="amber"
        />
        <StatCard
          title="Buyer Connections"
          value={d.buyerConnections}
          subtitle="Exporters &amp; Processors"
          iconName="Handshake"
          color="purple"
        />
      </div>

      {/* Aggregated Lots Overview */}
      <Card
        title="Active Aggregated Produce Batches"
        subtitle="Consolidated high-tonnage lots for institutional buyers and forward contracts"
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/fpo/lots')}
            icon={ArrowRight}
            iconPosition="right"
            className="text-xs text-emerald-700 font-semibold"
          >
            Manage All Lots
          </Button>
        }
      >
        <Table
          columns={lotColumns}
          data={d.recentAggregatedLots}
          keyField="lotId"
        />
      </Card>
    </div>
  );
}
