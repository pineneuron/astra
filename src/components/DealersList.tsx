'use client';

export interface Dealer {
  id: string;
  name: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface DealersListProps {
  dealers: Dealer[];
}

export default function DealersList({ dealers }: DealersListProps) {
  if (dealers.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {dealers.map((dealer) => (
        <div key={dealer.id} className="tsf-box-shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold tsf-font-sora text-gray-800">{dealer.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{dealer.city}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-xl">📍</span>
            </div>
          </div>
          
          <div className="space-y-2">
            {dealer.address && (
              <div className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">📍</span>
                <p className="text-sm text-gray-600">{dealer.address}</p>
              </div>
            )}
            
            {dealer.phone && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">📞</span>
                <a href={`tel:${dealer.phone}`} className="text-sm text-blue-600 hover:text-blue-800">
                  {dealer.phone}
                </a>
              </div>
            )}
            
            {dealer.email && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">✉️</span>
                <a href={`mailto:${dealer.email}`} className="text-sm text-blue-600 hover:text-blue-800">
                  {dealer.email}
                </a>
              </div>
            )}
          </div>
          
        </div>
      ))}
    </div>
  );
}
