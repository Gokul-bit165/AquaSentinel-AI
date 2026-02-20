import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';

import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Analytics from './pages/Analytics';

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
        <Route path="/analysis" element={<Layout role="user"><div className="p-8">Risk Analysis Section</div></Layout>} />

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

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
