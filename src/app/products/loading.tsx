import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton'

export default function ProductsLoading() {
  return (
    <>
      <Header variant="inner" />
      <main className="min-h-screen pb-[100px]">
        <div className="pt-18 pb-10 max-w-[1200px] mx-auto px-6">
          {/* Category tabs skeleton */}
          <div className="flex gap-3 mb-8 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-9 w-24 bg-gray-200 rounded-full animate-pulse shrink-0" />
            ))}
          </div>
          {/* Product grid skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
