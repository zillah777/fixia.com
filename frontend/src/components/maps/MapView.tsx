import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MapPinIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface MapMarker {
  id: string;
  position: Location;
  title: string;
  type: 'service' | 'user' | 'search';
  data?: any;
}

interface MapViewProps {
  center?: Location;
  markers?: MapMarker[];
  zoom?: number;
  height?: string;
  onMarkerClick?: (marker: MapMarker) => void;
  onMapClick?: (location: Location) => void;
  showControls?: boolean;
}

export default function MapView({
  center = { lat: -34.6118, lng: -58.3960 }, // Buenos Aires
  markers = [],
  zoom = 12,
  height = '400px',
  onMarkerClick,
  onMapClick,
  showControls = true
}: MapViewProps) {
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // TODO: Integrar con Google Maps o Mapbox
  // Por ahora mostramos un placeholder
  
  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker);
    onMarkerClick?.(marker);
  };

  return (
    <div className="relative" style={{ height }}>
      {/* Map Container */}
      <div className="w-full h-full bg-neutral-100 rounded-lg overflow-hidden relative">
        {/* Placeholder map */}
        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
          <div className="text-center">
            <MapPinIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-600 mb-2">
              Mapa interactivo
            </h3>
            <p className="text-sm text-neutral-500">
              Próximamente integración con Google Maps
            </p>
            
            {/* Simulated markers */}
            <div className="mt-6 space-y-2">
              {markers.slice(0, 3).map((marker, index) => (
                <motion.div
                  key={marker.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.2 }}
                  className="inline-block mx-2"
                >
                  <button
                    onClick={() => handleMarkerClick(marker)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      marker.type === 'service'
                        ? 'bg-primary-blue text-white'
                        : marker.type === 'user'
                          ? 'bg-secondary-green text-white'
                          : 'bg-secondary-orange text-white'
                    }`}
                  >
                    📍 {marker.title}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Search Controls */}
        {showControls && (
          <div className="absolute top-4 left-4 right-4 z-10">
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar ubicación..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-neutral-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue text-sm"
                />
              </div>
              <button className="p-2 bg-white border border-neutral-200 rounded-lg shadow-sm hover:bg-neutral-50 transition-colors">
                <AdjustmentsHorizontalIcon className="w-4 h-4 text-neutral-600" />
              </button>
            </div>
          </div>
        )}

        {/* Zoom Controls */}
        {showControls && (
          <div className="absolute bottom-4 right-4 z-10">
            <div className="flex flex-col space-y-1 bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
              <button className="p-2 hover:bg-neutral-50 transition-colors text-neutral-600 text-lg font-semibold">
                +
              </button>
              <div className="h-px bg-neutral-200" />
              <button className="p-2 hover:bg-neutral-50 transition-colors text-neutral-600 text-lg font-semibold">
                −
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected Marker Info */}
      {selectedMarker && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-neutral-200 p-4 max-w-xs z-10"
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-neutral-900">{selectedMarker.title}</h4>
            <button
              onClick={() => setSelectedMarker(null)}
              className="text-neutral-400 hover:text-neutral-600"
            >
              ×
            </button>
          </div>
          
          <div className="text-sm text-neutral-600 mb-3">
            <div className="flex items-center space-x-1">
              <MapPinIcon className="w-3 h-3" />
              <span>
                {selectedMarker.position.lat.toFixed(4)}, {selectedMarker.position.lng.toFixed(4)}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button className="flex-1 px-3 py-1 bg-primary-blue text-white rounded text-xs hover:bg-primary-blue-dark transition-colors">
              Ver detalles
            </button>
            <button className="px-3 py-1 border border-neutral-300 text-neutral-600 rounded text-xs hover:bg-neutral-50 transition-colors">
              Direcciones
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}