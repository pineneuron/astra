import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ServiceCardSkeleton from '@/components/skeletons/ServiceCardSkeleton'

export default function ServiceCategoryLoading() {
  return (
    <>
      <Header variant="inner" />
      <main className="min-h-screen pb-[100px]">
        <div className="bg-[#f2f2f2]">
          <div className="max-w-[1200px] mx-auto px-6 py-5">
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto px-6 pt-10">
          <div className="h-12 bg-gray-200 rounded w-64 animate-pulse mb-3" />
          <div className="h-5 bg-gray-200 rounded w-96 animate-pulse" />
        </div>
        <section className="relative w-full bg-white py-14">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="flex flex-wrap justify-center gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <ServiceCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
