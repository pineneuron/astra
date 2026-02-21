export default function CouponsLoading() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-gray-200 rounded w-28 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-64 bg-gray-200 rounded-md animate-pulse hidden md:block"></div>
          <div className="h-9 w-24 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <table className="w-full table-auto">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">
              <th className="px-3 py-2">
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </th>
              <th className="px-3 py-2">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              </th>
              <th className="px-3 py-2">
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </th>
              <th className="px-3 py-2">
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </th>
              <th className="px-3 py-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </th>
              <th className="px-3 py-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </th>
              <th className="px-3 py-2">
                <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
              </th>
              <th className="px-3 py-2 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="px-3 py-3">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </td>
                <td className="px-3 py-3">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                </td>
                <td className="px-3 py-3">
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                </td>
                <td className="px-3 py-3">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </td>
                <td className="px-3 py-3">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </td>
                <td className="px-3 py-3">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </td>
                <td className="px-3 py-3">
                  <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                </td>
                <td className="px-3 py-3">
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
