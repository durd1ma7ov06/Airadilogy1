
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'super_admin' | 'admin' | 'user';
  bio?: string;
  phone?: string;
  telegram?: string;
  birth_day?: number;
  birth_month?: number;
  birth_year?: number;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  weight?: number;
  height?: number;
  blood_type?: string;
  rh_factor?: '+' | '-';
  allergies?: string;
  chronic_diseases?: string;
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
  doctor_comment?: string; // Shifokor izohi uchun
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'message' | 'comment' | 'alert';
  message: string;
  link_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
