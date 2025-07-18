import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Mountain, Plus, Map, User, Filter, Search, LogIn } from 'lucide-react';
import { User as UserType } from '../../types/auth';

interface HeaderProps {
  currentView: 'map' | 'submit' | 'profile';
  onViewChange: (view: 'map' | 'submit' | 'profile') => void;
  onLoginClick: () => void;
  onFilterClick: () => void;
  isAuthenticated: boolean;
  user: UserType | null;
  isMobile: boolean;
}

export default function Header({ 
  currentView, 
  onViewChange, 
  onLoginClick, 
  onFilterClick,
  isAuthenticated, 
  user,
  isMobile
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleViewChange = (view: 'map' | 'submit' | 'profile') => {
    onViewChange(view);
  };

  return (
    <div className={`${isMobile ? '' : 'sticky top-0'} z-50 bg-background/95 backdrop-blur-md border-b border-border/50`}>
      {/* Main Header */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo - Left Side */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => onViewChange('map')}
          >
            <div className="p-2 rounded-xl boulder-gradient">
              <Mountain className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-outfit font-bold text-foreground">
                Boulder Atlas
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Discover. Climb. Share.
              </p>
            </div>
          </div>

          {/* Right Side - Buttons */}
          <div className="flex items-center space-x-2">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2 mr-4">
              <Button
                variant={currentView === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('map')}
                className="space-x-2"
              >
                <Map className="h-4 w-4" />
                <span>Explore</span>
              </Button>
              
              <Button
                variant={currentView === 'submit' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => isAuthenticated ? onViewChange('submit') : onLoginClick()}
                className="space-x-2"
                disabled={!isAuthenticated}
              >
                <Plus className="h-4 w-4" />
                <span>Submit</span>
              </Button>
            </nav>

            {/* Filter Button - Only show on map view */}
            {currentView === 'map' && (
              <Button
                variant="outline"
                size="sm"
                onClick={onFilterClick}
                className="space-x-2"
              >
                <Filter className="h-4 w-4" />
                {!isMobile && <span>Filter</span>}
              </Button>
            )}

            {/* Profile/Login Button */}
            {isAuthenticated && user ? (
              <Button
                variant={currentView === 'profile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('profile')}
                className="space-x-2"
              >
                <User className="h-4 w-4" />
                {!isMobile && <span>Profile</span>}
              </Button>
            ) : (
              <Button onClick={onLoginClick} size="sm" className="space-x-2">
                <LogIn className="h-4 w-4" />
                {!isMobile && <span>Sign In</span>}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}