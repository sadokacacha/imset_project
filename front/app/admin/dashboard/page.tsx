import ProtectedRoute from '../../components/ProtectedRoute';
import AdminDashboard from '../../components/AdminDashboard';

const AdminDashboardPage = () => {
  return (
    <ProtectedRoute role="admin">
      <AdminDashboard />
    </ProtectedRoute>
  );
};

export default AdminDashboardPage;
