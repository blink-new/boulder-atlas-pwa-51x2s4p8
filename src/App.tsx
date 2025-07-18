import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/layout/Header';
import MobileNavigation from './components/layout/MobileNavigation';
import OpenStreetMap from './components/map/OpenStreetMap';
import BoulderSubmissionForm from './components/forms/BoulderSubmissionForm';
import TopoViewer from './components/ar/TopoViewer';
import UnifiedGradingRating from './components/grading/UnifiedGradingRating';
import LoginModal from './components/auth/LoginModal';
import FilterSidebar, { FilterState } from './components/filters/FilterSidebar';
import { Boulder, BoulderSubmission } from './types/boulder';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { useIsMobile } from './hooks/use-mobile';
import { 
  User, Mountain, MapPin, Calendar, Star, Camera, Eye, Settings, 
  Shield, Globe, Moon, Sun, CreditCard, FileText, Trash2,
  Activity, BarChart3, ChevronLeft, ChevronRight, ArrowLeft
} from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './components/ui/carousel';

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
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80'
    ],
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
    images: [
      'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&q=80'
    ],
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

type ViewType = 'map' | 'submit' | 'profile';

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<ViewType>('map');
  const [showTopoViewer, setShowTopoViewer] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [submitCoordinates, setSubmitCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    grades: [],
    styles: [],
    tags: [],
    heightRange: [0, 20],
    rockTypes: []
  });

  // Mock statistics
  const statistics = {
    totalBoulders: 156,
    filteredResults: 23,
    avgGrade: 'V4'
  };

  // Get user location for search sorting
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

  const handleBoulderSubmission = (submission: BoulderSubmission) => {
    console.log('Boulder submitted:', submission);
    setCurrentView('map');
    setSubmitCoordinates(null);
    navigate('/');
  };

  const handleBoulderSelect = (boulder: Boulder) => {
    navigate(`/boulder/${boulder.id}`);
  };

  const handleSubmitAtLocation = (lat: number, lng: number) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setSubmitCoordinates({ lat, lng });
    setCurrentView('submit');
    navigate('/submit');
  };

  const handleViewChange = (view: ViewType) => {
    if ((view === 'submit') && !isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setCurrentView(view);
    setShowFilterDrawer(false);
    
    if (view === 'map') navigate('/');
    else if (view === 'submit') navigate('/submit');
    else if (view === 'profile') navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-background nature-texture">
      {/* Header - not sticky on mobile */}
      <Header 
        currentView={currentView} 
        onViewChange={handleViewChange}
        onLoginClick={() => setShowLoginModal(true)}
        onFilterClick={() => setShowFilterDrawer(!showFilterDrawer)}
        isAuthenticated={isAuthenticated}
        user={user}
        isMobile={isMobile}
      />
      
      <main className="relative">
        <Routes>
          <Route 
            path="/" 
            element={
              <MapView 
                onBoulderSelect={handleBoulderSelect}
                onSubmitAtLocation={handleSubmitAtLocation}
                showFilterDrawer={showFilterDrawer}
                setShowFilterDrawer={setShowFilterDrawer}
                filters={filters}
                setFilters={setFilters}
                statistics={statistics}
                isMobile={isMobile}
              />
            } 
          />
          <Route 
            path="/submit" 
            element={
              <BoulderSubmissionForm
                onSubmit={handleBoulderSubmission}
                onCancel={() => navigate('/')}
                initialCoordinates={submitCoordinates}
              />
            } 
          />
          <Route path="/profile" element={<ProfileView />} />
          <Route 
            path="/boulder/:id" 
            element={
              <BoulderDetailsRoute 
                onViewTopo={() => setShowTopoViewer(true)}
                isMobile={isMobile}
              />
            } 
          />
        </Routes>
      </main>
      
      <MobileNavigation 
        currentView={currentView}
        onViewChange={handleViewChange}
        isAuthenticated={isAuthenticated}
      />
      
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
      
      {/* Topo Viewer */}
      {showTopoViewer && (
        <TopoViewer
          topoImage={'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&q=80'}
          boulderName={'Sample Boulder'}
          grade={'V4'}
          onClose={() => setShowTopoViewer(false)}
        />
      )}
      
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'bg-card text-card-foreground border border-border',
          duration: 4000,
        }}
      />
    </div>
  );
}

function MapView({ 
  onBoulderSelect, 
  onSubmitAtLocation, 
  showFilterDrawer, 
  setShowFilterDrawer, 
  filters, 
  setFilters, 
  statistics, 
  isMobile 
}: {
  onBoulderSelect: (boulder: Boulder) => void;
  onSubmitAtLocation: (lat: number, lng: number) => void;
  showFilterDrawer: boolean;
  setShowFilterDrawer: (show: boolean) => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  statistics: any;
  isMobile: boolean;
}) {
  return (
    <div className={`relative ${isMobile ? 'h-[calc(100vh-128px)]' : 'h-[calc(100vh-80px)] md:h-[calc(100vh-120px)]'} flex`}>
      <div className="flex-1">
        <OpenStreetMap 
          onBoulderSelect={onBoulderSelect}
          onSubmitAtLocation={onSubmitAtLocation}
        />
      </div>
      
      {/* Filter Drawer */}
      <FilterSidebar
        isOpen={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        filters={filters}
        onFiltersChange={setFilters}
        statistics={statistics}
      />
    </div>
  );
}

function BoulderDetailsRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showTopoViewer, setShowTopoViewer] = useState(false);

  // Find boulder by ID
  const boulder = mockBoulders.find(b => b.id === id);

  if (!boulder) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Boulder not found</h1>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Map
          </Button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className={`${isMobile ? 'min-h-[calc(100vh-64px)] pb-20' : 'min-h-screen'}`}>
      {/* Header for mobile and desktop - same Back button design */}
      <div className={`sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50 p-4`}>
        <div className="container mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </Button>
          <h1 className="font-outfit font-bold text-lg truncate flex-1 text-center">{boulder.name}</h1>
          <div className="w-16" />
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <BoulderDetailsContent
          boulder={boulder}
          onViewTopo={() => setShowTopoViewer(true)}
          isMobile={isMobile}
        />
      </div>

      {/* Topo Viewer */}
      {showTopoViewer && boulder.topoImage && (
        <TopoViewer
          topoImage={boulder.topoImage || boulder.images[0]}
          boulderName={boulder.name}
          grade={boulder.submitterGrade.vGrade}
          onClose={() => setShowTopoViewer(false)}
        />
      )}
    </div>
  );
}

function BoulderDetailsContent({
  boulder,
  onViewTopo,
  isMobile
}: {
  boulder: Boulder;
  onViewTopo: () => void;
  isMobile: boolean;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullscreenImage, setShowFullscreenImage] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % boulder.images.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + boulder.images.length) % boulder.images.length);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>{boulder.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>Est. {boulder.established?.getFullYear() || 'Unknown'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{boulder.communityGrade.averageRating} ({boulder.communityGrade.totalVotes})</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge className="v-grade">{boulder.submitterGrade.vGrade}</Badge>
          <Badge className="font-grade">{boulder.submitterGrade.fontGrade}</Badge>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative">
        {isMobile ? (
          // Mobile: Single image with navigation
          <div className="relative">
            <img
              src={boulder.images[currentImageIndex]}
              alt={`${boulder.name} ${currentImageIndex + 1}`}
              className="w-full h-64 object-cover rounded-lg cursor-pointer"
              onClick={() => setShowFullscreenImage(true)}
            />
            
            {boulder.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 backdrop-blur-sm text-white hover:bg-black/40"
                  onClick={previousImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 backdrop-blur-sm text-white hover:bg-black/40"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                {/* Image indicator */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {boulder.images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          // Desktop: Carousel
          <Carousel className="w-full">
            <CarouselContent>
              {boulder.images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`${boulder.name} ${index + 1}`}
                      className="w-full h-64 md:h-80 object-cover cursor-pointer"
                      onClick={() => {
                        setCurrentImageIndex(index);
                        setShowFullscreenImage(true);
                      }}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {boulder.images.length > 1 && (
              <>
                <CarouselPrevious />
                <CarouselNext />
              </>
            )}
          </Carousel>
        )}
      </div>
      
      {/* Fullscreen Image Modal */}
      {showFullscreenImage && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            onClick={() => setShowFullscreenImage(false)}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          
          <img
            src={boulder.images[currentImageIndex]}
            alt={`${boulder.name} fullscreen`}
            className="max-w-full max-h-full object-contain"
          />
          
          {boulder.images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                onClick={previousImage}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                onClick={nextImage}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>
      )}
      
      {/* Description */}
      <div>
        <h3 className="font-outfit font-semibold mb-2">Description</h3>
        <p className="text-muted-foreground leading-relaxed">{boulder.description}</p>
      </div>
      
      {/* Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Rock Type</p>
          <p className="font-medium">{boulder.rock}</p>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Height</p>
          <p className="font-medium">{boulder.height}m</p>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Style</p>
          <p className="font-medium text-xs">{boulder.style.join(', ')}</p>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">First Ascent</p>
          <p className="font-medium text-xs">{boulder.firstAscentist}</p>
        </div>
      </div>
      
      {/* Community Grade Section */}
      <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
        <h3 className="font-outfit font-semibold mb-2">Community Grade</h3>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <Badge className="v-grade">{boulder.communityGrade.vGrade}</Badge>
            <Badge className="font-grade">{boulder.communityGrade.fontGrade}</Badge>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{boulder.communityGrade.averageRating}</span>
            <span className="text-muted-foreground">({boulder.communityGrade.totalVotes} votes)</span>
          </div>
        </div>
      </div>
      
      {/* Tags */}
      <div>
        <h3 className="font-outfit font-semibold mb-2">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {boulder.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t">
        <Button onClick={onViewTopo} className="flex-1">
          <Eye className="h-4 w-4 mr-2" />
          View Topo
        </Button>
      </div>

      {/* Unified Grading Rating Component */}
      <UnifiedGradingRating
        boulderId={boulder.id}
        submitterGrade={boulder.submitterGrade}
        communityGrade={boulder.communityGrade}
        onVoteSubmit={(vote) => {
          console.log('Grade vote submitted:', vote);
        }}
      />
    </div>
  );
}

function ProfileView() {
  const { user, isAuthenticated, updateUser, logout } = useAuth();
  const isMobile = useIsMobile();
  const [showSettings, setShowSettings] = useState(true);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'overview' | 'account' | 'privacy' | 'payment' | 'terms'>('overview');

  if (!isAuthenticated || !user) {
    return (
      <div className={`container mx-auto px-4 py-8 ${isMobile ? 'pb-20' : ''}`}>
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-outfit font-semibold mb-2">Sign in to view your profile</h3>
          <p className="text-muted-foreground">
            Track your sends, submissions, and climbing progress
          </p>
        </div>
      </div>
    );
  }

  // Mobile profile layout
  if (isMobile) {
    return (
      <div className="pb-20">
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-outfit font-bold">Profile</h1>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Profile Card */}
          <Card className="climbing-card">
            <CardContent className="p-4">
              <ProfileContent user={user} />
            </CardContent>
          </Card>

          {/* Settings Section */}
          <SettingsSection
            user={user}
            activeTab={activeSettingsTab}
            setActiveTab={setActiveSettingsTab}
            onUpdateUser={updateUser}
            onLogout={logout}
            isMobile={isMobile}
          />
        </div>
      </div>
    );
  }

  // Desktop profile layout
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-outfit font-bold text-foreground">
            Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your climbing profile and preferences
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <SettingsNavigation
              activeTab={activeSettingsTab}
              setActiveTab={setActiveSettingsTab}
              onLogout={logout}
            />
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3 desktop-settings-height">
            {activeSettingsTab === 'overview' ? (
              <div className="space-y-6">
                <Card className="climbing-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Climber Profile</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProfileContent user={user} />
                  </CardContent>
                </Card>

                <Card className="climbing-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5" />
                      <span>Recent Activity</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RecentActivityContent />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <SettingsContent
                user={user}
                activeTab={activeSettingsTab}
                onUpdateUser={updateUser}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsNavigation({ 
  activeTab, 
  setActiveTab, 
  onLogout 
}: { 
  activeTab: string;
  setActiveTab: (tab: 'overview' | 'account' | 'privacy' | 'payment' | 'terms') => void;
  onLogout: () => void;
}) {
  const settingsTabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'account', label: 'Account', icon: Settings },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'terms', label: 'Terms', icon: FileText }
  ];

  return (
    <Card className="climbing-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {settingsTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id as any)}
              className="w-full justify-start"
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </Button>
          );
        })}
        
        <div className="pt-4 border-t">
          <Button 
            variant="destructive" 
            size="sm"
            onClick={onLogout}
            className="w-full justify-start"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SettingsContent({ 
  user, 
  activeTab, 
  onUpdateUser 
}: { 
  user: any; 
  activeTab: string;
  onUpdateUser: (updates: any) => void;
}) {
  const handleLanguageChange = (language: 'en' | 'fr' | 'es' | 'de') => {
    onUpdateUser({
      ...user,
      preferences: { ...user.preferences, language }
    });
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    onUpdateUser({
      ...user,
      preferences: { ...user.preferences, theme }
    });
  };

  return (
    <Card className="climbing-card">
      <CardHeader>
        <CardTitle>
          {activeTab === 'account' && 'Account Settings'}
          {activeTab === 'privacy' && 'Privacy Settings'}
          {activeTab === 'payment' && 'Payment Settings'}
          {activeTab === 'terms' && 'Terms & Conditions'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeTab === 'account' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <select 
                className="w-full p-2 border rounded-lg bg-background"
                value={user.preferences.language}
                onChange={(e) => handleLanguageChange(e.target.value as any)}
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant={user.preferences.theme === 'light' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => handleThemeChange('light')}
                  className="flex items-center justify-center"
                >
                  <Sun className="h-4 w-4" />
                </Button>
                <Button 
                  variant={user.preferences.theme === 'dark' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => handleThemeChange('dark')}
                  className="flex items-center justify-center"
                >
                  <Moon className="h-4 w-4" />
                </Button>
                <Button 
                  variant={user.preferences.theme === 'system' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => handleThemeChange('system')}
                  className="flex items-center justify-center"
                >
                  <Globe className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Default Grade System</label>
              <select 
                className="w-full p-2 border rounded-lg bg-background"
                value={user.preferences.defaultGradeSystem}
                onChange={(e) => onUpdateUser({
                  ...user,
                  preferences: { ...user.preferences, defaultGradeSystem: e.target.value }
                })}
              >
                <option value="v-scale">V-Scale (American)</option>
                <option value="font">Font Scale (French)</option>
              </select>
            </div>

            <Button variant="outline" className="w-full justify-start">
              <Shield className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Manage your privacy preferences and data settings
            </p>
            <Button variant="outline" className="w-full justify-start">
              <Globe className="h-4 w-4 mr-2" />
              Privacy Settings
            </Button>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Manage your payment methods and billing information
            </p>
            <Button variant="outline" className="w-full justify-start">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment Settings
            </Button>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              View our terms of service and privacy policy
            </p>
            <Button variant="outline" className="w-full justify-start text-xs">
              <FileText className="h-4 w-4 mr-2" />
              Terms & Conditions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SettingsSection({ 
  user, 
  activeTab, 
  setActiveTab, 
  onUpdateUser, 
  onLogout, 
  isMobile 
}: { 
  user: any; 
  activeTab: string; 
  setActiveTab: (tab: 'overview' | 'account' | 'privacy' | 'payment' | 'terms') => void; 
  onUpdateUser: (updates: any) => void; 
  onLogout: () => void; 
  isMobile: boolean; 
}) {
  return (
    <div className="space-y-4">
      <SettingsNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
      />
      
      <SettingsContent
        user={user}
        activeTab={activeTab}
        onUpdateUser={onUpdateUser}
      />
    </div>
  );
}

function ProfileContent({ user }: { user: any }) {
  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-boulder-sunset to-boulder-forest flex items-center justify-center">
          <User className="h-8 w-8 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg md:text-xl font-outfit font-bold">{user.displayName}</h2>
          <p className="text-muted-foreground">Climbing since {user.createdAt && user.createdAt.getFullYear ? user.createdAt.getFullYear() : 'Unknown'}</p>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <span className="text-sm"><strong>{user.stats.bouldersSubmitted}</strong> boulders submitted</span>
            <span className="text-sm"><strong>{user.stats.gradesVoted}</strong> grades voted</span>
            {user.stats.hardestSend && (
              <span className="text-sm"><strong>{user.stats.hardestSend}</strong> hardest send</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <Mountain className="h-6 w-6 mx-auto mb-2 text-primary" />
          <p className="font-medium">Favorite Area</p>
          <p className="text-sm text-muted-foreground">{user.stats.favoriteArea || 'Not set'}</p>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <Star className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
          <p className="font-medium">Avg. Rating</p>
          <p className="text-sm text-muted-foreground">{user.stats.averageRating} stars</p>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <Badge className="v-grade mx-auto mb-2">{user.stats.hardestSend || 'V0'}</Badge>
          <p className="font-medium">Hardest Send</p>
          <p className="text-sm text-muted-foreground">Personal best</p>
        </div>
      </div>
    </div>
  );
}

function RecentActivityContent() {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
        <Star className="h-5 w-5 text-yellow-500" />
        <div className="flex-1">
          <p className="text-sm font-medium">Rated "La Marie-Rose"</p>
          <p className="text-xs text-muted-foreground">2 days ago</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
        <Camera className="h-5 w-5 text-primary" />
        <div className="flex-1">
          <p className="text-sm font-medium">Submitted "Desert Fortress"</p>
          <p className="text-xs text-muted-foreground">1 week ago</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
        <BarChart3 className="h-5 w-5 text-green-500" />
        <div className="flex-1">
          <p className="text-sm font-medium">Voted on community grades</p>
          <p className="text-xs text-muted-foreground">1 week ago</p>
        </div>
      </div>
    </div>
  );
}

export default App;