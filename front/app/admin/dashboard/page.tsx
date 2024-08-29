import ProtectedRoute from '../../components/ProtectedRoute';
import AdminDashboard from './AdminDashboard';

const AdminDashboardPage = () => {
  return (
    <ProtectedRoute role="admin">
      <AdminDashboard />
    </ProtectedRoute>
  );
};

export default AdminDashboardPage;
