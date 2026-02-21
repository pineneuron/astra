'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export type HeroSlide = {
  id: string
  desktopImage: string
  mobileImage?: string
  url?: string
}

export interface HeroCarouselProps {
  slides?: HeroSlide[]
}

const defaultSlides: HeroSlide[] = [
  { id: 'slide-1', desktopImage: '/images/hero/hero-1.png' },
  { id: 'slide-2', desktopImage: '/images/hero/hero-2.png' },
  { id: 'slide-3', desktopImage: '/images/hero/hero-3.png' },
  { id: 'slide-4', desktopImage: '/images/hero/hero-4.png' },
]

export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const normalizedSlides = useMemo(() => {
    const filtered = (slides ?? []).filter((slide) => Boolean(slide.desktopImage))
    if (filtered.length === 0) {
      return defaultSlides
    }
    return filtered.map((slide, index) => ({
      id: slide.id || `slide-${index}`,
      desktopImage: slide.desktopImage,
      mobileImage: slide.mobileImage || slide.desktopImage,
      url: slide.url,
    }))
  }, [slides])

  const [currentSlide, setCurrentSlide] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % normalizedSlides.length)
  }, [normalizedSlides.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + normalizedSlides.length) % normalizedSlides.length)
  }, [normalizedSlides.length])

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [nextSlide])

  const handleMouseEnter = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const handleMouseLeave = () => {
    intervalRef.current = setInterval(() => {
      nextSlide()
    }, 5000)
  }

  return (
    <div 
      ref={carouselRef}
      className="relative w-full h-full min-h-[560px] sm:min-h-[660px] md:min-h-[360px] overflow-hidden rounded-lg"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ maxWidth: '100%', width: '100%', boxSizing: 'border-box' }}
    >
      {normalizedSlides.map((slide, index) => {
        const images = (
          <>
            <Image
              src={slide.desktopImage}
              alt="Banner image"
              fill
              priority={index === 0}
              className="hidden h-full w-full object-cover md:block"
              sizes="(min-width: 1024px) 1024px, 100vw"
              style={{ objectFit: 'cover', maxWidth: '100%' }}
            />
            <Image
              src={slide.mobileImage || slide.desktopImage}
              alt="Banner image"
              fill
              priority={index === 0}
              className="block h-full w-full object-cover md:hidden"
              sizes="100vw"
              style={{ objectFit: 'cover', objectPosition: 'top', maxWidth: '100%' }}
            />
          </>
        )

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {slide.url ? (
              <Link 
                href={slide.url}
                className="block h-full w-full"
                data-slide-url={slide.url}
              >
                {images}
              </Link>
            ) : (
              <div className="h-full w-full">
                {images}
              </div>
            )}
          </div>
        )
      })}

      {/* Navigation Buttons */}
      <button
        type="button"
        className="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
          <svg className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 1 1 5l4 4" />
          </svg>
          <span className="sr-only">Previous</span>
        </span>
      </button>

      <button
        type="button"
        className="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
          <svg className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
          </svg>
          <span className="sr-only">Next</span>
        </span>
      </button>

      {/* Dots Indicator */}
      {/* <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              index === currentSlide 
                ? 'bg-white' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div> */}
    </div>
  )
}
