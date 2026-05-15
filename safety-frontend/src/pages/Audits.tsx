import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auditService } from '../services/audit.service';
import { locationService } from '../services/location.service';
import { authService } from '../services/auth.service';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Filter,
  Calendar,
  User,
  MapPin,
  X
} from 'lucide-react';
import { toastService } from '../utils/toast';

interface Audit {
  id: number;
  title: string;
  description: string;
  status: string;
  location?: { id: number; name: string };
  auditor?: { id: number; firstName: string; lastName: string };
  createdAt: string;
}

interface Location {
  id: number;
  name: string;
}

const statusColors: Record<string, string> = {
  'draft': 'bg-gray-100 text-gray-800 border-gray-200',
  'in_progress': 'bg-blue-100 text-blue-800 border-blue-200',
  'completed': 'bg-green-100 text-green-800 border-green-200',
  'cancelled': 'bg-red-100 text-red-800 border-red-200',
};

export default function Audits() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    auditorId: '',
    locationId: '',
    status: 'draft',
  });
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
      const [auditsRes, locationsRes] = await Promise.all([
        auditService.getAll(statusFilter ? { status: statusFilter } : undefined),
        locationService.getAll(),
      ]);
      setAudits(auditsRes);
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
      await auditService.create({
        ...formData,
        auditorId: parseInt(formData.auditorId),
        locationId: formData.locationId ? parseInt(formData.locationId) : undefined,
      });
      toastService.success('Audit created successfully!');
      setShowModal(false);
      setFormData({ title: '', description: '', auditorId: '', locationId: '', status: 'draft' });
      fetchData();
    } catch (err) {
      toastService.error('Failed to create audit');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this audit?')) return;
    try {
      await auditService.delete(id);
      toastService.success('Audit deleted successfully!');
      fetchData();
    } catch (err) {
      toastService.error('Failed to delete audit');
    }
  };

  const filteredAudits = audits.filter(audit => 
    audit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    audit.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!authService.isAuthenticated()) return null;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage safety audits and inspections</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create Audit
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search audits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audits Table */}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Auditor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAudits.map((audit) => (
                  <tr key={audit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">#{audit.id}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{audit.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{audit.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[audit.status]}`}>
                        {audit.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {audit.location?.name || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {audit.auditor ? `${audit.auditor.firstName} ${audit.auditor.lastName}` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(audit.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => { setSelectedAudit(audit); setShowDetailModal(true); }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-yellow-600 hover:bg-yellow-50 rounded">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(audit.id)}
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

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create New Audit</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Audit Title</label>
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
                <label className="block text-sm font-medium mb-1">Auditor ID</label>
                <input
                  type="number"
                  value={formData.auditorId}
                  onChange={(e) => setFormData({ ...formData, auditorId: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Enter auditor's user ID"
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
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Create Audit
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
      {showDetailModal && selectedAudit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">Audit Details</h2>
                <p className="text-sm text-gray-500">#{selectedAudit.id}</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Title</h3>
                <p className="text-gray-900">{selectedAudit.title}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="text-gray-900">{selectedAudit.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[selectedAudit.status]}`}>
                    {selectedAudit.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Location</h3>
                  <p className="text-gray-900">{selectedAudit.location?.name || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Auditor</h3>
                  <p className="text-gray-900">
                    {selectedAudit.auditor ? `${selectedAudit.auditor.firstName} ${selectedAudit.auditor.lastName}` : '-'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created</h3>
                  <p className="text-gray-900">{new Date(selectedAudit.createdAt).toLocaleString()}</p>
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