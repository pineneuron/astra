import Image from 'next/image';
import Link from 'next/link';

const posts = [
  {
    image: '/images/blog-placeholder.jpg',
    category: 'Astrology',
    title: 'Benefits of Astrology in Daily Life',
    excerpt: 'Astrology helps identify favorable periods for job changes, business growth, and financial planning.',
    href: '/blog/benefits-of-astrology',
  },
  {
    image: '/images/blog-placeholder.jpg',
    category: 'Astrology',
    title: 'Benefits of Astrology in Daily Life',
    excerpt: 'Astrology helps identify favorable periods for job changes, business growth, and financial planning.',
    href: '/blog/benefits-of-astrology',
  },
  {
    image: '/images/blog-placeholder.jpg',
    category: 'Astrology',
    title: 'Benefits of Astrology in Daily Life',
    excerpt: 'Astrology helps identify favorable periods for job changes, business growth, and financial planning.',
    href: '/blog/benefits-of-astrology',
  },
];

export default function BlogSection() {
  return (
    <section className="w-full bg-white pt-[65px] pb-[77px]">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header row */}
        <div className="flex items-center justify-between flex-col lg:flex-row mb-10">
          <h2 className="tsf-font-larken text-black text-[36px]">
            Our Latest Blogs
          </h2>
          <Link
            href="/blog"
            className="flex items-center gap-2 tsf-font-public-sans font-medium text-[16px] text-black hover:opacity-80 transition-opacity"
          >
            View All Blogs
            <Image
              src="/images/icon-arrow-right-sm.svg"
              alt=""
              width={16}
              height={10}
            />
          </Link>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <div
              key={i}
              className="bg-white rounded-[10px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col"
            >
              {/* Image */}
              <div className="relative h-[240px] w-full shrink-0">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col flex-1">
                {/* Category badge */}
                <span className="inline-block bg-[#460b04] text-white tsf-font-larken text-[10px] px-3 py-1 rounded-[2px] mb-3 self-start">
                  {post.category}
                </span>

                {/* Title */}
                <h3 className="tsf-font-larken-medium text-black text-[18px] leading-[30px] underline mb-2">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="tsf-font-larken text-black text-[14px] leading-[24px] mb-4 flex-1">
                  {post.excerpt}
                </p>

                {/* Read More */}
                <div className="flex items-center justify-between mt-auto">
                  <Link
                    href="#"
                    className="tsf-font-public-sans font-medium text-[14px] text-black underline hover:opacity-70 transition-opacity cursor-pointer"
                  >
                    Read More
                  </Link>
                  <Link
                    href="#"
                    aria-label="Read more"
                    className="shrink-0 cursor-pointer"
                  >
                    <Image
                      src="/images/icon-arrow-dark.svg"
                      alt=""
                      width={35}
                      height={35}
                    />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
