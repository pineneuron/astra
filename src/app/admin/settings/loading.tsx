export default function SettingsLoading() {
  return (
    <div>
      <div className="mb-8">
        <div className="h-9 w-48 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-5 w-96 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar Skeleton */}
        <aside className="space-y-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </aside>

        {/* Main Content Skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="mb-6">
            <div className="h-7 w-32 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-5 w-96 bg-gray-200 rounded animate-pulse" />
          </div>

          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-1.5" />
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-80 bg-gray-200 rounded animate-pulse mt-1.5" />
              </div>
            ))}
            <div className="pt-4">
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

