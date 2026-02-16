export type UserRole = 'admin' | 'employee' | 'customer';

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface PersonalDetails {
  fullName: string;
  dob: string;
  gender: 'male' | 'female' | 'other' | '';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed' | '';
  fatherName: string;
}

export interface ProfessionalDetails {
  occupation: string;
  incomeSource: string;
  annualIncome: number;
}

export interface IdentityDetails {
  panNumber: string;
  aadhaarNumber: string;
}

export interface Nominee {
  name: string;
  relation: string;
  dob: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  status: 'active' | 'pending' | 'blocked';
  lastLogin?: string;
  identityDetails?: IdentityDetails;
  // Legacy/Frontend-only fields (making optional to avoid breaking mockData)
  avatar?: string;
  createdAt?: string;
  twoFactorEnabled?: boolean;
  profileCompleted?: boolean;
  personalDetails?: PersonalDetails;
  address?: Address;
  professionalDetails?: ProfessionalDetails;
  nominee?: Nominee;
}

export interface AuthResponse {
  status: string;
  token: string;
  data: User;
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
  fromAccountId?: string;
  toAccountId?: string;
  amount: number;
  currency: string;
  type: 'NEFT' | 'RTGS' | 'IMPS' | 'internal' | 'bill_payment' | 'deposit' | 'withdrawal' | 'transfer';
  status: 'completed' | 'pending' | 'failed';
  description: string;
  timestamp?: string;
  date?: string;
  createdAt?: string;
  riskScore?: number;
  isFlagged?: boolean;
  beneficiaryName?: string;
  senderName?: string;
  receiverName?: string;
  category?: 'income' | 'expense' | 'bills' | 'shopping' | 'transfer';
  reference?: string;
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
  creditScore?: number;
  monthlyIncome?: number;
  employmentStatus?: string;
  approvedBy?: string;
  approvedAt?: string;
  adminComment?: string;
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
  documentType: 'aadhaar' | 'pan' | 'passport' | 'driving_license' | 'voter_id';
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
