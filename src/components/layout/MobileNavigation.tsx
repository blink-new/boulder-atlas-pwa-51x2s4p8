import React from 'react';
import { Button } from '../ui/button';
import { Map, Plus, User } from 'lucide-react';
import { useIsMobile } from '../../hooks/use-mobile';

interface MobileNavigationProps {
  currentView: 'map' | 'submit' | 'profile';
  onViewChange: (view: 'map' | 'submit' | 'profile') => void;
  isAuthenticated: boolean;
}

export default function MobileNavigation({ 
  currentView, 
  onViewChange, 
  isAuthenticated 
}: MobileNavigationProps) {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const navItems = [
    {
      id: 'map' as const,
      icon: Map,
      label: 'Explore',
      requiresAuth: false
    },
    {
      id: 'submit' as const,
      icon: Plus,
      label: 'Submit',
      requiresAuth: true
    },
    {
      id: 'profile' as const,
      icon: User,
      label: 'Profile',
      requiresAuth: false
    }
  ];

  return (
    <>
      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/50">
        <div className="container mx-auto px-2 py-2">
          <div className="flex justify-around items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              const isDisabled = item.requiresAuth && !isAuthenticated;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => !isDisabled && onViewChange(item.id)}
                  className={`flex-1 mx-1 flex flex-col items-center space-y-1 h-auto py-2 btn-touch ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isDisabled}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}