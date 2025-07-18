import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Boulder, ROCK_TYPES, CLIMBING_STYLES, BOULDER_TAGS } from '../../types/boulder';
import { Search, MapPin, Star, Filter, SlidersHorizontal, Navigation } from 'lucide-react';
import { useIsMobile } from '../../hooks/use-mobile';

interface SearchFilters {
  query: string;
  rockType: string;
  style: string[];
  tags: string[];
  gradeMin: string;
  gradeMax: string;
  location: string;
  sortBy: 'distance' | 'grade' | 'rating' | 'recent';
}

interface BoulderSearchProps {
  onBoulderSelect: (boulder: Boulder) => void;
  userLocation?: { lat: number; lng: number };
}

// Mock boulder data for search
const mockBoulders: Boulder[] = [
  {
    id: '1',
    name: 'La Marie-Rose',
    description: 'A classic traverse in Fontainebleau with beautiful crimps and technical moves.',
    latitude: 48.447,
    longitude: 2.5969,
    location: 'Fontainebleau, France',
    images: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&q=80'],
    submittedBy: 'climber123',
    submittedAt: new Date('2024-01-15'),
    submitterGrade: { vGrade: 'V4', fontGrade: '6b+' },
    communityGrade: { vGrade: 'V4', fontGrade: '6b+', averageRating: 4.2, totalVotes: 23 },
    rock: 'Sandstone',
    style: ['Overhang', 'Technical'],
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
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80'],
    submittedBy: 'yosemiteclimber',
    submittedAt: new Date('2024-01-10'),
    submitterGrade: { vGrade: 'V8', fontGrade: '7b+' },
    communityGrade: { vGrade: 'V8', fontGrade: '7b+', averageRating: 4.8, totalVotes: 156 },
    rock: 'Granite',
    style: ['Vertical', 'Powerful'],
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
    images: ['https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&q=80'],
    submittedBy: 'texasboulderer',
    submittedAt: new Date('2024-01-08'),
    submitterGrade: { vGrade: 'V6', fontGrade: '7a' },
    communityGrade: { vGrade: 'V6', fontGrade: '7a', averageRating: 4.1, totalVotes: 34 },
    rock: 'Granite',
    style: ['Vertical', 'Technical'],
    tags: ['Pocket', 'Technical', 'Desert'],
    height: 3.8,
    established: new Date('1992-03-15'),
    firstAscentist: 'Fred Nicole'
  }
];

const vGradeOrder = ['VB', 'V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17'];

export default function BoulderSearch({ onBoulderSelect, userLocation }: BoulderSearchProps) {
  const isMobile = useIsMobile();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    rockType: '',
    style: [],
    tags: [],
    gradeMin: '',
    gradeMax: '',
    location: '',
    sortBy: 'distance'
  });

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filteredBoulders = useMemo(() => {
    const results = mockBoulders.filter(boulder => {
      // Text search
      if (filters.query) {
        const searchText = filters.query.toLowerCase();
        const matchesName = boulder.name.toLowerCase().includes(searchText);
        const matchesLocation = boulder.location.toLowerCase().includes(searchText);
        const matchesDescription = boulder.description.toLowerCase().includes(searchText);
        const matchesTags = boulder.tags.some(tag => tag.toLowerCase().includes(searchText));
        
        if (!matchesName && !matchesLocation && !matchesDescription && !matchesTags) {
          return false;
        }
      }

      // Rock type filter
      if (filters.rockType && boulder.rock !== filters.rockType) {
        return false;
      }

      // Style filter
      if (filters.style.length > 0) {
        const hasMatchingStyle = filters.style.some(style => boulder.style.includes(style));
        if (!hasMatchingStyle) return false;
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => boulder.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }

      // Grade range filter
      if (filters.gradeMin || filters.gradeMax) {
        const boulderGradeIndex = vGradeOrder.indexOf(boulder.submitterGrade.vGrade || '');
        const minIndex = filters.gradeMin ? vGradeOrder.indexOf(filters.gradeMin) : 0;
        const maxIndex = filters.gradeMax ? vGradeOrder.indexOf(filters.gradeMax) : vGradeOrder.length - 1;
        
        if (boulderGradeIndex < minIndex || boulderGradeIndex > maxIndex) {
          return false;
        }
      }

      // Location filter
      if (filters.location && !boulder.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }

      return true;
    });

    // Sort results
    results.sort((a, b) => {
      switch (filters.sortBy) {
        case 'distance': {
          if (userLocation) {
            const distA = calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
            const distB = calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
            return distA - distB;
          }
          return 0;
        }
          
        case 'grade': {
          const gradeA = vGradeOrder.indexOf(a.submitterGrade.vGrade || '');
          const gradeB = vGradeOrder.indexOf(b.submitterGrade.vGrade || '');
          return gradeA - gradeB;
        }
          
        case 'rating':
          return b.communityGrade.averageRating - a.communityGrade.averageRating;
          
        case 'recent':
          return b.submittedAt.getTime() - a.submittedAt.getTime();
          
        default:
          return 0;
      }
    });

    return results;
  }, [filters, userLocation]);

  const toggleArrayFilter = (key: 'style' | 'tags', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      rockType: '',
      style: [],
      tags: [],
      gradeMin: '',
      gradeMax: '',
      location: '',
      sortBy: 'distance'
    });
  };

  const hasActiveFilters = filters.rockType || filters.style.length > 0 || filters.tags.length > 0 || 
                          filters.gradeMin || filters.gradeMax || filters.location;

  return (
    <div className={`${isMobile ? 'pb-20' : ''}`}>
      {/* Mobile Header */}
      {isMobile && (
        <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border/50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-outfit font-bold">Search Boulders</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                  !
                </Badge>
              )}
            </Button>
          </div>
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search boulders, locations, tags..."
              value={filters.query}
              onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
              className="pl-10"
            />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        {/* Desktop Header */}
        {!isMobile && (
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-outfit font-bold text-foreground mb-2">
              Search Boulders
            </h1>
            <p className="text-muted-foreground">
              Find your next climbing adventure
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${isMobile && !showFilters ? 'hidden' : ''}`}>
            <Card className="climbing-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Filter className="h-5 w-5" />
                    <span>Filters</span>
                  </CardTitle>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Desktop Search */}
                {!isMobile && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search boulders..."
                        value={filters.query}
                        onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                )}

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <Input
                    placeholder="e.g., Fontainebleau"
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium mb-2">Sort By</label>
                  <Select value={filters.sortBy} onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="distance">
                        <div className="flex items-center space-x-2">
                          <Navigation className="h-4 w-4" />
                          <span>Nearest First</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="grade">Grade (Easy to Hard)</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="recent">Recently Added</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Rock Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">Rock Type</label>
                  <Select value={filters.rockType} onValueChange={(value) => setFilters(prev => ({ ...prev, rockType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any rock type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any rock type</SelectItem>
                      {ROCK_TYPES.map(rock => (
                        <SelectItem key={rock} value={rock}>{rock}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Grade Range */}
                <div>
                  <label className="block text-sm font-medium mb-2">Grade Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={filters.gradeMin} onValueChange={(value) => setFilters(prev => ({ ...prev, gradeMin: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Min" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No min</SelectItem>
                        {vGradeOrder.map(grade => (
                          <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filters.gradeMax} onValueChange={(value) => setFilters(prev => ({ ...prev, gradeMax: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Max" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No max</SelectItem>
                        {vGradeOrder.map(grade => (
                          <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Climbing Style */}
                <div>
                  <label className="block text-sm font-medium mb-2">Climbing Style</label>
                  <div className="flex flex-wrap gap-2">
                    {CLIMBING_STYLES.map(style => (
                      <Button
                        key={style}
                        variant={filters.style.includes(style) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleArrayFilter('style', style)}
                        className="text-xs"
                      >
                        {style}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {BOULDER_TAGS.slice(0, 8).map(tag => (
                      <Button
                        key={tag}
                        variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleArrayFilter('tags', tag)}
                        className="text-xs"
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {filteredBoulders.length} boulder{filteredBoulders.length !== 1 ? 's' : ''} found
                </h2>
                {filters.query && (
                  <p className="text-sm text-muted-foreground">
                    Results for "{filters.query}"
                  </p>
                )}
              </div>
              
              {isMobile && showFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  Done
                </Button>
              )}
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredBoulders.map(boulder => (
                <BoulderSearchCard
                  key={boulder.id}
                  boulder={boulder}
                  userLocation={userLocation}
                  onClick={() => onBoulderSelect(boulder)}
                />
              ))}
            </div>

            {filteredBoulders.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No boulders found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BoulderSearchCard({ 
  boulder, 
  userLocation, 
  onClick 
}: { 
  boulder: Boulder; 
  userLocation?: { lat: number; lng: number };
  onClick: () => void;
}) {
  const distance = userLocation 
    ? ((lat1: number, lng1: number, lat2: number, lng2: number) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      })(userLocation.lat, userLocation.lng, boulder.latitude, boulder.longitude)
    : null;

  return (
    <Card className="climbing-card cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <div className="relative">
        <img
          src={boulder.images[0]}
          alt={boulder.name}
          className="w-full h-32 object-cover rounded-t-lg"
        />
        <div className="absolute top-2 right-2 flex space-x-1">
          <Badge className="v-grade text-xs">{boulder.submitterGrade.vGrade}</Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-sm truncate flex-1">{boulder.name}</h3>
          <div className="flex items-center space-x-1 ml-2">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs">{boulder.communityGrade.averageRating}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 mb-2 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{boulder.location}</span>
          {distance && (
            <>
              <span>•</span>
              <span>{distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}</span>
            </>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {boulder.description}
        </p>
        
        <div className="flex flex-wrap gap-1">
          {boulder.tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {boulder.tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{boulder.tags.length - 2}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}