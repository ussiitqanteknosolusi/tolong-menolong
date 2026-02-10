'use client';

import { Loader2 } from 'lucide-react';

export default function DonationsPageLoading() {
  return (
    <main className="pb-20 md:pb-8">
      <div className="container py-6">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-6" />
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Memuat riwayat donasi...</p>
          </div>
        </div>
      </div>
    </main>
  );
}
