'use client';

import Link from 'next/link';
import AuthContext, { AuthContextType } from '../context/AuthContext';
import { useContext } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useContext(AuthContext) as AuthContextType;

  return (
    <div>
      <header>
        <nav>
          <ul>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <li>
                    <Link href="/admin/dashboard">Admin Dashboard</Link>
                  </li>
                )}
                {user.role === 'teacher' && (
                  <li>
                    <Link href="/teacher/dashboard">Teacher Dashboard</Link>
                  </li>
                )}
                {user.role === 'student' && (
                  <li>
                    <Link href="/student/dashboard">Student Dashboard</Link>
                  </li>
                )}
                <li>
                  <button onClick={logout}>Logout</button>
                </li>
              </>
            ) : (
              <li >
                <Link  href="/"></Link>{' '}
              </li>
            )}
          </ul>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
