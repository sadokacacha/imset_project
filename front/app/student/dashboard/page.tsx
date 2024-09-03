import ProtectedRoute from '../../components/ProtectedRoute';
import StudentDashboard from './StudentDashboard';
const StudentDashboardPage: React.FC = () => {
  return (
    <ProtectedRoute role="student">
      <StudentDashboard />
    </ProtectedRoute>
  );
};

export default StudentDashboardPage;
