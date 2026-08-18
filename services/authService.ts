
import { User } from '../types';
import { supabase } from './supabaseClient';

const USERS_KEY = 'pnevmoscan_db_users';
const HISTORY_KEY = 'pnevmoscan_db_global_history';
const SESSION_KEY = 'pnevmoscan_current_user';

export const authService = {
  _getLocalData: () => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const histories = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return { users, histories };
  },

  getUsers: async (): Promise<User[]> => {
    if (!supabase) {
      return authService._getLocalData().users;
    }
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      console.error('Error fetching users:', error);
      return authService._getLocalData().users;
    }
    return data || [];
  },

  register: async (user: Omit<User, 'id' | 'role'>): Promise<void> => {
    const userId = 'ID-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const isSuperAdmin = user.email.toLowerCase() === 'mansur3909@gmail.com';
    const newUser: User = { ...user, id: userId, role: isSuperAdmin ? 'super_admin' : 'user' };

    if (!supabase) {
      const { users, histories } = authService._getLocalData();
      if (users.find((u: any) => u.email === user.email)) {
        throw new Error("Bu email bilan allaqachon ro'yxatdan o'tilgan!");
      }
      users.push(newUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      return;
    }

    try {
      const { data, error } = await supabase.from('users').insert([newUser]).select();

      if (error) {
        if (error.code === '23505') throw new Error("Bu email bilan allaqachon ro'yxatdan o'tilgan!");
        throw new Error("Ma'lumotlar bazasi xatosi: " + error.message);
      }
    } catch (e: any) {
      throw e;
    }
  },

  login: async (email: string, password: string): Promise<User | null> => {
    if (!supabase) {
      const { users } = authService._getLocalData();
      const user = users.find((u: any) => u.email === email && u.password === password);
      if (user) {
        const { password: _, ...safeUser } = user;
        localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
        return safeUser as User;
      }
      return null;
    }

    const { data, error } = await supabase.from('users').select('*').eq('email', email).eq('password', password).single();
    if (error || !data) return null;

    const { password: _, ...safeUser } = data;
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
    return safeUser as User;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  saveGlobalHistory: async (entry: any) => {
    const user = authService.getCurrentUser();
    if (!user) return;

    const fullEntry = {
      user_email: user.email,
      user_name: user.name,
      type: entry.type,
      report: entry.report,
      image_url: entry.imageUrl || null,
      input_data: entry.inputData || null,
      summary: entry.summary || entry.report.substring(0, 150) + "...",
      timestamp: new Date().toISOString()
    };

    if (!supabase) {
      const { histories } = authService._getLocalData();
      histories.unshift({ ...fullEntry, userEmail: user.email, userName: user.name, timestamp: new Date().toLocaleString('uz-UZ') });
      localStorage.setItem(HISTORY_KEY, JSON.stringify(histories.slice(0, 1000)));
      return;
    }

    const { error } = await supabase.from('histories').insert([fullEntry]);
    if (error) {
      console.error('Supabase Save Error:', error);
      throw new Error(`Tahlilni saqlashda xatolik: ${error.message}`);
    }
    console.log('History saved successfully:', fullEntry);
  },

  getUserHistory: async (email: string) => {
    if (!supabase) {
      return authService._getLocalData().histories.filter((h: any) => h.userEmail === email);
    }
    const { data, error } = await supabase
      .from('histories')
      .select('*')
      .eq('user_email', email)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching user history:', error);
      return [];
    }
    return data.map(h => ({
      ...h,
      userEmail: h.user_email,
      userName: h.user_name,
      imageUrl: h.image_url,
      inputData: h.input_data,
      timestamp: new Date(h.timestamp).toLocaleString('uz-UZ')
    }));
  },

  getAllHistories: async () => {
    if (!supabase) {
      return authService._getLocalData().histories;
    }
    const { data, error } = await supabase.from('histories').select('*').order('timestamp', { ascending: false });
    if (error) {
      console.error('Error fetching histories:', error);
      return authService._getLocalData().histories;
    }
    return data.map(h => ({
      ...h,
      userEmail: h.user_email,
      userName: h.user_name,
      imageUrl: h.image_url,
      inputData: h.input_data,
      timestamp: new Date(h.timestamp).toLocaleString('uz-UZ')
    }));
  },

  updateUserRole: async (userId: string, newRole: 'admin' | 'user'): Promise<void> => {
    if (!supabase) {
      const { users } = authService._getLocalData();
      const userIndex = users.findIndex((u: any) => u.id === userId);
      if (userIndex !== -1) {
        users[userIndex].role = newRole;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
      return;
    }

    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user role:', error);
      throw new Error(`Rolni yangilashda xatolik: ${error.message}`);
    }
  },

  isSuperAdmin: (user: User | null): boolean => {
    return user?.role === 'super_admin';
  },

  exportDatabase: async () => {
    const users = await authService.getUsers();
    const histories = await authService.getAllHistories();
    const data = { users, histories };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pnevmoscan_database_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  },

  updateProfile: async (userId: string, profileData: {
    bio?: string;
    phone?: string;
    telegram?: string;
    birth_day?: number;
    birth_month?: number;
    birth_year?: number;
    gender?: string;
    address?: string;
    weight?: number;
    height?: number;
    blood_type?: string;
    rh_factor?: string;
    allergies?: string;
    chronic_diseases?: string;
  }): Promise<User> => {
    if (!supabase) {
      const { users } = authService._getLocalData();
      const userIndex = users.findIndex((u: any) => u.id === userId);
      if (userIndex === -1) throw new Error("Foydalanuvchi topilmadi!");
      users[userIndex] = { ...users[userIndex], ...profileData };
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      const { password: _, ...safeUser } = users[userIndex];
      localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
      return safeUser as User;
    }

    const { data, error } = await supabase
      .from('users')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw new Error(`Profilni yangilashda xatolik: ${error.message}`);
    }

    const { password: _, ...safeUser } = data;
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
    return safeUser as User;
  }
};
