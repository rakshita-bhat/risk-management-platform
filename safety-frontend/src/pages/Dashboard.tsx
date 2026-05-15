import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { authService } from '../services/auth.service';
import { 
  ShieldAlert, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  TrendingUp
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';

type DashboardData = {
  totalRisks: number;
  risksByStatus: { status: string; count: number }[];
  risksByAssignee: { firstName: string; lastName: string; count: number }[];
  risksByLocation: { name: string; count: number }[];
  auditsThisMonth?: number;
  recentActivity?: ActivityItem[];
};

interface ActivityItem {
  id: number;
  action: string;
  type: string;
  user: string;
  timestamp: string;
}

const COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#6B7280'];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard');
        setData(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const getStatusCount = (status: string) => {
    return data?.risksByStatus.find(s => s.status === status)?.count || 0;
  };

  const stats = [
    { 
      title: 'Total Risks', 
      value: data?.totalRisks || 0, 
      icon: <ShieldAlert className="h-6 w-6" />,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    { 
      title: 'Open Risks', 
      value: getStatusCount('Open'), 
      icon: <AlertCircle className="h-6 w-6" />,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    { 
      title: 'In Progress', 
      value: getStatusCount('In Progress'), 
      icon: <Clock className="h-6 w-6" />,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    { 
      title: 'Closed', 
      value: getStatusCount('Closed'), 
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!authService.isAuthenticated()) return null;

  return (
    <>
    <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of safety compliance and risk management</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                <span className={stat.textColor}>{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Risks by Status - Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-lg font-semibold mb-4">Risks by Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.risksByStatus || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="status"
                >
                  {(data?.risksByStatus || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risks by Assignee - Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-lg font-semibold mb-4">Risks by Assignee</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(data?.risksByAssignee || []).map(item => ({
                name: `${item.firstName} ${item.lastName}`.slice(0, 15),
                count: item.count
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Second Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risks by Location */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-lg font-semibold mb-4">Risks by Location</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(data?.risksByLocation || []).map(item => ({
                name: item.name || 'Unknown',
                count: item.count
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trends - Line Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-lg font-semibold mb-4">Monthly Audit Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { month: 'Jan', audits: 12, risks: 8 },
                { month: 'Feb', audits: 15, risks: 12 },
                { month: 'Mar', audits: 18, risks: 10 },
                { month: 'Apr', audits: 14, risks: 15 },
                { month: 'May', audits: 20, risks: 18 },
                { month: 'Jun', audits: 22, risks: 14 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="audits" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="risks" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          {[
            { action: 'Created new risk', type: 'risk', user: 'John Doe', time: '2 hours ago' },
            { action: 'Approved risk #12', type: 'approval', user: 'Jane Smith', time: '4 hours ago' },
            { action: 'Updated audit status', type: 'audit', user: 'Mike Johnson', time: '6 hours ago' },
            { action: 'Added closure evidence', type: 'evidence', user: 'Sarah Wilson', time: '1 day ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-red-500' : index === 1 ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                <span className="text-sm font-medium">{activity.action}</span>
                <span className="text-xs text-gray-500">by {activity.user}</span>
              </div>
              <span className="text-xs text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </>
    );
}