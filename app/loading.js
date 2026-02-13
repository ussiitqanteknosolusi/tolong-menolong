// ✅ Global Loading Skeleton — prevents blocking render
// This is a Server Component, no JS shipped to client
export default function Loading() {
  return (
    <main className="pb-20 md:pb-8 animate-pulse">
      {/* Hero Skeleton */}
      <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-gray-200 rounded-b-2xl" />

      {/* Stats Skeleton */}
      <section className="py-6 border-b">
        <div className="container">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 mx-auto mb-2" />
                <div className="h-6 w-20 bg-gray-200 rounded mx-auto mb-1" />
                <div className="h-3 w-16 bg-gray-100 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cards Skeleton */}
      <section className="py-8">
        <div className="container">
          <div className="h-6 w-40 bg-gray-200 rounded mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="aspect-[16/10] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-2 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
