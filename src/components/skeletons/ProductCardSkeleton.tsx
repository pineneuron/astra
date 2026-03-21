export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-white border border-[#e5e7eb] rounded-lg overflow-hidden animate-pulse">
      <div className="aspect-square w-full bg-gray-200" />
      <div className="p-3 flex flex-col gap-2">
        <div className="h-4 bg-gray-200 rounded w-4/5" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-8 bg-gray-200 rounded-full w-full mt-1" />
      </div>
    </div>
  )
}
