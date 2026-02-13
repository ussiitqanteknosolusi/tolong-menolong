import './globals.css';
import DesktopNav from '@/components/desktop-nav';
import MobileNav from '@/components/mobile-nav';
import { Toaster } from '@/components/ui/sonner';
import { LoadingProvider } from '@/lib/loading-context';
import { AuthProvider } from '@/components/auth-provider';
import { Suspense } from 'react';
import NextTopLoader from 'nextjs-toploader';

// ✅ SEO Metadata
export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://steelblue-tiger-791529.hostingersite.com'),
  title: {
    default: 'BerbagiPath - Platform Donasi & Crowdfunding Indonesia',
    template: '%s | BerbagiPath',
  },
  description: 'Platform donasi online terpercaya untuk membantu sesama. Galang dana untuk kesehatan, pendidikan, bencana alam, dan kegiatan sosial.',
  keywords: 'donasi, crowdfunding, galang dana, zakat, sedekah, bantu sesama',
};

// ✅ Viewport config (separated from metadata for Next.js 14+)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#10b981',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      {/* ✅ Font Strategy: Use system font stack for zero layout shift and zero network cost.
          Falls back to Inter via CDN <link> below for visual consistency. */}
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
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
