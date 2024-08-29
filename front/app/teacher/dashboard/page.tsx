import ProtectedRoute from '../../components/ProtectedRoute';
import TeacherDashboard from './TeacherDashboard';

const TeacherDashboardPage: React.FC = () => {
  return (
    <ProtectedRoute role="teacher">
      <TeacherDashboard />
    </ProtectedRoute>
  );
};

export default TeacherDashboardPage;
