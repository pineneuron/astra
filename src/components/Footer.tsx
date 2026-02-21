import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import { prisma } from '@/lib/db';
import WhatsAppFloatingButton from '@/components/WhatsAppFloatingButton';

export default async function Footer() {
  // Fetch categories without parent, active, and not soft-deleted, ordered by sortOrder
  const categories = await prisma.category.findMany({
    where: {
      parentId: null,
      deletedAt: null,
      isActive: true,
    },
    orderBy: { sortOrder: 'asc' },
  });

  // Split categories into two columns
  const midPoint = Math.ceil(categories.length / 2);
  const leftColumn = categories.slice(0, midPoint);
  const rightColumn = categories.slice(midPoint);
  return (
    <footer className="tsf-footer relative tsf-bg-black pt-12 pb-8 md:pt-20 md:pb-10 lg:pt-40 lg:pb-10" suppressHydrationWarning>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-3 gap-10">
          <div className="footer-left">
            <Link href="/">
              <Image className="w-40 h-40" src="/images/logo.svg" alt="logo" width={160} height={160} />
            </Link>
            <p className="text-white mt-4 line-height-8">
              Three Star Foods Pvt. Ltd. is a premier manufacturer and trader of premium meat products in Kathmandu, Nepal. We combine cutting-edge technology with unwavering dedication to quality and hygiene, delivering excellence in every bite. Building enduring relationships through trust, quality, and reliability.
            </p>
            {/* <div className="mt-8">
              <h4 className="text-xl text-white tsf-font-sora font-semibold mb-4">Business Hours</h4>
              <p className="text-white">
                6:00 AM - 9:00 PM
              </p>
              <Link href="/contact" className="mt-6 inline-block bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                Contact Us
              </Link>
            </div> */}
          </div>
          <div className="footer-right col-span-2 ml-20">
            <div className="grid grid-cols-3 gap-10">
              <div className="footer-right-quicklinks">
                <h3 className="text-xl font-bold text-white tsf-font-sora uppercase">Quick Links</h3>
                <ul className="mt-10 mr-10">
                  <li className="pb-5 text-white"><Link href="/">Home</Link></li>
                  <li className="pb-5 text-white"><Link href="/about-us">About</Link></li>
                  <li className="pb-5 text-white"><Link href="/products">Products</Link></li>
                  <li className="pb-5 text-white"><Link href="/our-dealers">Our Dealers</Link></li>
                  <li className="pb-5 text-white"><Link href="/contact">Contact</Link></li>
                  <li className="pb-5 text-white"><Link href="/track-order">Track Order</Link></li>
                </ul>
              </div>
              <div className="footer-right-productcategory">
                <h3 className="text-xl font-bold text-white tsf-font-sora uppercase">Product Categories</h3>
                <div className="grid grid-cols-2 gap-10">
                  <ul className="mt-10">
                    {leftColumn.map((category) => (
                      <li key={category.id} className="pb-5 text-white">
                        <Link href={`/products?category=${category.slug}`}>
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <ul className="mt-10">
                    {rightColumn.map((category) => (
                      <li key={category.id} className="pb-5 text-white">
                        <Link href={`/products?category=${category.slug}`}>
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="footer-right-location ml-20">
                <h3 className="text-xl font-bold text-white tsf-font-sora uppercase">Location</h3>
                <div className="mt-10">
                  <p className="text-white mb-5">
                    Tokha-6, Kathmandu, Greenland, Triyog Marg
                  </p>
                  <p className="text-white mb-5">
                    3starmeat@gmail.com
                  </p>
                  <p className="text-white">
                    +977 14988879, 4963659
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="social-certificate flex items-center justify-between gap-10 mt-10">
          <div className="footer-left-social">
            <ul className="inline-flex items-center justify-between gap-6">
              <li>
                <Link href="https://www.facebook.com/3starfoodspvtltd" className="bg-white py-5 px-6 inline-flex items-center justify-center w-16 h-16 rounded-full hover:bg-gray-100 transition-colors" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <Facebook className="text-black" size={28} />
                </Link>
              </li>
              <li>
                <Link href="https://www.instagram.com/3starfoods" className="bg-white py-5 px-6 inline-flex items-center justify-center w-16 h-16 rounded-full hover:bg-gray-100 transition-colors" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <Instagram className="text-black" size={28} />
                </Link>
              </li>
              <li>
                <Link href="https://www.youtube.com/@threestar6309" className="bg-white py-5 px-6 inline-flex items-center justify-center w-16 h-16 rounded-full hover:bg-gray-100 transition-colors" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <Youtube className="text-black" size={28} />
                </Link>
              </li>
            </ul>
          </div>
          <div className="footer-right-certificate">
            <div className="flex items-space-between gap-10">
              <Image src="/images/iso.svg" alt="iso" width={120} height={120} />
              <Image src="/images/certificate.svg" alt="certificate" width={120} height={120} />
            </div>
          </div>
        </div>
        <div className="footer-copyright border-t border-white pt-10 mt-10">
          <div className="flex items-center justify-between">
            <div className="tsf-copyright">
              <p className="text-white">
                © 2026 Three Star Foods Private Limited.
              </p>
            </div>
            <div className="tsf-payment">
              <div className="flex items-center gap-10">
                <div className="tsf-payment-img">
                  <Image src="/images/esewa.svg" alt="esewa" width={80} height={60} />
                </div>
                <div className="tsf-payment-img">
                  <Image src="/images/khalti.svg" alt="khalti" width={80} height={60} />
                </div>
                <div className="tsf-payment-img">
                  <Image src="/images/visacard.svg" alt="visacard" width={80} height={60} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <WhatsAppFloatingButton />
    </footer>
  );
}
