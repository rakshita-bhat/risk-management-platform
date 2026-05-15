import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { locationService } from '../services/location.service';
import { authService } from '../services/auth.service';
import { 
  MapPin, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ChevronDown,
  ChevronRight,
  Building,
  Home,
  X
} from 'lucide-react';
import { toastService } from '../utils/toast';

interface Location {
  id: number;
  name: string;
  description?: string;
  parent?: { id: number; name: string };
  children?: Location[];
  createdAt: string;
}

export default function Locations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchLocations();
  }, [navigate]);

  const fetchLocations = async () => {
    try {
      const data = await locationService.getAll();
      setLocations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await locationService.create({
        ...formData,
        parentId: formData.parentId ? parseInt(formData.parentId) : undefined,
      });
      toastService.success('Location created successfully!');
      setShowModal(false);
      setFormData({ name: '', description: '', parentId: '' });
      fetchLocations();
    } catch (err) {
      toastService.error('Failed to create location');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this location?')) return;
    try {
      await locationService.delete(id);
      toastService.success('Location deleted successfully!');
      fetchLocations();
    } catch (err) {
      toastService.error('Failed to delete location');
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const renderTree = (items: Location[], level = 0): React.ReactNode => {
    return items.map((item) => {
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expandedIds.has(item.id);
      const isRoot = !item.parent;

      return (
        <div key={item.id}>
          <div 
            className={`flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 ${level > 0 ? 'ml-6' : ''}`}
            style={{ paddingLeft: `${level * 24 + 12}px` }}
          >
            <div className="flex items-center gap-2">
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              ) : (
                <div className="w-6"></div>
              )}
              {isRoot ? (
                <Building className="h-5 w-5 text-blue-500" />
              ) : (
                <Home className="h-4 w-4 text-gray-400" />
              )}
              <div>
                <p className="font-medium text-gray-900">{item.name}</p>
                {item.description && (
                  <p className="text-xs text-gray-500">{item.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">ID: {item.id}</span>
              <button className="p-1 text-yellow-600 hover:bg-yellow-50 rounded">
                <Edit className="h-4 w-4" />
              </button>
              <button 
                onClick={() => handleDelete(item.id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          {hasChildren && isExpanded && (
            <div>
              {renderTree(item.children!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const filteredLocations = locations.filter(loc => 
    loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (loc.description && loc.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const rootLocations = filteredLocations.filter(loc => !loc.parent);

  if (!authService.isAuthenticated()) return null;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Location Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage hierarchical locations</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Location
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Location Tree */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : rootLocations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No locations found</p>
            <p className="text-sm">Create your first location to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {renderTree(rootLocations)}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Location</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Location Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Parent Location (optional)</label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None (Root Location)</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Create Location
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
    </>
  );
}