export default function ServiceCardSkeleton() {
  return (
    <div className="flex flex-col w-full md:w-[calc((100%-2.5rem)/3)] lg:w-[calc((100%-3.75rem)/4)] shrink-0 bg-white border border-[#e5e7eb] rounded-[4px] overflow-hidden animate-pulse">
      <div className="h-[200px] w-full bg-gray-200" />
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="mt-auto h-[45px] bg-gray-200 rounded-[50px] w-36 self-center" />
      </div>
    </div>
  )
}
