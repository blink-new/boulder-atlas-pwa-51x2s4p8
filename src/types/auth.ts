export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatar?: string;
  preferences: {
    language: 'en' | 'fr' | 'es' | 'de';
    theme: 'light' | 'dark' | 'system';
    defaultGradeSystem: 'v-scale' | 'font';
  };
  stats: {
    bouldersSubmitted: number;
    gradesVoted: number;
    hardestSend?: string;
    favoriteArea?: string;
    averageRating: number;
  };
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  displayName: string;
}