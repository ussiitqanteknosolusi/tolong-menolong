'use client';

import { Loader2 } from 'lucide-react';

export default function UsersLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-8 w-36 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-52 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-10 w-36 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Memuat data users...</p>
        </div>
      </div>
    </div>
  );
}
