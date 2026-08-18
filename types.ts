export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'user';
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  type: 'lung' | 'diabetes' | 'uzi';
  imageUrl?: string;
  inputData?: any;
  report: string;
  summary: string;
  userEmail: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}