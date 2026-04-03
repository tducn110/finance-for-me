/**
 * S2S Finance Tracker - API Service Layer
 * Centralized API client for all backend communication
 */

// Use relative URL for proxy support via next.config.ts
const API_BASE_URL = '';
const API_TIMEOUT = 15000;

// ==================== Types ====================

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  avatarText?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  categoryId: number;
  amount: string; // Decimal from DB
  type: 'income' | 'expense';
  note: string | null;
  displayDate: string; // ISO date string
  source: string;
  receiptUrl?: string | null;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense' | 'both';
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  icon: string;
  targetAmount: string;
  currentSaved: string;
  monthlyContribution: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  deadline?: string | null;
  createdAt: string;
}

export interface Bill {
  id: string;
  userId: string;
  name: string;
  icon: string;
  amount: string;
  dueDay: number;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  status: 'active' | 'inactive';
  autoPay: boolean;
  nextDueDate: string;
}

export interface FinanceData {
  total_income: number;
  total_expense: number;
  balance: number;
  safe_to_spend: number;
  is_over_budget: boolean;
  monthly_budget: number;
  emergency_buffer: number;
  income_date: number;
  goals_allocation: number;
  bills_due: number;
}

export interface CategorySpending {
  category_name: string;
  icon: string;
  color: string;
  total_spent: number;
  transaction_count: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
export type LoginInput = LoginCredentials;

export interface RegisterData {
  username: string;
  email: string;
  fullName: string;
  password: string;
}
export type InsertUser = RegisterData;

export interface AuthResponse {
  user: User;
}

// ==================== API Client ====================

class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

class APIClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string, timeout: number) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: options.credentials || 'include',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = result.error?.message || result.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new APIError(
          errorMsg,
          response.status,
          result
        );
      }

      return result.data || result; // Hono wrapper pattern
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof APIError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new APIError('Request timeout', 408);
        }
        throw new APIError(error.message);
      }

      throw new APIError('Unknown error occurred');
    }
  }

  // ==================== Auth Endpoints ====================

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    localStorage.setItem('s2s_user', JSON.stringify(response.user));
    return response;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  async logout(): Promise<void> {
    await this.request('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('s2s_user');
  }

  async getMe(): Promise<User> {
    const response = await this.request<User>('/api/auth/me');
    localStorage.setItem('s2s_user', JSON.stringify(response));
    return response;
  }

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('s2s_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // ==================== Finance Endpoints ====================

  async getFinanceData(): Promise<FinanceData> {
    return this.request<FinanceData>('/api/finance/safe-to-spend');
  }

  // ==================== Transaction Endpoints ====================

  async getTransactions(params?: Record<string, string | number | boolean | undefined>): Promise<{
    transactions: Transaction[];
    total: number;
    pages: number;
  }> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.request(`/api/transactions?${query}`);
  }

  async quickAddTransaction(note: string): Promise<Transaction> {
    return this.request<Transaction>('/api/transactions/quick', {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  }

  async deleteTransaction(id: string): Promise<void> {
    return this.request<void>(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadReceipt(file: File): Promise<{ amount: number; confidence: number; receiptUrl: string }> {
    const formData = new FormData();
    formData.append('receipt', file);

    const response = await fetch(`${this.baseURL}/api/finance/ocr`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new APIError('OCR upload failed', response.status);
    }

    return response.json();
  }

  // ==================== Category Endpoints ====================

  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/api/categories');
  }

  async getCategorySpending(month?: string): Promise<CategorySpending[]> {
    const query = month ? `?month=${month}` : '';
    return this.request<CategorySpending[]>(`/api/analytics/category-spending${query}`);
  }

  // ==================== Analytics Endpoints ====================

  async getMonthlyTrend(months: number = 6): Promise<MonthlyTrend[]> {
    return this.request<MonthlyTrend[]>(`/api/analytics/monthly-trend?months=${months}`);
  }

  // ==================== Goal Endpoints ====================

  async getGoals(): Promise<Goal[]> {
    return this.request<Goal[]>('/api/goals');
  }

  async getBills(): Promise<Bill[]> {
    return this.request<Bill[]>('/api/bills');
  }
}

export const apiClient = new APIClient(API_BASE_URL, API_TIMEOUT);
export { APIError };
