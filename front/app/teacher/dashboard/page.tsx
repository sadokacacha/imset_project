import ProtectedRoute from '../../components/ProtectedRoute';
import TeacherDashboard from '../../components/TeacherDashboard';

const TeacherDashboardPage: React.FC = () => {
  return (
    <ProtectedRoute role="teacher">
      <TeacherDashboard />
    </ProtectedRoute>
  );
};

export default TeacherDashboardPage;
