export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>

      {/* Stat Cards Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
              {i <= 2 && (
                <div className="h-5 bg-gray-200 rounded w-12 animate-pulse"></div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Stat Cards Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="h-4 bg-gray-200 rounded w-24 mb-4 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
            {i === 2 && (
              <div className="mt-2 h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Row 1: Revenue & Order Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
            <div className="h-[300px] bg-gray-50 rounded relative overflow-hidden">
              {/* Simulate chart lines */}
              <div className="absolute bottom-0 left-0 right-0 h-full flex items-end justify-around px-4">
                {[30, 45, 35, 60, 50, 40, 55].map((height, j) => (
                  <div
                    key={j}
                    className="bg-gray-200 rounded-t animate-pulse"
                    style={{
                      width: '8%',
                      height: `${height}%`,
                      animationDelay: `${j * 0.1}s`,
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 2: Order Status & Payment Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="h-6 bg-gray-200 rounded w-56 mb-4 animate-pulse"></div>
            <div className="h-[300px] bg-gray-50 rounded flex items-center justify-center">
              <div className="relative w-48 h-48">
                {/* Simulate pie chart segments */}
                <div className="absolute inset-0 rounded-full border-8 border-gray-200 animate-pulse"></div>
                <div
                  className="absolute inset-0 rounded-full border-8 border-transparent border-t-gray-300 animate-pulse"
                  style={{ transform: 'rotate(45deg)' }}
                ></div>
                <div
                  className="absolute inset-0 rounded-full border-8 border-transparent border-r-gray-300 animate-pulse"
                  style={{ transform: 'rotate(135deg)' }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 3: Top Products & Sales by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
            <div className="h-[300px] bg-gray-50 rounded relative overflow-hidden">
              {/* Simulate bar chart */}
              <div className="absolute bottom-0 left-0 right-0 h-full flex items-end justify-around px-4">
                {[25, 40, 30, 55, 45, 35, 50, 60].map((height, j) => (
                  <div
                    key={j}
                    className="bg-gray-200 rounded-t animate-pulse"
                    style={{
                      width: '10%',
                      height: `${height}%`,
                      animationDelay: `${j * 0.1}s`,
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Customers Trend */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
        <div className="h-[300px] bg-gray-50 rounded relative overflow-hidden">
          {/* Simulate bar chart */}
          <div className="absolute bottom-0 left-0 right-0 h-full flex items-end justify-around px-4">
            {[30, 45, 35, 50, 40, 55, 45].map((height, j) => (
              <div
                key={j}
                className="bg-gray-200 rounded-t animate-pulse"
                style={{
                  width: '12%',
                  height: `${height}%`,
                  animationDelay: `${j * 0.1}s`,
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
