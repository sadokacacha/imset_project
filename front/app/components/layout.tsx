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
                  <>
                    <Link href="/admin/dashboard"></Link>
                  </>
                )}
                {user.role === 'teacher' && (
                  <>
                    <Link href="/teacher/dashboard"></Link>
                  </>
                )}
                {user.role === 'student' && (
                  <>
                    <Link href="/student/dashboard"></Link>
                  </>
                )}

              </>
            ) : (
              
                <Link  href="/"></Link>
              
            )}
          </ul>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
