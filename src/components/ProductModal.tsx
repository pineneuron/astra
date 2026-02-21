'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';

interface ProductVariation {
  name: string;
  price: number;
  discountPercent?: number;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: number;
    unit: string;
    discountPercent?: number;
    image: string;
    images?: string[];
    description?: string;
    variations?: ProductVariation[];
    defaultVariation?: string;
  } | null;
}

export default function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Initialize selected variation when product changes
  useEffect(() => {
    if (product) {
      setSelectedVariation(product.defaultVariation || product.variations?.[0]?.name || '');
      setQuantity(1);
      setCurrentImageIndex(0);
    }
  }, [product]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  
  // Get current variation data
  const currentVariation = product.variations?.find(v => v.name === selectedVariation);
  const currentPrice = currentVariation?.price || product.price;
  const currentDiscount = currentVariation?.discountPercent || product.discountPercent || 0;
  const finalPrice = currentDiscount > 0 
    ? currentPrice * (1 - currentDiscount / 100)
    : currentPrice;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: currentPrice,
      unit: product.unit,
      discountPercent: currentDiscount,
      image: product.image,
      variation: selectedVariation
    }, quantity);
    
    // Dispatch event to open cart
    window.dispatchEvent(new CustomEvent('tsf:cart-open'));
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] relative flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white hover:text-gray-200 text-2xl font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg"
          style={{ backgroundColor: '#030e55' }}
        >
          ×
        </button>

        {/* Content */}
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-10 p-4 overflow-y-auto">
          {/* Left Side - Image Gallery */}
          <div className="flex-1 lg:w-1/2">
            <div className="relative">
              {/* Main Image */}
              <div className="relative overflow-hidden rounded-lg h-100 lg:h-[28rem]">
                <Image
                  src={images[currentImageIndex]}
                  alt={product.name}
                  fill
                  className="object-cover cursor-zoom-in transition-transform duration-300 hover:scale-[1.02]"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                />
                {currentDiscount > 0 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                    -{currentDiscount}%
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto mt-4">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                        currentImageIndex === index 
                          ? 'border-blue-500' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Product Details */}
          <div className="flex-1 lg:w-1/2 flex flex-col lg:justify-between">
            <div>
              {/* Product Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mb-4">
                <span className="text-2xl font-bold tsf-red-color">
                  Rs. {finalPrice.toFixed(2)}
                </span>
                {currentDiscount > 0 && (
                  <span className="text-lg text-gray-500 line-through ml-2">
                    Rs. {currentPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-gray-600 ml-2">/ {product.unit}</span>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-gray-700 mb-4">
                  {product.description}
                </p>
              )}

              {/* Variations */}
              {product.variations && product.variations.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Variation
                  </label>
                  <select
                    value={selectedVariation}
                    onChange={(e) => setSelectedVariation(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {product.variations.map((variation) => (
                      <option key={variation.name} value={variation.name}>
                        {variation.name} - Rs. {variation.price.toFixed(2)}
                        {variation.discountPercent && variation.discountPercent > 0 && 
                          ` (${variation.discountPercent}% off)`
                        }
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="text-lg font-semibold min-w-[2rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="holographic-card w-full py-3 px-4 bg-[#030e55] text-white font-bebas uppercase text-lg font-bold border-none rounded-full cursor-pointer"
              >
                Add to Cart - Rs. {(finalPrice * quantity).toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
