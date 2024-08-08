// app/teacher/dashboard/page.js
import ProtectedRoute from '../../components/ProtectedRoute';
import TeacherDashboard from '../../components/TeacherDashboard';

const TeacherDashboardPage = () => {
  return (
    <ProtectedRoute role="teacher">
      <TeacherDashboard />
    </ProtectedRoute>
  );
};

export default TeacherDashboardPage;
