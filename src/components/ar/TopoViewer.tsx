import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Camera, Maximize2, RotateCcw, ZoomIn, ZoomOut, Eye, Hand } from 'lucide-react';

interface TopoViewerProps {
  topoImage: string;
  boulderName: string;
  grade?: string;
  onClose?: () => void;
}

export default function TopoViewer({ topoImage, boulderName, grade, onClose }: TopoViewerProps) {
  const [isARMode, setIsARMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showHolds, setShowHolds] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mock holds data - in a real app, this would come from the topo data
  const holds = [
    { x: 30, y: 70, type: 'start', difficulty: 'easy' },
    { x: 45, y: 55, type: 'crimp', difficulty: 'medium' },
    { x: 55, y: 40, type: 'sloper', difficulty: 'hard' },
    { x: 70, y: 25, type: 'finish', difficulty: 'easy' },
  ];

  const startARMode = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsARMode(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      // Fallback to demo mode
      setIsARMode(true);
    }
  };

  const stopARMode = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsARMode(false);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setZoom(prev => {
      const newZoom = direction === 'in' ? prev * 1.2 : prev / 1.2;
      return Math.max(0.5, Math.min(3, newZoom));
    });
  };

  const resetView = () => {
    setZoom(1);
    setRotation(0);
  };

  const displayImage = topoImage || 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&q=80';

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-full max-h-[90vh] climbing-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Topo Viewer - {boulderName}</span>
              </CardTitle>
              {grade && (
                <Badge className="v-grade mt-1">{grade}</Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={isARMode ? 'default' : 'outline'}
                size="sm"
                onClick={isARMode ? stopARMode : startARMode}
              >
                <Camera className="h-4 w-4 mr-2" />
                {isARMode ? 'Exit AR' : 'AR Mode'}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 relative overflow-hidden">
          {isARMode ? (
            // AR Mode
            <div className="relative h-full bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* AR Overlay */}
              <div className="absolute inset-0">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full"
                />
                
                {/* AR Controls */}
                <div className="absolute top-4 left-4 space-y-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowHolds(!showHolds)}
                  >
                    <Hand className="h-4 w-4 mr-2" />
                    {showHolds ? 'Hide' : 'Show'} Holds
                  </Button>
                </div>
                
                {/* Mock AR holds overlay */}
                {showHolds && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="relative w-full h-full">
                      {holds.map((hold, index) => (
                        <div
                          key={index}
                          className={`absolute w-6 h-6 rounded-full border-2 animate-pulse ${
                            hold.type === 'start' ? 'bg-green-400 border-green-600' :
                            hold.type === 'finish' ? 'bg-red-400 border-red-600' :
                            'bg-blue-400 border-blue-600'
                          }`}
                          style={{
                            left: `${hold.x}%`,
                            top: `${hold.y}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-white bg-black/70 px-1 rounded">
                            {hold.type}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* AR Instructions */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
                  <div className="bg-black/70 text-white px-4 py-2 rounded-lg">
                    <p className="text-sm">Point your camera at the boulder to see the route overlay</p>
                    <p className="text-xs text-gray-300 mt-1">Tap holds for detailed information</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Regular Topo View
            <div className="relative h-full bg-muted rounded-lg overflow-hidden">
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.3s ease'
                }}
              >
                <img
                  src={displayImage}
                  alt={`${boulderName} topo`}
                  className="max-w-full max-h-full object-contain"
                />
                
                {/* Hold overlays */}
                {showHolds && (
                  <div className="absolute inset-0 pointer-events-none">
                    {holds.map((hold, index) => (
                      <div
                        key={index}
                        className={`absolute w-4 h-4 rounded-full border-2 ${
                          hold.type === 'start' ? 'bg-green-400/70 border-green-600' :
                          hold.type === 'finish' ? 'bg-red-400/70 border-red-600' :
                          'bg-blue-400/70 border-blue-600'
                        }`}
                        style={{
                          left: `${hold.x}%`,
                          top: `${hold.y}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium bg-black/70 text-white px-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Controls */}
              <div className="absolute top-4 left-4 flex flex-col space-y-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleZoom('in')}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleZoom('out')}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setRotation(prev => prev + 90)}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={resetView}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="absolute top-4 right-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowHolds(!showHolds)}
                >
                  <Hand className="h-4 w-4 mr-2" />
                  {showHolds ? 'Hide' : 'Show'} Route
                </Button>
              </div>
            </div>
          )}
          
          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-black/70 text-white p-3 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Hold Types</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-400 border border-green-600"></div>
                <span>Start Hold</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-400 border border-blue-600"></div>
                <span>Route Hold</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400 border border-red-600"></div>
                <span>Finish Hold</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}