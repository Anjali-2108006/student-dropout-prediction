import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { getLots } from '../../services/api';
import { initialFarmerLots } from '../../data/demoData';
import {
  PlusCircle,
  AlertCircle,
  RefreshCw,
  Clock,
  Filter,
  ArrowUpDown
} from 'lucide-react';

export default function LotsPage() {
  const navigate = useNavigate();

  // Filters State
  const [filterCrop, setFilterCrop] = useState('All');
  const [filterGrade, setFilterGrade] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // API State
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLots = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getLots();
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setLots(res.data);
      } else {
        setLots(initialFarmerLots);
      }
    } catch (err) {
      console.warn('Lots API Warning:', err.message);
      setError('Unable to load lots from MongoDB API. Displaying offline snapshot.');
      setLots(initialFarmerLots);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  // Filter and Sort Lots
  const processedLots = useMemo(() => {
    let result = lots.filter((lot) => {
      // Filter Crop
      if (filterCrop !== 'All') {
        const cropName = (lot.crop || '').toLowerCase();
        if (cropName !== filterCrop.toLowerCase()) return false;
      }

      // Filter Grade
      if (filterGrade !== 'All') {
        const grade = (lot.qualityGrade || lot.quality || '').toLowerCase();
        if (!grade.includes(filterGrade.toLowerCase())) return false;
      }

      // Filter Status
      if (filterStatus !== 'All') {
        const st = (lot.status || '').toLowerCase().replace(/_/g, ' ');
        const targetSt = filterStatus.toLowerCase();
        if (!st.includes(targetSt) && st !== targetSt) return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'price-high') {
        const pA = typeof a.expectedPrice === 'number' ? a.expectedPrice : parseFloat(a.expectedPrice) || 0;
        const pB = typeof b.expectedPrice === 'number' ? b.expectedPrice : parseFloat(b.expectedPrice) || 0;
        return pB - pA;
      }
      if (sortBy === 'price-low') {
        const pA = typeof a.expectedPrice === 'number' ? a.expectedPrice : parseFloat(a.expectedPrice) || 0;
        const pB = typeof b.expectedPrice === 'number' ? b.expectedPrice : parseFloat(b.expectedPrice) || 0;
        return pA - pB;
      }
      if (sortBy === 'quantity') {
        const qA = parseFloat(a.quantity) || 0;
        const qB = parseFloat(b.quantity) || 0;
        return qB - qA;
      }
      if (sortBy === 'available-from') {
        return new Date(b.availableFrom || 0) - new Date(a.availableFrom || 0);
      }
      // default: newest
      return new Date(b.createdAt || b.harvestDate || 0) - new Date(a.createdAt || a.harvestDate || 0);
    });

    return result;
  }, [lots, filterCrop, filterGrade, filterStatus, sortBy]);

  const columns = [
    {
      title: 'Lot ID',
      key: 'lotId',
      render: (val, row) => (
        <span className="font-mono font-bold text-xs bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md border border-gray-200">
          {val || row.id || 'AGRI1001'}
        </span>
      ),
    },
    {
      title: 'Crop',
      key: 'crop',
      render: (val, row) => (
        <div>
          <span className="font-bold text-gray-900 text-sm">{val}</span>
          {row.variety && <span className="block text-xs text-gray-400">{row.variety}</span>}
        </div>
      ),
    },
    {
      title: 'Quantity',
      key: 'quantity',
      render: (val) => <span className="font-extrabold text-gray-900">{val}</span>,
    },
    {
      title: 'Quality Grade',
      key: 'qualityGrade',
      render: (val, row) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          {val || row.quality || 'Grade A'}
        </span>
      ),
    },
    {
      title: 'Expected Price',
      key: 'expectedPrice',
      render: (val) => (
        <span className="font-extrabold text-emerald-700 text-sm">
          {typeof val === 'number' ? `₹${val}/kg` : (val.startsWith('₹') ? val : `₹${val}`)}
        </span>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      render: (val) => <span className="text-xs text-gray-600 font-medium">{val}</span>,
    },
    {
      title: 'Available From',
      key: 'availableFrom',
      render: (val, row) => {
        const raw = val || row.harvestDate;
        if (!raw) return <span className="text-xs text-gray-400">Immediate</span>;
        const d = new Date(raw);
        return (
          <span className="text-xs text-gray-700 font-medium">
            {isNaN(d.getTime()) ? raw : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        );
      },
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
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/farmer/lots/${row.lotId || row._id || row.id}`)}
            className="text-xs font-bold"
          >
            Find Buyers
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/farmer/offers')}
            className="text-xs font-semibold"
          >
            Bids
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      <PageHeader
        title="Farmer Produce Lots"
        subtitle="Manage listed harvest lots, view active bids, and track status across regional buyers."
        tag="Produce Inventory"
        action={
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/farmer/lots/create')}
            icon={PlusCircle}
            className="shadow-md shadow-emerald-600/20 font-bold"
          >
            Create New Lot
          </Button>
        }
      />

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchLots} icon={RefreshCw} className="text-xs">
            Retry Connection
          </Button>
        </div>
      )}

      {/* Filter and Sorting Controls */}
      <Card bodyClassName="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Filters:</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
            {/* Filter Crop */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Crop</label>
              <select
                value={filterCrop}
                onChange={(e) => setFilterCrop(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="All">All Crops</option>
                <option value="Tomato">Tomato</option>
                <option value="Onion">Onion</option>
                <option value="Chilli">Chilli</option>
                <option value="Potato">Potato</option>
              </select>
            </div>

            {/* Filter Grade */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Quality Grade</label>
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="All">All Grades</option>
                <option value="Grade A">Grade A</option>
                <option value="Grade B">Grade B</option>
                <option value="Grade C">Grade C</option>
              </select>
            </div>

            {/* Filter Status */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="All">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Offer Received">Offer Received</option>
                <option value="Under Negotiation">Under Negotiation</option>
                <option value="Accepted">Accepted</option>
              </select>
            </div>

            {/* Sorting */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="newest">Newest First</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
                <option value="quantity">Highest Quantity</option>
                <option value="available-from">Available Date</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Lot List Table */}
      <Card>
        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-700">Loading farmer lots from MongoDB API...</p>
          </div>
        ) : processedLots.length === 0 ? (
          <EmptyState
            title="No Produce Lots Found"
            description="There are no lots matching the selected filters. Create your first lot to start receiving bids."
            action={
              <Button variant="primary" size="sm" onClick={() => navigate('/farmer/lots/create')}>
                Create First Lot
              </Button>
            }
          />
        ) : (
          <Table columns={columns} data={processedLots} keyField="_id" />
        )}
      </Card>
    </div>
  );
}
