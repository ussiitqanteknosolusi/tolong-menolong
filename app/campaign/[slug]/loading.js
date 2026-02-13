// ✅ Campaign Detail Loading Skeleton (Server Component — zero JS)
export default function CampaignLoading() {
  return (
    <main className="pb-20 animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full aspect-[16/10] md:aspect-[21/9] bg-gray-200" />

      <div className="container max-w-4xl mx-auto py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
            <div className="h-2 bg-gray-200 rounded-full w-full" />
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-100 rounded w-16" />
            </div>
            <div className="h-40 bg-gray-100 rounded-xl" />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded-xl" />
            <div className="h-12 bg-gray-100 rounded-xl" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-24" />
                    <div className="h-3 bg-gray-100 rounded w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
