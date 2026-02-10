'use client';

import { Loader2 } from 'lucide-react';

export default function ProfileLoading() {
  return (
    <main className="pb-20 md:pb-8">
      <div className="container py-6">
        {/* Profile Header Skeleton */}
        <div className="text-center mb-6">
          <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full animate-pulse mb-4" />
          <div className="h-6 w-32 mx-auto bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-40 mx-auto bg-gray-200 rounded animate-pulse mb-3" />
          <div className="h-8 w-24 mx-auto bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Stats Skeleton */}
        <div className="bg-white p-4 rounded-lg border mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="h-8 w-12 mx-auto bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-4 w-20 mx-auto bg-gray-200 rounded animate-pulse" />
            </div>
            <div>
              <div className="h-8 w-24 mx-auto bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-4 w-20 mx-auto bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Menu Skeleton */}
        <div className="bg-white rounded-lg border">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-3 p-4 border-b last:border-0">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 flex-1 bg-gray-200 rounded animate-pulse" />
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
