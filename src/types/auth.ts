export type UserRole = 'customer' | 'staff' | 'admin';

export type AccountStatus = 'active' | 'pending' | 'approved' | 'rejected' | 'disabled';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string; // Normalized lowercase
  mobile: string; // Digits only or formatted mobile
  role: UserRole;
  accountStatus: AccountStatus;
  designation?: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  passwordHash: string; // Salted cryptographic hash (never plaintext)
  passwordSalt: string;
  emailVerified: boolean;
  mobileVerified: boolean;
}

export interface AuthSession {
  token: string;
  userId: string;
  userEmail: string;
  userFullName: string;
  role: UserRole;
  accountStatus: AccountStatus;
  expiresAt: number;
}

export interface RegisterUserInput {
  fullName: string;
  email?: string;
  mobile?: string;
  password?: string;
  requestedRole: 'customer' | 'staff'; // ADMIN IS STRICTLY FORBIDDEN FROM PUBLIC REGISTRATION
  designation?: string;
  department?: string;
  otpCode: string; // Mandatory OTP code verified during registration
  verificationIdentifier: string; // The specific email or mobile to which OTP was dispatched
}

export interface LoginCredentialInput {
  identifier: string; // Registered Email OR Mobile Number
  password?: string;
  otp?: string;
  loginMethod: 'password' | 'otp';
}

export interface OtpChallenge {
  identifier: string;
  code: string;
  generatedAt: number;
  expiresAt: number;
  channel: 'email' | 'mobile';
}
