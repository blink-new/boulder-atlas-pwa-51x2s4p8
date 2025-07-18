export interface Boulder {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  location: string; // e.g., "Fontainebleau, France"
  images: string[];
  topoImage?: string;
  submittedBy: string;
  submittedAt: Date;
  
  // Grading systems
  submitterGrade: {
    vGrade?: string; // V0, V1, V2, etc.
    fontGrade?: string; // 3, 4a, 4b, etc.
  };
  
  communityGrade: {
    vGrade?: string;
    fontGrade?: string;
    averageRating: number;
    totalVotes: number;
  };
  
  // Additional details
  rock: string; // granite, sandstone, limestone, etc.
  style: string[]; // slab, overhang, vertical, etc.
  tags: string[]; // highball, mantle, crimp, etc.
  height: number; // in meters
  established?: Date;
  firstAscentist?: string;
}

export interface BoulderSubmission {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  location: string;
  images: File[];
  topoImage?: File;
  submitterGrade: {
    vGrade?: string;
    fontGrade?: string;
  };
  rock: string;
  style: string[];
  tags: string[];
  height: number;
  firstAscentist?: string;
}

export type GradeSystem = 'v-scale' | 'font';

export const V_GRADES = [
  'VB', 'V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 
  'V7', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17'
];

export const FONT_GRADES = [
  '1', '2', '3', '4a', '4b', '4c', '5a', '5b', '5c',
  '6a', '6a+', '6b', '6b+', '6c', '6c+', '7a', '7a+', '7b', '7b+', '7c', '7c+',
  '8a', '8a+', '8b', '8b+', '8c', '8c+', '9a', '9a+', '9b', '9b+', '9c'
];

export const ROCK_TYPES = [
  'Granite', 'Sandstone', 'Limestone', 'Quartzite', 'Gneiss', 'Basalt', 'Conglomerate'
];

export const CLIMBING_STYLES = [
  'Slab', 'Traversing', 'Slightly Overhanging', 'Overhanging', 'Roof'
];

export const BOULDER_TAGS = [
  'Highball', 'Lowball', 'Mantle', 'Crimp', 'Sloper', 'Pinch', 'Pocket',
  'Arete', 'Corner', 'Crack', 'Dyno', 'Compression', 'Balance', 'Technical', 
  'Powerful', 'Electric', 'Gaston', 'Undercling'
];