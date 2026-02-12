export type UserRole = 'admin' | 'employee' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone: string;
  status: 'active' | 'blocked' | 'pending';
  createdAt: string;
  lastLogin: string;
  twoFactorEnabled: boolean;
}

export interface Account {
  id: string;
  userId: string;
  accountNumber: string;
  type: 'savings' | 'current' | 'fixed_deposit';
  balance: number;
  currency: string;
  status: 'active' | 'frozen' | 'closed' | 'pending';
  createdAt: string;
  dailyLimit: number;
  usedLimit: number;
}

export interface Transaction {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  currency: string;
  type: 'NEFT' | 'RTGS' | 'IMPS' | 'internal';
  status: 'completed' | 'pending' | 'failed';
  description: string;
  timestamp: string;
  riskScore: number;
  isFlagged: boolean;
  beneficiaryName?: string;
}

export interface Loan {
  id: string;
  userId: string;
  type: 'personal' | 'home' | 'auto' | 'business';
  amount: number;
  interestRate: number;
  tenure: number;
  status: 'approved' | 'pending' | 'rejected' | 'active';
  appliedAt: string;
  monthlyEmi: number;
}

export interface Beneficiary {
  id: string;
  userId: string;
  name: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  status: 'approved' | 'pending' | 'rejected';
  addedAt: string;
}

export interface KYCDocument {
  id: string;
  userId: string;
  type: 'aadhaar' | 'pan' | 'passport' | 'driving_license';
  status: 'verified' | 'pending' | 'rejected';
  submittedAt: string;
  verifiedBy?: string;
  documentUrl: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  category: 'auth' | 'transaction' | 'admin' | 'system';
  details: string;
  ipAddress: string;
  timestamp: string;
  isSuspicious: boolean;
}

export interface LoginSession {
  id: string;
  userId: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  loginAt: string;
  isActive: boolean;
  isSuspicious: boolean;
}

export interface SystemConfig {
  maintenanceMode: boolean;
  dailyTransactionLimit: number;
  fraudSensitivity: number;
  notificationsEnabled: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
