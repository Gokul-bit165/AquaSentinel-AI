import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';

import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Analytics from './pages/Analytics';
import History from './pages/History';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import NetworkHealth from './pages/NetworkHealth';
import MapPage from './pages/MapPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* User Portal Routes */}
        <Route path="/dashboard" element={
          <Layout role="user">
            <Dashboard />
          </Layout>
        } />
        <Route path="/analysis" element={<Layout role="user"><Analytics /></Layout>} />
        <Route path="/history" element={<Layout role="user"><History /></Layout>} />
        <Route path="/reports" element={<Layout role="user"><Reports /></Layout>} />
        <Route path="/map" element={<Layout role="user"><MapPage /></Layout>} />
        <Route path="/settings" element={<Layout role="user"><Settings /></Layout>} />

        {/* Admin Portal Routes */}
        <Route path="/admin" element={
          <Layout role="admin">
            <AdminDashboard />
          </Layout>
        } />
        <Route path="/admin/analytics" element={
          <Layout role="admin">
            <Analytics />
          </Layout>
        } />
        <Route path="/admin/network" element={<Layout role="admin"><NetworkHealth /></Layout>} />
        <Route path="/admin/reports" element={<Layout role="admin"><Reports /></Layout>} />
        <Route path="/admin/map" element={<Layout role="admin"><MapPage /></Layout>} />
        <Route path="/admin/settings" element={<Layout role="admin"><Settings /></Layout>} />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
