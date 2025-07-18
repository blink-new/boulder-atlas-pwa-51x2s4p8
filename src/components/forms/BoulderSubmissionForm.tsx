import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { BoulderSubmission, V_GRADES, FONT_GRADES, ROCK_TYPES, CLIMBING_STYLES, BOULDER_TAGS } from '../../types/boulder';
import { getCorrespondingFontGrade, getCorrespondingVGrade } from '../../utils/gradeUtils';
import { MapPin, Camera, Upload, Mountain, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface BoulderSubmissionFormProps {
  onSubmit: (submission: BoulderSubmission) => void;
  onCancel?: () => void;
  initialCoordinates?: { lat: number; lng: number } | null;
}

export default function BoulderSubmissionForm({ onSubmit, onCancel, initialCoordinates }: BoulderSubmissionFormProps) {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [topoImage, setTopoImage] = useState<File | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState('details');
  const [vGrade, setVGrade] = useState<string>('');
  const [fontGrade, setFontGrade] = useState<string>('');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<BoulderSubmission>({
    defaultValues: {
      latitude: initialCoordinates?.lat || undefined,
      longitude: initialCoordinates?.lng || undefined
    }
  });

  useEffect(() => {
    if (initialCoordinates) {
      setValue('latitude', initialCoordinates.lat);
      setValue('longitude', initialCoordinates.lng);
    }
  }, [initialCoordinates, setValue]);

  const watchedValues = watch();

  const handleVGradeChange = (grade: string) => {
    setVGrade(grade);
    const correspondingFont = getCorrespondingFontGrade(grade);
    setFontGrade(correspondingFont);
    setValue('submitterGrade.vGrade', grade);
    setValue('submitterGrade.fontGrade', correspondingFont);
  };

  const handleFontGradeChange = (grade: string) => {
    setFontGrade(grade);
    const correspondingV = getCorrespondingVGrade(grade);
    setVGrade(correspondingV);
    setValue('submitterGrade.vGrade', correspondingV);
    setValue('submitterGrade.fontGrade', grade);
  };

  const handleImageUpload = (files: FileList | null, type: 'regular' | 'topo') => {
    if (!files) return;
    
    if (type === 'regular') {
      setSelectedImages(Array.from(files));
    } else {
      setTopoImage(files[0]);
    }
  };

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    setValue('tags', newTags);
  };

  const toggleStyle = (style: string) => {
    const newStyles = selectedStyles.includes(style)
      ? selectedStyles.filter(s => s !== style)
      : [...selectedStyles, style];
    setSelectedStyles(newStyles);
    setValue('style', newStyles);
  };

  const onFormSubmit = (data: any) => {
    const submission: BoulderSubmission = {
      ...data,
      images: selectedImages,
      topoImage: topoImage || undefined,
      tags: selectedTags,
      style: selectedStyles,
      height: parseFloat(data.height),
    };
    onSubmit(submission);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-outfit font-bold text-foreground mb-2">
          Submit a Boulder
        </h1>
        <p className="text-muted-foreground">
          Share your discovery with the climbing community
        </p>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="grades">Grades</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <Card className="climbing-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mountain className="h-5 w-5" />
                  <span>Boulder Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Boulder Name *</Label>
                    <Input
                      id="name"
                      {...register('name', { required: 'Boulder name is required' })}
                      placeholder="e.g., Midnight Lightning"
                      className="mt-1"
                    />
                    {errors.name && (
                      <p className="text-destructive text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="height">Height (meters) *</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      {...register('height', { required: 'Height is required' })}
                      placeholder="e.g., 4.5"
                      className="mt-1"
                    />
                    {errors.height && (
                      <p className="text-destructive text-sm mt-1">{errors.height.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    {...register('description', { required: 'Description is required' })}
                    placeholder="Describe the boulder, its moves, and what makes it special..."
                    className="mt-1 min-h-[100px]"
                  />
                  {errors.description && (
                    <p className="text-destructive text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rock">Rock Type</Label>
                    <Select onValueChange={(value) => setValue('rock', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select rock type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROCK_TYPES.map((rock) => (
                          <SelectItem key={rock} value={rock}>{rock}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="firstAscentist">First Ascentist</Label>
                    <Input
                      id="firstAscentist"
                      {...register('firstAscentist')}
                      placeholder="Who first climbed this boulder?"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Climbing Style</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {CLIMBING_STYLES.map((style) => (
                      <Button
                        key={style}
                        type="button"
                        variant={selectedStyles.includes(style) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleStyle(style)}
                      >
                        {style}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Tags</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {BOULDER_TAGS.map((tag) => (
                      <Button
                        key={tag}
                        type="button"
                        variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location" className="space-y-6">
            <Card className="climbing-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Location Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="location">Location Name *</Label>
                  <Input
                    id="location"
                    {...register('location', { required: 'Location is required' })}
                    placeholder="e.g., Fontainebleau, France"
                    className="mt-1"
                  />
                  {errors.location && (
                    <p className="text-destructive text-sm mt-1">{errors.location.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">Latitude *</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      {...register('latitude', { required: 'Latitude is required' })}
                      placeholder="e.g., 48.447"
                      className="mt-1"
                    />
                    {errors.latitude && (
                      <p className="text-destructive text-sm mt-1">{errors.latitude.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="longitude">Longitude *</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      {...register('longitude', { required: 'Longitude is required' })}
                      placeholder="e.g., 2.5969"
                      className="mt-1"
                    />
                    {errors.longitude && (
                      <p className="text-destructive text-sm mt-1">{errors.longitude.message}</p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Tip:</strong> Use your phone's GPS or a mapping app to get accurate coordinates. 
                    The more precise the location, the easier it will be for others to find!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <Card className="climbing-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="h-5 w-5" />
                  <span>Photos & Topo</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Boulder Photos</Label>
                  <div className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drop your photos here, click to browse, or use camera
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files, 'regular')}
                        className="hidden"
                        id="photos"
                      />
                      <Label htmlFor="photos" className="cursor-pointer">
                        <Button type="button" variant="outline" size="sm">
                          Choose Photos
                        </Button>
                      </Label>
                      
                      <Input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleImageUpload(e.target.files, 'regular')}
                        className="hidden"
                        id="camera"
                      />
                      <Label htmlFor="camera" className="cursor-pointer">
                        <Button type="button" variant="outline" size="sm">
                          <Camera className="h-4 w-4 mr-2" />
                          Take Photo
                        </Button>
                      </Label>
                    </div>
                  </div>
                  
                  {selectedImages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Selected Photos ({selectedImages.length}):</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {selectedImages.map((file, index) => (
                          <div key={index} className="relative rounded-lg overflow-hidden bg-muted aspect-square">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 h-6 w-6 p-0"
                              onClick={() => {
                                const newImages = selectedImages.filter((_, i) => i !== index);
                                setSelectedImages(newImages);
                              }}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label>Topo Diagram (Optional)</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Upload a topo diagram showing the route and holds, or record a video of the route
                  </p>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <Mountain className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload topo or record route video
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => handleImageUpload(e.target.files, 'topo')}
                        className="hidden"
                        id="topo"
                      />
                      <Label htmlFor="topo" className="cursor-pointer">
                        <Button type="button" variant="outline" size="sm">
                          Choose File
                        </Button>
                      </Label>
                      
                      <Input
                        type="file"
                        accept="video/*"
                        capture="environment"
                        onChange={(e) => handleImageUpload(e.target.files, 'topo')}
                        className="hidden"
                        id="video-topo"
                      />
                      <Label htmlFor="video-topo" className="cursor-pointer">
                        <Button type="button" variant="outline" size="sm">
                          <Camera className="h-4 w-4 mr-2" />
                          Record Route
                        </Button>
                      </Label>
                    </div>
                  </div>
                  
                  {topoImage && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Topo Preview:</p>
                      <div className="w-full max-w-md mx-auto rounded-lg overflow-hidden bg-muted">
                        {topoImage.type.startsWith('video/') ? (
                          <video
                            src={URL.createObjectURL(topoImage)}
                            controls
                            className="w-full h-auto object-cover"
                          />
                        ) : (
                          <img
                            src={URL.createObjectURL(topoImage)}
                            alt="Topo preview"
                            className="w-full h-auto object-cover"
                          />
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => setTopoImage(null)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grades" className="space-y-6">
            <Card className="climbing-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>Grade Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>V-Scale Grade</Label>
                    <Select onValueChange={(value) => handleVGradeChange(value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select V-grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {V_GRADES.map((grade) => (
                          <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Font Scale Grade</Label>
                    <Select onValueChange={(value) => handleFontGradeChange(value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select Font grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_GRADES.map((grade) => (
                          <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Grading Guidelines</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• <strong>V-Scale:</strong> American system (V0-V17)</p>
                    <p>• <strong>Font Scale:</strong> French system (3-9c)</p>
                    <p>• Grade conservatively - the community will provide feedback</p>
                    <p>• Consider the height, difficulty, and overall challenge</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          
          <div className="space-x-2">
            {currentTab !== 'grades' && (
              <Button
                type="button"
                onClick={() => {
                  const tabs = ['details', 'location', 'media', 'grades'];
                  const currentIndex = tabs.indexOf(currentTab);
                  if (currentIndex < tabs.length - 1) {
                    setCurrentTab(tabs[currentIndex + 1]);
                  }
                }}
              >
                Next
              </Button>
            )}
            
            {currentTab === 'grades' && (
              <Button type="submit" className="boulder-gradient text-white">
                Submit Boulder
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}