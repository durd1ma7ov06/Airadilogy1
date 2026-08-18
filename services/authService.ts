import { User } from '../types';

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
    return authService._getLocalData().users;
  },

  register: async (user: Omit<User, 'id' | 'role'>): Promise<void> => {
    const userId = 'ID-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const newUser: User = { ...user, id: userId, role: 'user' };

    const { users } = authService._getLocalData();
    if (users.find((u: any) => u.email === user.email)) {
      throw new Error("Bu email bilan allaqachon ro'yxatdan o'tilgan!");
    }
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  login: async (email: string, password: string): Promise<User | null> => {
    const { users } = authService._getLocalData();
    const user = users.find((u: any) => u.email === email && u.password === password);
    if (user) {
      const { password: _, ...safeUser } = user;
      localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
      return safeUser as User;
    }
    return null;
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
      id: entry.id,
      userEmail: user.email,
      userName: user.name,
      type: entry.type,
      imageUrl: entry.imageUrl || null,
      inputData: entry.inputData || null,
      report: entry.report,
      summary: entry.summary || entry.report.substring(0, 150) + "...",
      timestamp: new Date().toLocaleString('uz-UZ')
    };

    const { histories } = authService._getLocalData();
    histories.unshift(fullEntry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(histories.slice(0, 1000)));
  },

  getUserHistory: async (email: string) => {
    const { histories } = authService._getLocalData();
    return histories.filter((h: any) => h.userEmail === email);
  },

  getAllHistories: async () => {
    return authService._getLocalData().histories;
  }
};
