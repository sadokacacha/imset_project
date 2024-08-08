// components/Layout.js
'use client';
import Link from 'next/link';
import AuthContext from '../context/AuthContext';
import { useContext } from 'react';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);

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
              <li>
                <Link href="/login">Login</Link>
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
