'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface VideoPlayerProps {
  src: string;
  thumbnail: string;
  thumbnailAlt?: string;
  className?: string;
}

function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

function isYouTubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/.test(url);
}

export default function VideoPlayer({
  src,
  thumbnail,
  thumbnailAlt = 'Video thumbnail',
  className = '',
}: VideoPlayerProps) {
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isYouTube = isYouTubeUrl(src);
  const youtubeVideoId = isYouTube ? extractYouTubeVideoId(src) : null;
  const youtubeEmbedUrl = youtubeVideoId 
    ? `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&rel=0`
    : null;

  useEffect(() => {
    if (isVideoVisible && videoRef.current && !isYouTube) {
      const video = videoRef.current;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If autoplay fails, show controls so user can play manually
          video.controls = true;
        });
      }
    }
  }, [isVideoVisible, isYouTube]);

  const handlePlayClick = () => {
    setIsVideoVisible(true);
  };

  return (
    <div className={`relative rounded-md overflow-hidden ${className}`}>
      {!isVideoVisible ? (
        <div className="relative cursor-pointer group" onClick={handlePlayClick}>
          <Image
            src={thumbnail}
            alt={thumbnailAlt}
            width={1280}
            height={720}
            className="w-full h-auto object-cover"
            priority={false}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
            <div className="bg-white/90 rounded-full p-3 md:p-6 group-hover:bg-white transition-colors">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-black md:w-12 md:h-12 w-6 h-6"
              >
                <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
              </svg>
            </div>
          </div>
        </div>
      ) : isYouTube && youtubeEmbedUrl ? (
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={youtubeEmbedUrl}
            className="absolute top-0 left-0 w-full h-full rounded-md"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={thumbnailAlt}
          />
        </div>
      ) : (
        <video
          ref={videoRef}
          src={src}
          controls
          loop
          className="w-full h-auto"
          poster={thumbnail}
        />
      )}
    </div>
  );
}
