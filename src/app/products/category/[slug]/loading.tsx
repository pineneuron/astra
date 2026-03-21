import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton'

export default function ProductCategoryLoading() {
  return (
    <>
      <Header variant="inner" />
      <main className="min-h-screen pb-[100px]">
        <div className="bg-[#f2f2f2]">
          <div className="max-w-[1200px] mx-auto px-6 py-5">
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto px-6 pt-10 pb-4">
          <div className="h-12 bg-gray-200 rounded w-64 animate-pulse mb-3" />
          <div className="h-5 bg-gray-200 rounded w-96 animate-pulse" />
        </div>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pt-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
