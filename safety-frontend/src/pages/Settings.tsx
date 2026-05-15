import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { User, Lock, Bell, Moon, Save } from 'lucide-react';
import { toastService } from '../utils/toast';

export default function Settings() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [profileData, setProfileData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    riskAssigned: true,
    riskUpdated: true,
    approvalPending: true,
  });

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toastService.success('Profile updated successfully!');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toastService.error('Passwords do not match!');
      return;
    }
    toastService.success('Password updated successfully!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleDarkModeToggle = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    toastService.success(`Dark mode ${newMode ? 'enabled' : 'disabled'}`);
  };

  if (!authService.isAuthenticated()) {
    navigate('/login');
    return null;
  }

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your account preferences</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold">Profile Settings</h2>
            </div>
            
            <form onSubmit={handleProfileSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Lock className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold">Change Password</h2>
            </div>
            
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Lock className="h-4 w-4" />
                Update Password
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Bell className="h-5 w-5 text-orange-600" />
              </div>
              <h2 className="text-lg font-semibold">Notification Preferences</h2>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <span className="text-sm font-medium">Email Notifications</span>
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                  className="h-5 w-5 text-blue-600 rounded"
                />
              </label>
              <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <span className="text-sm font-medium">Risk Assigned Notifications</span>
                <input
                  type="checkbox"
                  checked={notifications.riskAssigned}
                  onChange={(e) => setNotifications({ ...notifications, riskAssigned: e.target.checked })}
                  className="h-5 w-5 text-blue-600 rounded"
                />
              </label>
              <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <span className="text-sm font-medium">Risk Updated Notifications</span>
                <input
                  type="checkbox"
                  checked={notifications.riskUpdated}
                  onChange={(e) => setNotifications({ ...notifications, riskUpdated: e.target.checked })}
                  className="h-5 w-5 text-blue-600 rounded"
                />
              </label>
              <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <span className="text-sm font-medium">Approval Pending Notifications</span>
                <input
                  type="checkbox"
                  checked={notifications.approvalPending}
                  onChange={(e) => setNotifications({ ...notifications, approvalPending: e.target.checked })}
                  className="h-5 w-5 text-blue-600 rounded"
                />
              </label>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Moon className="h-5 w-5 text-indigo-600" />
              </div>
              <h2 className="text-lg font-semibold">Appearance</h2>
            </div>
            
            <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <span className="text-sm font-medium">Dark Mode</span>
              <button
                type="button"
                onClick={handleDarkModeToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${darkMode ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </label>
          </div>
        </div>
      </div>
    </>
  );
}