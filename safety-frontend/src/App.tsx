import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainerComponent } from './utils/toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Risks from './pages/Risks';
import Locations from './pages/Locations';
import Audits from './pages/Audits';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Settings from './pages/Settings';
import MainLayout from './layouts/MainLayout';
import { authService } from './services/auth.service';

if (localStorage.getItem('darkMode') === 'true') {
  document.documentElement.classList.add('dark');
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <MainLayout>{children}</MainLayout>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainerComponent />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/risks" 
            element={
              <ProtectedRoute>
                <Risks />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/locations" 
            element={
              <ProtectedRoute>
                <Locations />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/audits" 
            element={
              <ProtectedRoute>
                <Audits />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;