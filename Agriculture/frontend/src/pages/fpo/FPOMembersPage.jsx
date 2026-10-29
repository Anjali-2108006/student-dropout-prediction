import React, { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { Users, Search, PlusCircle, MapPin, Phone } from 'lucide-react';

export default function FPOMembersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const members = [
    { id: 'MBR-001', name: 'Ramesh Patel', village: 'Madanapalle West', acres: '12 Acres', crops: 'Tomato, Onion', mobile: '+91 98450 12345', status: 'Active' },
    { id: 'MBR-002', name: 'Srinivasulu Reddy', village: 'Ghattu', acres: '8 Acres', crops: 'Tomato, Capsicum', mobile: '+91 98450 67890', status: 'Active' },
    { id: 'MBR-003', name: 'Venkatamma K.', village: 'Nimmanapalle', acres: '5 Acres', crops: 'Green Chili, Beans', mobile: '+91 98450 11223', status: 'Active' },
    { id: 'MBR-004', name: 'Anand Kumar', village: 'Ramasamudram', acres: '15 Acres', crops: 'Mango, Tomato', mobile: '+91 98450 44556', status: 'Active' },
    { id: 'MBR-005', name: 'Babu Rao', village: 'Kurabalakota', acres: '6 Acres', crops: 'Tomato, Groundnut', mobile: '+91 98450 99887', status: 'Active' },
  ].filter((m) => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.village.toLowerCase().includes(searchTerm.toLowerCase()));

  const columns = [
    {
      title: 'Member ID',
      key: 'id',
      render: (val) => <span className="font-mono text-xs font-bold bg-gray-100 px-2 py-1 rounded">{val}</span>,
    },
    {
      title: 'Farmer Name',
      key: 'name',
      render: (val) => <span className="font-bold text-gray-900">{val}</span>,
    },
    {
      title: 'Village Panchayat',
      key: 'village',
      render: (val) => <span className="text-gray-600 text-xs">{val}</span>,
    },
    {
      title: 'Farm Size',
      key: 'acres',
      render: (val) => <span className="font-semibold text-gray-800">{val}</span>,
    },
    {
      title: 'Primary Crops',
      key: 'crops',
      render: (val) => <span className="text-emerald-700 font-bold text-xs">{val}</span>,
    },
    {
      title: 'Phone',
      key: 'mobile',
      render: (val) => <span className="font-mono text-xs text-gray-500">{val}</span>,
    },
    {
      title: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} size="sm" />,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      <PageHeader
        title="Registered Member Farmers"
        subtitle="Roster of smallholder farmers affiliated with the FPO aggregation collective."
        tag="FPO Registry"
      />

      <Card bodyClassName="p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search member by farmer name or village panchayat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </Card>

      <Card>
        <Table columns={columns} data={members} keyField="id" />
      </Card>
    </div>
  );
}
