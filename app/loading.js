'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function HomeLoading() {
  return (
    <div className="pb-20 md:pb-8">
      {/* Hero Skeleton */}
      <div className="bg-gradient-to-b from-emerald-50 to-background py-6 md:py-12">
        <div className="container">
          <div className="relative rounded-2xl overflow-hidden bg-gray-200 animate-pulse aspect-[16/9] md:aspect-[21/9]">
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="py-6 border-b">
        <div className="container">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <div className="w-10 h-10 mx-auto bg-gray-200 rounded-full animate-pulse mb-2" />
                <div className="h-6 w-20 mx-auto bg-gray-200 rounded animate-pulse mb-1" />
                <div className="h-4 w-16 mx-auto bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Skeleton */}
      <div className="py-8">
        <div className="container">
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-3 w-14 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campaigns Skeleton */}
      <div className="py-8">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 w-36 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg border overflow-hidden">
                <div className="aspect-[16/10] bg-gray-200 animate-pulse" />
                <div className="p-4">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mb-3" />
                  <div className="h-2 w-full bg-gray-200 rounded-full animate-pulse mb-2" />
                  <div className="flex justify-between">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
