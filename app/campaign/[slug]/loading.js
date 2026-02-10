'use client';

import { Loader2 } from 'lucide-react';

export default function CampaignDetailLoading() {
  return (
    <main className="pb-24 md:pb-8">
      {/* Mobile Header Skeleton */}
      <div className="sticky top-0 z-40 bg-background border-b md:hidden">
        <div className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 flex-1 bg-gray-200 rounded animate-pulse" />
          <div className="w-10 h-10 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Hero Image Skeleton */}
      <div className="relative aspect-[16/9] md:aspect-[21/9] bg-gray-200 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
        </div>
      </div>

      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Title Skeleton */}
            <div>
              <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                <div>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-1" />
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="space-y-3">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
