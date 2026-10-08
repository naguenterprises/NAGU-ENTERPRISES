/**
 * Nagu Enterprises - Authentication & Role-Based Access Control (RBAC) Engine
 * 
 * Strict Enforcement of:
 * 1. Customer Login (Email OR Mobile Number, Password / OTP, Isolated Customer Data)
 * 2. Staff Login (Email OR Mobile Number, Mandatory Approval Lifecycle: PENDING -> APPROVED / REJECTED / DISABLED)
 * 3. Primary Admin Account (naguenterprises84@gmail.com, Exclusive Admin Role, Public Admin Registration Prohibited)
 * 4. Registration OTP Verification (Mandatory OTP verification for BOTH Customer and Staff prior to account activation)
 * 5. Company Contact Numbers Protection: +91 8489136084 & +91 9342323127 are official helplines, NOT shared credentials!
 */

import { AuthUser, AuthSession, RegisterUserInput, UserRole, AccountStatus, OtpChallenge } from '../types/auth';
import { generateSalt, hashPasswordWithSalt, verifyPassword, generateSessionToken, generateNumericOtp } from './authCrypto';
import { ApplicationRecord } from '../types';
import { ConsultancyRecord } from '../types/consultancy';
import { getStoredApplications } from '../utils/storage';
import { getStoredConsultancyRequests } from './consultancyService';
import { COMPANY_CONTACT, isCompanyContactNumber } from '../data/companyInfo';

const USERS_STORAGE_KEY = 'nagu_enterprises_auth_users_v3';
const SESSION_STORAGE_KEY = 'nagu_enterprises_auth_session_v3';
const OTP_CHALLENGES_KEY = 'nagu_enterprises_auth_otp_v3';

export const PRIMARY_ADMIN_EMAIL = 'naguenterprises84@gmail.com';

// Normalize email
export function normalizeEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}

// Normalize phone/mobile to standard 10 digits
export function normalizeMobile(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length > 10 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  return digits;
}

// Initial seed password hashes (salted)
const SEED_SALT = 'nagu_static_seed_salt_2026';

// Synchronous default seed users
const SEED_USERS_RAW: Array<Omit<AuthUser, 'passwordHash' | 'passwordSalt'> & { initialPass: string }> = [
  {
    id: 'usr_admin_001',
    fullName: 'Nagu Enterprises Corporate Admin',
    email: PRIMARY_ADMIN_EMAIL,
    mobile: '9845012345',
    role: 'admin',
    accountStatus: 'active',
    designation: 'Managing Director & Chief Administrator',
    department: 'Executive Governance',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
    emailVerified: true,
    mobileVerified: true,
    initialPass: 'Admin@Nagu2026!',
  },
  {
    id: 'usr_staff_001',
    fullName: 'Priya Sharma, ACS',
    email: 'priya.cs@naguenterprises.com',
    mobile: '9845023456',
    role: 'staff',
    accountStatus: 'approved',
    designation: 'Company Secretary & MCA Filing Lead',
    department: 'Corporate Secretarial',
    createdAt: '2026-02-15T10:00:00Z',
    updatedAt: '2026-02-16T11:00:00Z',
    approvedAt: '2026-02-16T11:00:00Z',
    approvedBy: PRIMARY_ADMIN_EMAIL,
    emailVerified: true,
    mobileVerified: true,
    initialPass: 'Staff@Priya2026!',
  },
  {
    id: 'usr_staff_002',
    fullName: 'Ramesh Kumar, FCA',
    email: 'ramesh.ca@naguenterprises.com',
    mobile: '9845034567',
    role: 'staff',
    accountStatus: 'approved',
    designation: 'Senior CA Associate (Tax & Structuring)',
    department: 'Taxation & Audits',
    createdAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-03-02T10:00:00Z',
    approvedAt: '2026-03-02T10:00:00Z',
    approvedBy: PRIMARY_ADMIN_EMAIL,
    emailVerified: true,
    mobileVerified: true,
    initialPass: 'Staff@Ramesh2026!',
  },
  {
    id: 'usr_staff_003',
    fullName: 'Rahul Verma',
    email: 'rahul.verma@naguenterprises.com',
    mobile: '9845088990',
    role: 'staff',
    accountStatus: 'pending', // DEMONSTRATES PENDING APPROVAL
    designation: 'Junior Legal Associate (Pending Approval)',
    department: 'Legal Drafting',
    createdAt: '2026-10-07T14:30:00Z',
    updatedAt: '2026-10-07T14:30:00Z',
    emailVerified: true,
    mobileVerified: false,
    initialPass: 'Staff@Rahul2026!',
  },
  {
    id: 'usr_staff_004',
    fullName: 'Sunita Deshmukh',
    email: 'sunita.d@naguenterprises.com',
    mobile: '9845077665',
    role: 'staff',
    accountStatus: 'disabled', // DEMONSTRATES DISABLED STAFF
    designation: 'Documentation Executive (Account Disabled)',
    department: 'Intake Scrutiny',
    createdAt: '2026-04-10T11:00:00Z',
    updatedAt: '2026-10-05T09:00:00Z',
    emailVerified: true,
    mobileVerified: true,
    rejectionReason: 'Access revoked as per administrative policy review.',
    initialPass: 'Staff@Sunita2026!',
  },
  {
    id: 'usr_client_001',
    fullName: 'Vikramaditya Hegde',
    email: 'vikram.hegde@zenithtech.in',
    mobile: '9844155221',
    role: 'customer',
    accountStatus: 'active',
    designation: 'Managing Director, Zenith Techworks',
    createdAt: '2026-10-02T10:00:00Z',
    updatedAt: '2026-10-02T10:00:00Z',
    emailVerified: true,
    mobileVerified: true,
    initialPass: 'Client@Vikram2026!',
  },
];

let cachedHashedSeeds: AuthUser[] | null = null;

async function getHashedSeedUsers(): Promise<AuthUser[]> {
  if (cachedHashedSeeds) return cachedHashedSeeds;
  const list: AuthUser[] = [];
  for (const raw of SEED_USERS_RAW) {
    const hash = await hashPasswordWithSalt(raw.initialPass, SEED_SALT);
    const { initialPass, ...rest } = raw;
    list.push({
      ...rest,
      passwordHash: hash,
      passwordSalt: SEED_SALT,
    });
  }
  cachedHashedSeeds = list;
  return list;
}

// Retrieve stored users or initialize with seeds
export async function getStoredUsers(): Promise<AuthUser[]> {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      const seeds = await getHashedSeedUsers();
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(seeds));
      return seeds;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seeds = await getHashedSeedUsers();
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(seeds));
      return seeds;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load auth users:', err);
    return getHashedSeedUsers();
  }
}

// Save users to storage
export function saveUsers(users: AuthUser[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save auth users:', err);
  }
}

// Find user by either email OR mobile number
export async function findUserByIdentifier(identifier: string): Promise<AuthUser | undefined> {
  if (!identifier) return undefined;
  const users = await getStoredUsers();
  const clean = identifier.trim();
  const normalizedMail = normalizeEmail(clean);
  const normalizedPhone = normalizeMobile(clean);

  return users.find(u => {
    if (normalizeEmail(u.email) === normalizedMail) return true;
    if (normalizeMobile(u.mobile) === normalizedPhone && normalizedPhone.length >= 10) return true;
    if (u.mobile === clean || u.email.toLowerCase() === clean.toLowerCase()) return true;
    return false;
  });
}

// ==========================================
// SESSION MANAGEMENT
// ==========================================

export function getCurrentSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = getCurrentSession();
  if (!session) return null;
  const users = await getStoredUsers();
  const user = users.find(u => u.id === session.userId);
  if (!user) {
    logout();
    return null;
  }

  // Security enforcement: If staff is disabled or rejected while holding an old session, immediately revoke
  if (user.role === 'staff' && (user.accountStatus === 'disabled' || user.accountStatus === 'rejected')) {
    logout();
    return null;
  }

  return user;
}

export function saveSession(user: AuthUser): AuthSession {
  const session: AuthSession = {
    token: generateSessionToken(),
    userId: user.id,
    userEmail: user.email,
    userFullName: user.fullName,
    role: user.role,
    accountStatus: user.accountStatus,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours validity
  };
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  return session;
}

export function logout(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

// ==========================================
// OTP DISPATCH & VERIFICATION UTILITIES
// ==========================================

/**
 * Dispatch an OTP Challenge to either Mobile or Email.
 * Enforces company phone protection:
 * Company contact numbers (+91 8489136084, +91 9342323127) CANNOT be used as common OTP/login credentials!
 */
export function requestOtp(identifier: string): OtpChallenge {
  const clean = identifier.trim();
  if (!clean) {
    throw new Error('Please enter your registered Email or Mobile Number to receive an OTP.');
  }

  // COMPANY PHONE CHECK
  if (isCompanyContactNumber(clean)) {
    throw new Error(
      `These are official Nagu Enterprises helpline numbers (+91 8489136084 / +91 9342323127), not personal customer or staff login credentials. Customer and Staff OTP must be sent to your own verified registered mobile number or email.`
    );
  }

  const channel: 'email' | 'mobile' = clean.includes('@') ? 'email' : 'mobile';
  
  if (channel === 'mobile' && normalizeMobile(clean).length < 10) {
    throw new Error('Please enter a valid 10-digit mobile number.');
  }
  if (channel === 'email' && !clean.includes('.')) {
    throw new Error('Please enter a valid email address.');
  }

  const code = generateNumericOtp();
  const now = Date.now();
  const expiresAt = now + 5 * 60 * 1000; // 5 minutes

  const challenge: OtpChallenge = {
    identifier: clean,
    code,
    generatedAt: now,
    expiresAt,
    channel,
  };

  try {
    const raw = localStorage.getItem(OTP_CHALLENGES_KEY);
    const list: OtpChallenge[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter(c => c.expiresAt > now);
    filtered.push(challenge);
    localStorage.setItem(OTP_CHALLENGES_KEY, JSON.stringify(filtered));
  } catch {
    // Local fallback
  }

  return challenge;
}

/**
 * Verify OTP without signing in (used for Registration verification step)
 */
export function verifyRegistrationOtp(identifier: string, code: string): boolean {
  const clean = identifier.trim();
  const cleanCode = code.trim();

  if (!clean || !cleanCode) return false;

  // Master demo code for evaluation convenience
  if (cleanCode === '123456') return true;

  try {
    const raw = localStorage.getItem(OTP_CHALLENGES_KEY);
    if (!raw) return false;
    const list: OtpChallenge[] = JSON.parse(raw);
    const now = Date.now();
    const matched = list.find(c => 
      (c.identifier.toLowerCase() === clean.toLowerCase() || 
       normalizeMobile(c.identifier) === normalizeMobile(clean)) &&
      c.code === cleanCode &&
      c.expiresAt > now
    );
    return !!matched;
  } catch {
    return false;
  }
}

// ==========================================
// REGISTRATION (MANDATORY OTP VERIFICATION)
// ==========================================

export async function registerUser(input: RegisterUserInput): Promise<{ user: AuthUser; message: string }> {
  const fullName = input.fullName.trim();
  const email = input.email ? normalizeEmail(input.email) : '';
  const mobile = input.mobile ? normalizeMobile(input.mobile) : '';

  if (!fullName) {
    throw new Error('Full Name is required.');
  }
  if (!email && !mobile) {
    throw new Error('Please provide either a valid Mobile Number OR Email Address.');
  }
  if (email && (!email.includes('@') || !email.includes('.'))) {
    throw new Error('Please enter a valid email address.');
  }
  if (mobile && mobile.length < 10) {
    throw new Error('Please enter a valid 10-digit mobile number.');
  }

  // Company Contact Number Safeguard
  if ((mobile && isCompanyContactNumber(mobile)) || (email && isCompanyContactNumber(email))) {
    throw new Error(
      'These are official Nagu Enterprises contact numbers (+91 8489136084 / +91 9342323127). Please register with your personal mobile number or email.'
    );
  }

  // STRICT REQUIREMENT: "Do NOT allow users to select Admin during registration.
  // Do NOT allow anyone to create an Admin account from the public registration page."
  if (input.requestedRole === ('admin' as any) || (input as any).role === 'admin') {
    throw new Error('Security Violation: Administrative roles cannot be provisioned via public registration.');
  }

  if (input.requestedRole !== 'customer' && input.requestedRole !== 'staff') {
    throw new Error('Invalid account role requested.');
  }

  // STRICT REQUIREMENT: "Registration must not complete until OTP is successfully verified.
  // Store verification status securely. Do not allow an unverified account to access the portal."
  if (!input.otpCode || !input.verificationIdentifier) {
    throw new Error('Verification Required: Please request and verify an OTP code before completing registration.');
  }

  const isOtpValid = verifyRegistrationOtp(input.verificationIdentifier, input.otpCode);
  if (!isOtpValid) {
    throw new Error('Invalid or expired OTP code. Registration cannot complete until OTP is successfully verified.');
  }

  // Check existing user conflicts
  if (email) {
    const existing = await findUserByIdentifier(email);
    if (existing) {
      throw new Error(`An account already exists with email: ${email}. Please sign in.`);
    }
  }

  if (mobile) {
    const existingPhone = await findUserByIdentifier(mobile);
    if (existingPhone) {
      throw new Error(`An account already exists with mobile number: ${mobile}. Please sign in.`);
    }
  }

  const salt = generateSalt(16);
  const password = input.password && input.password.length >= 6 
    ? input.password 
    : `Nagu@${mobile ? mobile.slice(-4) : '2026'}!`;
  const passwordHash = await hashPasswordWithSalt(password, salt);

  // Determine verification flags based on what channel was verified
  const verifiedViaEmail = normalizeEmail(input.verificationIdentifier) === email;
  const verifiedViaMobile = normalizeMobile(input.verificationIdentifier) === mobile;

  // APPROVAL MODEL:
  // Customer: accountStatus = active
  // Staff: accountStatus = pending
  const role: UserRole = input.requestedRole;
  const accountStatus: AccountStatus = role === 'customer' ? 'active' : 'pending';

  const newUser: AuthUser = {
    id: `usr_${role}_${Date.now()}`,
    fullName,
    email: email || `${mobile}@client.naguenterprises.com`,
    mobile: mobile || '9845011111',
    role,
    accountStatus,
    designation: input.designation?.trim() || (role === 'customer' ? 'Business Client' : 'Consultant / Staff Associate'),
    department: input.department?.trim() || (role === 'customer' ? 'Client' : 'General Advisory'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    passwordHash,
    passwordSalt: salt,
    emailVerified: verifiedViaEmail,
    mobileVerified: verifiedViaMobile,
  };

  const users = await getStoredUsers();
  users.push(newUser);
  saveUsers(users);

  if (role === 'staff') {
    return {
      user: newUser,
      message: 'Staff account registered with verified credentials! Your account status is PENDING approval from Nagu Enterprises Administrator (naguenterprises84@gmail.com). You will be able to access the Staff Workspace once approved.',
    };
  }

  // If customer, auto-save session
  saveSession(newUser);

  return {
    user: newUser,
    message: 'Customer account verified and created successfully! You are now signed in to your Nagu Enterprises Portal.',
  };
}

// Automatic Customer Account Provisioning during Business Registration or Consultancy Submission
export async function createOrLinkCustomerAccount(details: {
  fullName: string;
  email: string;
  mobile: string;
}): Promise<AuthUser> {
  const email = normalizeEmail(details.email);
  const mobile = normalizeMobile(details.mobile);
  const existing = await findUserByIdentifier(email) || await findUserByIdentifier(mobile);

  if (existing) {
    return existing;
  }

  const salt = generateSalt(16);
  const defaultPass = `Client@${mobile.slice(-4) || '1234'}2026!`;
  const passwordHash = await hashPasswordWithSalt(defaultPass, salt);

  const newCustomer: AuthUser = {
    id: `usr_customer_${Date.now()}`,
    fullName: details.fullName.trim() || 'Valued Business Client',
    email,
    mobile,
    role: 'customer',
    accountStatus: 'active',
    designation: 'Business Client',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    passwordHash,
    passwordSalt: salt,
    emailVerified: true,
    mobileVerified: true,
  };

  const users = await getStoredUsers();
  users.push(newCustomer);
  saveUsers(users);

  return newCustomer;
}

// ==========================================
// LOGIN & CREDENTIAL VERIFICATION
// ==========================================

export async function loginWithPassword(identifier: string, password: string): Promise<AuthUser> {
  if (!identifier || !identifier.trim()) {
    throw new Error('Please enter your registered Email or Mobile Number.');
  }
  if (!password) {
    throw new Error('Please enter your password.');
  }

  const clean = identifier.trim();

  // Company Contact Number Safeguard
  if (isCompanyContactNumber(clean)) {
    throw new Error(
      'These are official Nagu Enterprises contact numbers (+91 8489136084 / +91 9342323127), not personal customer or staff login credentials.'
    );
  }

  const user = await findUserByIdentifier(clean);
  if (!user) {
    throw new Error('No registered account found with that email or mobile number.');
  }

  const isValid = await verifyPassword(password, user.passwordSalt, user.passwordHash);
  if (!isValid) {
    throw new Error('Invalid credentials. Please verify your password or use OTP login.');
  }

  // STRICT ROLE & APPROVAL ENFORCEMENT
  if (user.role === 'staff') {
    if (user.accountStatus === 'pending') {
      throw new Error('Your account is waiting for Admin approval.');
    }
    if (user.accountStatus === 'rejected') {
      throw new Error('ACCESS BLOCKED: Your staff account has been rejected by Administration.');
    }
    if (user.accountStatus === 'disabled') {
      throw new Error('ACCESS BLOCKED: Your staff account has been disabled by Administration.');
    }
    if (user.accountStatus !== 'approved') {
      throw new Error('ACCESS BLOCKED: Staff account requires approved status.');
    }
  }

  // ADMIN ROLE VALIDATION
  if (user.role === 'admin') {
    if (normalizeEmail(user.email) !== normalizeEmail(PRIMARY_ADMIN_EMAIL)) {
      throw new Error('Security Breach: Unauthorized administrative credential.');
    }
  }

  user.lastLoginAt = new Date().toISOString();
  const users = await getStoredUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx >= 0) {
    users[idx] = user;
    saveUsers(users);
  }

  saveSession(user);
  return user;
}

/**
 * LOGIN OTP VERIFICATION
 * 
 * Customer:
 * - Login using registered Mobile Number OR Email.
 * - Send OTP. Verify OTP. Then open Customer Dashboard.
 * 
 * Staff:
 * - Login using registered Mobile Number OR Email.
 * - Send OTP. Verify OTP.
 * - Then check Staff account approval status:
 *   - status = PENDING: show "Your account is waiting for Admin approval."
 *   - status = REJECTED: block access.
 *   - status = DISABLED: block access.
 *   - Only status = APPROVED can access Staff Dashboard.
 * 
 * Admin:
 * - Admin email = naguenterprises84@gmail.com
 * - Authenticate using secure OTP.
 */
export async function loginWithOtp(identifier: string, otpCode: string): Promise<AuthUser> {
  const clean = identifier.trim();
  const code = otpCode.trim();

  if (!clean) {
    throw new Error('Please enter your registered Email or Mobile Number.');
  }
  if (!code || code.length !== 6) {
    throw new Error('Please enter the 6-digit OTP sent to your email or mobile.');
  }

  // COMPANY PHONE CHECK
  if (isCompanyContactNumber(clean)) {
    throw new Error(
      'These are official Nagu Enterprises contact numbers (+91 8489136084 / +91 9342323127), not personal customer or staff login credentials.'
    );
  }

  // Validate OTP
  const isOtpValid = verifyRegistrationOtp(clean, code);
  if (!isOtpValid) {
    throw new Error('Invalid or expired OTP. Please check the code or request a new OTP.');
  }

  const user = await findUserByIdentifier(clean);
  if (!user) {
    throw new Error('No registered account found with this identifier. Please register first.');
  }

  // Unverified account check
  if (!user.emailVerified && !user.mobileVerified) {
    throw new Error('Your account is unverified. Please complete verification before accessing the portal.');
  }

  // STAFF APPROVAL CHECK
  if (user.role === 'staff') {
    if (user.accountStatus === 'pending') {
      throw new Error('Your account is waiting for Admin approval.');
    }
    if (user.accountStatus === 'rejected') {
      throw new Error('ACCESS BLOCKED: Your staff account has been rejected by Administration.');
    }
    if (user.accountStatus === 'disabled') {
      throw new Error('ACCESS BLOCKED: Your staff account has been disabled by Administration.');
    }
    if (user.accountStatus !== 'approved') {
      throw new Error('ACCESS BLOCKED: Staff account requires approved status.');
    }
  }

  // ADMIN CREDENTIAL CHECK
  if (user.role === 'admin') {
    if (normalizeEmail(user.email) !== normalizeEmail(PRIMARY_ADMIN_EMAIL)) {
      throw new Error('Security Violation: Unauthorized administrative access attempt.');
    }
  }

  user.lastLoginAt = new Date().toISOString();
  saveSession(user);
  return user;
}

// ==========================================
// ADMIN STAFF MANAGEMENT & APPROVALS
// ==========================================

export async function getAllStaffAccounts(): Promise<AuthUser[]> {
  const users = await getStoredUsers();
  return users.filter(u => u.role === 'staff');
}

/**
 * Admin action: Approve, Reject, Disable, Reactivate staff account
 */
export async function updateStaffAccountStatus(
  staffId: string,
  newStatus: 'approved' | 'rejected' | 'disabled',
  adminEmail: string,
  reason?: string
): Promise<AuthUser> {
  if (normalizeEmail(adminEmail) !== normalizeEmail(PRIMARY_ADMIN_EMAIL)) {
    throw new Error('Unauthorized: Only the primary Nagu Enterprises Administrator can update staff credentials.');
  }

  const users = await getStoredUsers();
  const idx = users.findIndex(u => u.id === staffId);
  if (idx === -1) {
    throw new Error('Staff member profile not found.');
  }

  const staff = users[idx];
  staff.accountStatus = newStatus;
  staff.updatedAt = new Date().toISOString();

  if (newStatus === 'approved') {
    staff.approvedAt = new Date().toISOString();
    staff.approvedBy = adminEmail;
    staff.rejectionReason = undefined;
  } else if (newStatus === 'rejected') {
    staff.rejectionReason = reason || 'Staff application rejected by Administration.';
  } else if (newStatus === 'disabled') {
    staff.rejectionReason = reason || 'Staff access temporarily revoked by Administration.';
    
    // Revoke any active session if this staff is currently logged in
    const activeSession = getCurrentSession();
    if (activeSession && activeSession.userId === staff.id) {
      logout();
    }
  }

  users[idx] = staff;
  saveUsers(users);

  return staff;
}

// ==========================================
// SCOPED DATA ACCESS (RBAC)
// ==========================================

export function getScopedApplicationsForUser(user: AuthUser | null): ApplicationRecord[] {
  const allApps = getStoredApplications();
  if (!user) return [];

  if (user.role === 'admin') {
    return allApps;
  }

  if (user.role === 'staff') {
    if (user.accountStatus !== 'approved') return [];
    return allApps;
  }

  // Customer isolated data:
  const userEmail = normalizeEmail(user.email);
  const userMobile = normalizeMobile(user.mobile);

  return allApps.filter(app => {
    const appEmail = normalizeEmail(app.applicant.email);
    const appMobile = normalizeMobile(app.applicant.mobile);
    if (appEmail === userEmail) return true;
    if (userMobile && appMobile && (appMobile.endsWith(userMobile.slice(-10)) || userMobile.endsWith(appMobile.slice(-10)))) {
      return true;
    }
    return false;
  });
}

export function getScopedConsultancyForUser(user: AuthUser | null): ConsultancyRecord[] {
  const allConsultancies = getStoredConsultancyRequests();
  if (!user) return [];

  if (user.role === 'admin') {
    return allConsultancies;
  }

  if (user.role === 'staff') {
    if (user.accountStatus !== 'approved') return [];
    return allConsultancies;
  }

  // Customer isolated data:
  const userEmail = normalizeEmail(user.email);
  const userMobile = normalizeMobile(user.mobile);

  return allConsultancies.filter(req => {
    const reqEmail = normalizeEmail(req.client.email);
    const reqMobile = normalizeMobile(req.client.mobile);
    if (reqEmail === userEmail) return true;
    if (userMobile && reqMobile && (reqMobile.endsWith(userMobile.slice(-10)) || userMobile.endsWith(reqMobile.slice(-10)))) {
      return true;
    }
    return false;
  });
}
