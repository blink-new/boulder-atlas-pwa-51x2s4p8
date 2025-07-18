import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Boulder } from '../../types/boulder';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MapPin, Star, Eye, Navigation } from 'lucide-react';

// Fix default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom boulder marker icon
const boulderIcon = new L.DivIcon({
  html: `<div class="w-8 h-8 md:w-12 md:h-12 rounded-full bg-primary shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 animate-float">
    <svg class="h-4 w-4 md:h-6 md:w-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
    </svg>
  </div>`,
  className: 'custom-boulder-marker',
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -48]
});

// Mock data for demo
const mockBoulders: Boulder[] = [
  {
    id: '1',
    name: 'La Marie-Rose',
    description: 'A classic traverse in Fontainebleau with beautiful crimps and technical moves.',
    latitude: 48.447,
    longitude: 2.5969,
    location: 'Fontainebleau, France',
    images: [
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&q=80',
      'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400&q=80'
    ],
    submittedBy: 'climber123',
    submittedAt: new Date('2024-01-15'),
    submitterGrade: { vGrade: 'V4', fontGrade: '6b+' },
    communityGrade: { vGrade: 'V4', fontGrade: '6b+', averageRating: 4.2, totalVotes: 23 },
    rock: 'Sandstone',
    style: ['Overhanging', 'Technical'],
    tags: ['Crimp', 'Technical', 'Classic'],
    height: 4.5,
    established: new Date('1985-06-12'),
    firstAscentist: 'Marc Le Menestrel'
  },
  {
    id: '2',
    name: 'Midnight Lightning',
    description: 'The most famous boulder problem in the world, located in Camp 4.',
    latitude: 37.7449,
    longitude: -119.5969,
    location: 'Yosemite, California',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80'
    ],
    submittedBy: 'yosemiteclimber',
    submittedAt: new Date('2024-01-10'),
    submitterGrade: { vGrade: 'V8', fontGrade: '7b+' },
    communityGrade: { vGrade: 'V8', fontGrade: '7b+', averageRating: 4.8, totalVotes: 156 },
    rock: 'Granite',
    style: ['Slightly Overhanging', 'Powerful'],
    tags: ['Highball', 'Classic', 'Powerful'],
    height: 5.2,
    established: new Date('1978-09-01'),
    firstAscentist: 'Ron Kauk'
  },
  {
    id: '3',
    name: 'The Nose Direct',
    description: 'Technical face climbing on perfect Hueco granite.',
    latitude: 31.8957,
    longitude: -106.4424,
    location: 'Hueco Tanks, Texas',
    images: [
      'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&q=80'
    ],
    submittedBy: 'texasboulderer',
    submittedAt: new Date('2024-01-08'),
    submitterGrade: { vGrade: 'V6', fontGrade: '7a' },
    communityGrade: { vGrade: 'V6', fontGrade: '7a', averageRating: 4.1, totalVotes: 34 },
    rock: 'Granite',
    style: ['Slab', 'Technical'],
    tags: ['Pocket', 'Technical', 'Desert'],
    height: 3.8,
    established: new Date('1992-03-15'),
    firstAscentist: 'Fred Nicole'
  }
];

interface OpenStreetMapProps {
  onBoulderSelect?: (boulder: Boulder) => void;
  onSubmitAtLocation?: (lat: number, lng: number) => void;
}

// Component to handle user location and centering
function UserLocationHandler({ userLocation }: { userLocation: { lat: number; lng: number } | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (userLocation && map) {
      map.setView([userLocation.lat, userLocation.lng], 10);
    }
  }, [userLocation, map]);
  
  return null;
}

// Component to handle map events
function MapEventHandler({ onSubmitAtLocation }: { onSubmitAtLocation?: (lat: number, lng: number) => void }) {
  const map = useMap();
  
  useEffect(() => {
    if (onSubmitAtLocation) {
      const handleMapDoubleClick = (e: L.LeafletMouseEvent) => {
        onSubmitAtLocation(e.latlng.lat, e.latlng.lng);
      };
      
      map.on('dblclick', handleMapDoubleClick);
      
      return () => {
        map.off('dblclick', handleMapDoubleClick);
      };
    }
  }, [map, onSubmitAtLocation]);
  
  return null;
}

export default function OpenStreetMap({ onBoulderSelect, onSubmitAtLocation }: OpenStreetMapProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  const handleBoulderClick = (boulder: Boulder) => {
    onBoulderSelect?.(boulder);
  };

  const centerOnUser = () => {
    if (userLocation) {
      // This will be handled by UserLocationHandler
      setUserLocation({ ...userLocation });
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl">
      {/* Map Title Overlay */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h2 className="text-lg md:text-2xl font-outfit font-bold text-foreground mb-2 drop-shadow-sm">
          Boulder Locations
        </h2>
        <p className="text-sm text-muted-foreground hidden md:block drop-shadow-sm">
          Discover amazing boulder problems around the world
        </p>
      </div>

      {/* User Location Button */}
      {userLocation && (
        <div className="absolute top-4 right-4 z-30">
          <Button
            variant="secondary"
            size="sm"
            onClick={centerOnUser}
            className="h-8 w-8 p-0 shadow-lg"
            title="Center on my location"
          >
            <Navigation className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Boulder Count */}
      <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 md:p-4 z-30 shadow-lg">
        <div className="text-center">
          <div className="text-lg md:text-2xl font-bold text-primary">{mockBoulders.length}</div>
          <div className="text-xs text-muted-foreground">Boulders</div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 z-30 md:hidden shadow-lg">
        <p className="text-xs text-muted-foreground">Double tap to submit boulder</p>
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={[48.447, 2.5969]} // Default to Fontainebleau
        zoom={6}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        {/* Tile Layer with earthy outdoor style */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          className="map-tiles"
        />
        
        {/* User location handler */}
        <UserLocationHandler userLocation={userLocation} />
        
        {/* Map event handler */}
        <MapEventHandler onSubmitAtLocation={onSubmitAtLocation} />
        
        {/* User location marker */}
        {userLocation && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]}
            icon={new L.DivIcon({
              html: '<div class="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg animate-pulse"></div>',
              className: 'user-location-marker',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            })}
          />
        )}
        
        {/* Boulder markers */}
        {mockBoulders.map((boulder) => (
          <Marker
            key={boulder.id}
            position={[boulder.latitude, boulder.longitude]}
            icon={boulderIcon}
            eventHandlers={{
              click: () => handleBoulderClick(boulder)
            }}
          >
            <Popup 
              closeButton={true}
              className="boulder-popup"
              maxWidth={300}
            >
              <BoulderPopupContent 
                boulder={boulder} 
                onViewDetails={() => handleBoulderClick(boulder)}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Custom CSS for map styling */}
      <style jsx global>{`
        .leaflet-container {
          background: linear-gradient(135deg, #76827E20, #95A5A620);
        }
        
        .map-tiles {
          filter: sepia(20%) saturate(1.2) hue-rotate(10deg) brightness(0.95);
        }
        
        .custom-boulder-marker {
          background: none;
          border: none;
        }
        
        .boulder-popup .leaflet-popup-content-wrapper {
          background: hsl(var(--card));
          color: hsl(var(--card-foreground));
          border-radius: 8px;
          border: 1px solid hsl(var(--border));
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .boulder-popup .leaflet-popup-tip {
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border));
        }
        
        .leaflet-control-zoom {
          display: none;
        }
      `}</style>
    </div>
  );
}

function BoulderPopupContent({ 
  boulder, 
  onViewDetails 
}: { 
  boulder: Boulder; 
  onViewDetails: () => void;
}) {
  return (
    <div className="p-1">
      <div className="mb-3">
        <h3 className="font-outfit font-bold text-lg mb-1">{boulder.name}</h3>
        <p className="text-sm text-muted-foreground flex items-center space-x-1">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span>{boulder.location}</span>
        </p>
      </div>
      
      <div className="flex items-center space-x-2 mb-3">
        <Badge className="v-grade text-xs">
          {boulder.submitterGrade.vGrade}
        </Badge>
        <Badge className="font-grade text-xs">
          {boulder.submitterGrade.fontGrade}
        </Badge>
        <div className="flex items-center space-x-1">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-medium">{boulder.communityGrade.averageRating}</span>
          <span className="text-xs text-muted-foreground">({boulder.communityGrade.totalVotes})</span>
        </div>
      </div>
      
      {boulder.images[0] && (
        <div className="relative rounded-lg overflow-hidden mb-3">
          <img
            src={boulder.images[0]}
            alt={boulder.name}
            className="w-full h-24 object-cover"
          />
        </div>
      )}
      
      <p className="text-sm line-clamp-2 mb-3">{boulder.description}</p>
      
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div>
          <span className="font-medium">Rock:</span> {boulder.rock}
        </div>
        <div>
          <span className="font-medium">Height:</span> {boulder.height}m
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-3">
        {boulder.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
        {boulder.tags.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{boulder.tags.length - 3}
          </Badge>
        )}
      </div>
      
      <Button onClick={onViewDetails} className="w-full" size="sm">
        <Eye className="h-4 w-4 mr-2" />
        View Details
      </Button>
    </div>
  );
}