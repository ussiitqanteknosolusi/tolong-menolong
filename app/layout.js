// import { Inter } from 'next/font/google';
import './globals.css';
import DesktopNav from '@/components/desktop-nav';
import MobileNav from '@/components/mobile-nav';
import { Toaster } from '@/components/ui/sonner';
import { LoadingProvider } from '@/lib/loading-context';
import { AuthProvider } from '@/components/auth-provider';
import { Suspense } from 'react';
import NextTopLoader from 'nextjs-toploader';

// const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://steelblue-tiger-791529.hostingersite.com'),
  title: 'BerbagiPath - Platform Donasi & Crowdfunding Indonesia',
  description: 'Platform donasi online terpercaya untuk membantu sesama. Galang dana untuk kesehatan, pendidikan, bencana alam, dan kegiatan sosial.',
  keywords: 'donasi, crowdfunding, galang dana, zakat, sedekah, bantu sesama',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <NextTopLoader color="#10b981" showSpinner={false} />
        <Suspense fallback={null}>
          <LoadingProvider>
            <AuthProvider>
              <DesktopNav />
              {children}
              <MobileNav />
              <Toaster position="top-center" />
            </AuthProvider>
          </LoadingProvider>
        </Suspense>
      </body>
    </html>
  );
}
