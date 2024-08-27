import { Inter } from 'next/font/google';
import Layout from './components/layout';
import { AuthProvider } from './context/AuthContext';
import { ReactNode } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'E-Learning-Platform',
  description: 'E-Learning-Platform',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <AuthProvider>
      <html lang="en">
        <body className={inter.className}>
          <Layout>{children}</Layout>
        </body>
      </html>
    </AuthProvider>
  );
}
