import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { riskService } from '../services/risk.service';
import { locationService } from '../services/location.service';
import { authService } from '../services/auth.service';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Filter,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { toastService } from '../utils/toast';

interface Risk {
  id: number;
  title: string;
  description: string;
  status: string;
  location?: { id: number; name: string };
  assignee?: { id: number; firstName: string; lastName: string };
  creator?: { id: number; firstName: string; lastName: string };
  createdAt: string;
  evidenceUrls?: string[];
}

interface Location {
  id: number;
  name: string;
  parentId?: number;
}

const statusColors: Record<string, string> = {
  'Open': 'bg-red-100 text-red-800 border-red-200',
  'Assigned': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
  'Resolved': 'bg-green-100 text-green-800 border-green-200',
  'Approved': 'bg-purple-100 text-purple-800 border-purple-200',
  'Closed': 'bg-gray-100 text-gray-800 border-gray-200',
};

const workflow = ['Open', 'Assigned', 'In Progress', 'Resolved', 'Approved', 'Closed'];

export default function Risks() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    locationId: '',
    status: 'Open',
  });
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [navigate, statusFilter]);

  const fetchData = async () => {
    try {
      const [risksRes, locationsRes] = await Promise.all([
        riskService.getAll(statusFilter ? { status: statusFilter } : undefined),
        locationService.getAll(),
      ]);
      setRisks(risksRes);
      setLocations(locationsRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await riskService.create({
        ...formData,
        locationId: formData.locationId ? parseInt(formData.locationId) : undefined,
        creatorId: user.id || 1,
      });
      toastService.success('Risk created successfully!');
      setShowModal(false);
      setFormData({ title: '', description: '', locationId: '', status: 'Open' });
      fetchData();
    } catch (err) {
      toastService.error('Failed to create risk');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this risk?')) return;
    try {
      await riskService.delete(id);
      toastService.success('Risk deleted successfully!');
      fetchData();
    } catch (err) {
      toastService.error('Failed to delete risk');
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await riskService.updateStatus(id, newStatus);
      toastService.success('Status updated successfully!');
      fetchData();
    } catch (err) {
      toastService.error('Failed to update status');
    }
  };

  const filteredRisks = risks.filter(risk => 
    risk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    risk.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRisks.length / itemsPerPage);
  const paginatedRisks = filteredRisks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getCurrentWorkflowIndex = (status: string) => workflow.indexOf(status);

  if (!authService.isAuthenticated()) return null;

  return (
    <>
    <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Risk Management</h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage safety risks</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create Risk
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search risks..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {workflow.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Risks Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedRisks.map((risk) => (
                  <tr key={risk.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">#{risk.id}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{risk.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{risk.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={risk.status}
                        onChange={(e) => handleStatusChange(risk.id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[risk.status]}`}
                      >
                        {workflow.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {risk.location?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {risk.assignee ? `${risk.assignee.firstName} ${risk.assignee.lastName}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(risk.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => { setSelectedRisk(risk); setShowDetailModal(true); }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-yellow-600 hover:bg-yellow-50 rounded">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(risk.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRisks.length)} of {filteredRisks.length} risks
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-lg ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create New Risk</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Location</label>
                <select
                  value={formData.locationId}
                  onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Location</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Initial Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {workflow.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Create Risk
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRisk && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">Risk Details</h2>
                <p className="text-sm text-gray-500">#{selectedRisk.id}</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Title</h3>
                <p className="text-gray-900">{selectedRisk.title}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="text-gray-900">{selectedRisk.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[selectedRisk.status]}`}>
                    {selectedRisk.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Location</h3>
                  <p className="text-gray-900">{selectedRisk.location?.name || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Assignee</h3>
                  <p className="text-gray-900">
                    {selectedRisk.assignee ? `${selectedRisk.assignee.firstName} ${selectedRisk.assignee.lastName}` : '-'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created</h3>
                  <p className="text-gray-900">{new Date(selectedRisk.createdAt).toLocaleString()}</p>
                </div>
              </div>
              
              {/* Workflow Timeline */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Workflow Progress</h3>
                <div className="flex items-center gap-1 overflow-x-auto pb-2">
                  {workflow.map((status, index) => {
                    const currentIndex = getCurrentWorkflowIndex(selectedRisk.status);
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;
                    return (
                      <div key={status} className="flex items-center">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          isCurrent ? 'bg-blue-600 text-white' : 
                          isCompleted ? 'bg-green-100 text-green-800' : 
                          'bg-gray-100 text-gray-400'
                        }`}>
                          {status}
                        </div>
                        {index < workflow.length - 1 && (
                          <div className={`w-4 h-0.5 ${isCompleted ? 'bg-green-400' : 'bg-gray-200'}`}></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}