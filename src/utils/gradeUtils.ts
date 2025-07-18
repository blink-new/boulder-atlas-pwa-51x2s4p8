// Combined grade conversion and mapping utilities for V-Scale and Font Scale
export const V_TO_FONT_MAPPING: Record<string, string> = {
  'VB': '3',
  'V0': '4a',
  'V1': '4b',
  'V2': '5a',
  'V3': '5b',
  'V4': '6a',
  'V5': '6b',
  'V6': '6c',
  'V7': '7a',
  'V8': '7b',
  'V9': '7c',
  'V10': '8a',
  'V11': '8a+',
  'V12': '8b',
  'V13': '8b+',
  'V14': '8c',
  'V15': '8c+',
  'V16': '9a',
  'V17': '9a+'
};

export const FONT_TO_V_MAPPING: Record<string, string> = {
  '3': 'VB',
  '4a': 'V0',
  '4b': 'V1',
  '4c': 'V1',
  '5a': 'V2',
  '5b': 'V3',
  '5c': 'V3',
  '6a': 'V4',
  '6a+': 'V4',
  '6b': 'V5',
  '6b+': 'V5',
  '6c': 'V6',
  '6c+': 'V6',
  '7a': 'V7',
  '7a+': 'V7',
  '7b': 'V8',
  '7b+': 'V8',
  '7c': 'V9',
  '7c+': 'V9',
  '8a': 'V10',
  '8a+': 'V11',
  '8b': 'V12',
  '8b+': 'V13',
  '8c': 'V14',
  '8c+': 'V15',
  '9a': 'V16',
  '9a+': 'V17',
  '9b': 'V17',
  '9b+': 'V17',
  '9c': 'V17'
};

// Conversion functions
export function convertVToFont(vGrade: string): string {
  return V_TO_FONT_MAPPING[vGrade] || vGrade;
}

export function convertFontToV(fontGrade: string): string {
  return FONT_TO_V_MAPPING[fontGrade] || fontGrade;
}

// Legacy functions for backward compatibility
export function getCorrespondingFontGrade(vGrade: string): string {
  return convertVToFont(vGrade);
}

export function getCorrespondingVGrade(fontGrade: string): string {
  return convertFontToV(fontGrade);
}

// Grade validation
export function isValidVGrade(grade: string): boolean {
  return grade in V_TO_FONT_MAPPING;
}

export function isValidFontGrade(grade: string): boolean {
  return grade in FONT_TO_V_MAPPING;
}

// Get grade difficulty as number for sorting/comparison
export function getGradeDifficulty(grade: string): number {
  if (grade.startsWith('V')) {
    const vNumber = grade.substring(1);
    if (vNumber === 'B') return -1;
    return parseInt(vNumber) || 0;
  }
  
  // Font grades - convert to numeric scale
  const fontToNumber: Record<string, number> = {
    '3': -1, '4a': 0, '4b': 1, '4c': 1.5, '5a': 2, '5b': 3, '5c': 3.5,
    '6a': 4, '6a+': 4.5, '6b': 5, '6b+': 5.5, '6c': 6, '6c+': 6.5,
    '7a': 7, '7a+': 7.5, '7b': 8, '7b+': 8.5, '7c': 9, '7c+': 9.5,
    '8a': 10, '8a+': 11, '8b': 12, '8b+': 13, '8c': 14, '8c+': 15,
    '9a': 16, '9a+': 17, '9b': 17, '9b+': 17, '9c': 17
  };
  
  return fontToNumber[grade] || 0;
}