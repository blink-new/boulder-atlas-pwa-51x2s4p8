import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { X, Filter, BarChart3 } from 'lucide-react';
import { V_GRADES, FONT_GRADES, CLIMBING_STYLES, BOULDER_TAGS } from '../../types/boulder';
import { convertVToFont, convertFontToV } from '../../utils/gradeUtils';

interface FilterState {
  grades: string[];
  styles: string[];
  tags: string[];
  heightRange: [number, number];
  rockTypes: string[];
}

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  statistics: {
    totalBoulders: number;
    filteredResults: number;
    avgGrade: string;
  };
}

export default function FilterSidebar({ 
  isOpen, 
  onClose, 
  filters, 
  onFiltersChange,
  statistics 
}: FilterSidebarProps) {
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);

  const handleGradeToggle = (grade: string) => {
    const newGrades = tempFilters.grades.includes(grade)
      ? tempFilters.grades.filter(g => g !== grade)
      : [...tempFilters.grades, grade];
    setTempFilters({ ...tempFilters, grades: newGrades });
  };

  const handleStyleToggle = (style: string) => {
    const newStyles = tempFilters.styles.includes(style)
      ? tempFilters.styles.filter(s => s !== style)
      : [...tempFilters.styles, style];
    setTempFilters({ ...tempFilters, styles: newStyles });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = tempFilters.tags.includes(tag)
      ? tempFilters.tags.filter(t => t !== tag)
      : [...tempFilters.tags, tag];
    setTempFilters({ ...tempFilters, tags: newTags });
  };

  const handleHeightChange = (value: number[]) => {
    setTempFilters({ ...tempFilters, heightRange: [value[0], value[1]] });
  };

  const applyFilters = () => {
    onFiltersChange(tempFilters);
  };

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      grades: [],
      styles: [],
      tags: [],
      heightRange: [0, 20],
      rockTypes: []
    };
    setTempFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-background border-l border-border shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-background z-10 border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <h2 className="font-outfit font-semibold">Filters</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Statistics */}
          <Card className="climbing-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-sm">
                <BarChart3 className="h-4 w-4" />
                <span>Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Boulders</span>
                <Badge variant="secondary">{statistics.totalBoulders}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Filtered Results</span>
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  {statistics.filteredResults}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg Grade</span>
                <Badge className="v-grade text-xs">{statistics.avgGrade}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Grade Filter */}
          <Card className="climbing-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Grade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">V-Scale</Label>
                <div className="flex flex-wrap gap-1">
                  {V_GRADES.map((grade) => (
                    <Button
                      key={grade}
                      type="button"
                      variant={tempFilters.grades.includes(grade) ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleGradeToggle(grade)}
                    >
                      {grade}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Font Scale</Label>
                <div className="flex flex-wrap gap-1">
                  {FONT_GRADES.map((grade) => (
                    <Button
                      key={grade}
                      type="button"
                      variant={tempFilters.grades.includes(grade) ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleGradeToggle(grade)}
                    >
                      {grade}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Style Filter - Now as chips */}
          <Card className="climbing-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Climbing Style</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {CLIMBING_STYLES.map((style) => (
                  <Button
                    key={style}
                    type="button"
                    variant={tempFilters.styles.includes(style) ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => handleStyleToggle(style)}
                  >
                    {style}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tags Filter */}
          <Card className="climbing-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {BOULDER_TAGS.map((tag) => (
                  <Button
                    key={tag}
                    type="button"
                    variant={tempFilters.tags.includes(tag) ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Height Range Slider */}
          <Card className="climbing-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Height Range</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="px-2">
                <Slider
                  value={tempFilters.heightRange}
                  onValueChange={handleHeightChange}
                  max={20}
                  min={0}
                  step={0.5}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{tempFilters.heightRange[0]}m</span>
                <span>{tempFilters.heightRange[1]}m</span>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button 
              onClick={applyFilters} 
              className="w-full boulder-gradient text-white"
            >
              Apply Filters
            </Button>
            <Button 
              onClick={clearFilters} 
              variant="outline" 
              className="w-full"
            >
              Clear All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { FilterState };