'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { 
  ssr: false,
  loading: () => <div className="h-[500px] bg-gray-100 rounded-lg flex items-center justify-center"><p className="text-gray-500">Loading map...</p></div>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as React.ComponentType<any>;
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as React.ComponentType<any>;
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as React.ComponentType<any>;
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as React.ComponentType<any>;

export interface Dealer {
  id: string;
  name: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  coordinates: [number, number]; // [lat, lng]
}

interface DealersMapProps {
  dealers: Dealer[];
}

export default function DealersMap({ dealers }: DealersMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Fix for default marker icon issue in Leaflet with Next.js
    if (typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        // Fix for default marker icon paths
        const DefaultIcon = L.Icon.Default;
        delete (DefaultIcon.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
        DefaultIcon.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });
      }).catch(() => {
        // Silently fail if leaflet can't be imported
      });
    }
  }, []);

  if (!isMounted) {
    return (
      <div className="h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  if (dealers.length === 0) {
    return null;
  }

  // Calculate center from dealers if available, otherwise use Nepal center
  const centerLat = dealers.length > 0 
    ? dealers.reduce((sum, d) => sum + d.coordinates[0], 0) / dealers.length
    : 28.3949;
  const centerLng = dealers.length > 0
    ? dealers.reduce((sum, d) => sum + d.coordinates[1], 0) / dealers.length
    : 84.1240;

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden tsf-box-shadow">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={dealers.length === 1 ? 10 : 7}
        style={{ height: '100%', width: '100%' }}
        key="dealers-map" // Force re-render when Leaflet is ready
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {dealers.map((dealer) => (
          <Marker key={dealer.id} position={dealer.coordinates as [number, number]}>
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-sm tsf-font-sora">{dealer.name}</h3>
                <p className="text-xs text-gray-600 mt-1">{dealer.city}</p>
                <p className="text-xs text-gray-600">{dealer.address}</p>
                <p className="text-xs text-gray-600 mt-1">
                  <strong>Phone:</strong> {dealer.phone}
                </p>
                {dealer.email && (
                  <p className="text-xs text-gray-600">
                    <strong>Email:</strong> {dealer.email}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
