// app/student/dashboard/page.js
import ProtectedRoute from '../../components/ProtectedRoute';
import StudentDashboard from '../../components/StudentDashboard';

const StudentDashboardPage = () => {
  return (
    <ProtectedRoute role="student">
      <StudentDashboard />
    </ProtectedRoute>
  );
};

export default StudentDashboardPage;
