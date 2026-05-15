import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { authService } from '../services/auth.service';
import { 
  FileBarChart, 
  Download, 
  FileText, 
  Filter,
  FilterIcon
} from 'lucide-react';
import { toastService } from '../utils/toast';

interface DashboardData {
  totalRisks: number;
  risksByStatus: { status: string; count: number }[];
  risksByAssignee: { firstName: string; lastName: string; count: number }[];
  risksByLocation: { name: string; count: number }[];
}

export default function Reports() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [risks, setRisks] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    locationId: '',
    status: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [dashboardRes, risksRes, auditsRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/risks'),
        api.get('/audits'),
      ]);
      setData(dashboardRes.data);
      setRisks(risksRes.data);
      setAudits(auditsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (type: 'risks' | 'audits') => {
    const items = type === 'risks' ? risks : audits;
    const headers = type === 'risks' 
      ? ['ID', 'Title', 'Description', 'Status', 'Location', 'Assignee', 'Created']
      : ['ID', 'Title', 'Description', 'Status', 'Location', 'Auditor', 'Created'];

    const rows = items.map(r => [
      r.id,
      `"${(r.title || '').replace(/"/g, '""')}"`,
      `"${(r.description || '').replace(/"/g, '""')}"`,
      r.status,
      r.location?.name || '',
      r.assignee ? `${r.assignee.firstName} ${r.assignee.lastName}` : 
      r.auditor ? `${r.auditor.firstName} ${r.auditor.lastName}` : '',
      new Date(r.createdAt).toISOString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toastService.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report downloaded!`);
  };

  const exportToPDF = async (type: 'risks' | 'audits') => {
    try {
      const response = await api.get(`/reports/${type}/pdf`, {
        params: filters,
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}_report_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      toastService.success('PDF report downloaded!');
    } catch (err) {
      toastService.error('Failed to generate PDF. Backend PDF endpoint may not be implemented yet.');
    }
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  if (!authService.isAuthenticated()) return null;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Generate and download reports</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FilterIcon className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Date From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Date To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Location</label>
            <select
              value={filters.locationId}
              onChange={(e) => setFilters({ ...filters, locationId: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              {data?.risksByLocation.map(loc => (
                <option key={loc.name} value={loc.name}>{loc.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Risks</p>
              <p className="text-2xl font-bold">{data?.totalRisks || 0}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <FileBarChart className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Audits</p>
              <p className="text-2xl font-bold">{audits.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Open Risks</p>
              <p className="text-2xl font-bold">
                {data?.risksByStatus.find(s => s.status === 'Open')?.count || 0}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Filter className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Closed Risks</p>
              <p className="text-2xl font-bold">
                {data?.risksByStatus.find(s => s.status === 'Closed')?.count || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Download className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Report */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <FileBarChart className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Risk Report</h3>
              <p className="text-sm text-gray-500">{risks.length} total risks</p>
            </div>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => exportToCSV('risks')}
              className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Download CSV
            </button>
            <button
              onClick={() => exportToPDF('risks')}
              className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FileText className="h-4 w-4" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Audit Report */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Audit Report</h3>
              <p className="text-sm text-gray-500">{audits.length} total audits</p>
            </div>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => exportToCSV('audits')}
              className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Download CSV
            </button>
            <button
              onClick={() => exportToPDF('audits')}
              className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FileText className="h-4 w-4" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Statistics by Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Risks by Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {data?.risksByStatus.map((item) => (
            <div key={item.status} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold">{item.count}</p>
              <p className="text-sm text-gray-500">{item.status}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}