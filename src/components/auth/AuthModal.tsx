import React, { useState } from 'react';
import { 
  loginWithPassword, 
  loginWithOtp, 
  requestOtp, 
  registerUser, 
  PRIMARY_ADMIN_EMAIL,
  PRIMARY_ADMIN_MOBILE
} from '../../services/authService';
import { AuthUser } from '../../types/auth';
import { 
  X, 
  ShieldCheck, 
  UserCheck, 
  KeyRound, 
  Mail, 
  Phone, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  User, 
  Building2,
  Clock,
  Info
} from 'lucide-react';
import { NaguLogo } from '../common/NaguLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AuthUser) => void;
  initialMode?: 'signin' | 'register';
  initialRoleFilter?: 'all' | 'staff' | 'admin' | 'customer';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'signin',
  initialRoleFilter = 'all',
}) => {
  const [mode, setMode] = useState<'signin' | 'register'>(initialMode);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  
  // Sign In Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtpDisplay, setGeneratedOtpDisplay] = useState<string | null>(null);

  // Register Form State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<'customer' | 'staff'>('customer');
  const [regDesignation, setRegDesignation] = useState('');

  // Status & Feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      let user: AuthUser;
      if (loginMethod === 'password') {
        user = await loginWithPassword(identifier, password);
      } else {
        user = await loginWithOtp(identifier, otpCode);
      }
      setSuccessMessage(`Welcome back, ${user.fullName}!`);
      setTimeout(() => {
        onAuthSuccess(user);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async () => {
    if (!identifier.trim()) {
      setErrorMessage('Please enter your registered Email or Mobile Number to receive an OTP.');
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const challenge = requestOtp(identifier);
      setOtpSent(true);
      setGeneratedOtpDisplay(challenge.code);
      setSuccessMessage(`A 6-digit OTP has been dispatched to ${identifier}. Code: ${challenge.code}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both password entries.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerUser({
        fullName: regFullName,
        email: regEmail,
        mobile: regMobile,
        password: regPassword,
        requestedRole: regRole, // STRICTLY CUSTOMER OR STAFF
        designation: regDesignation,
      });

      setSuccessMessage(result.message);

      if (regRole === 'staff') {
        // Staff stays pending; switch to sign in view after notification
        setTimeout(() => {
          setMode('signin');
          setIdentifier(regEmail);
        }, 4000);
      } else {
        // Customer can log in immediately
        setTimeout(() => {
          onAuthSuccess(result.user);
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick fill helper for evaluator convenience
  const fillCredentials = (type: 'admin' | 'staff_approved' | 'staff_pending' | 'customer') => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setMode('signin');
    setLoginMethod('password');

    if (type === 'admin') {
      setIdentifier(PRIMARY_ADMIN_EMAIL);
      setPassword('Admin@Nagu2026!');
    } else if (type === 'staff_approved') {
      setIdentifier('priya.cs@naguenterprises.com');
      setPassword('Staff@Priya2026!');
    } else if (type === 'staff_pending') {
      setIdentifier('rahul.verma@naguenterprises.com');
      setPassword('Staff@Rahul2026!');
    } else if (type === 'customer') {
      setIdentifier('vikram.hegde@zenithtech.in');
      setPassword('Client@Vikram2026!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <NaguLogo size="sm" variant="dark" showSubtitle={false} />
            <div>
              <h2 className="text-xl font-bold font-display">
                {mode === 'signin' ? 'Sign In to Nagu Enterprises' : 'Create New Account'}
              </h2>
              <p className="text-xs text-blue-200 mt-0.5">
                {mode === 'signin' 
                  ? 'Access Customer Dashboard, Staff Workspace, or Admin Console' 
                  : 'Register for Client Access or apply for Staff Associate Credentials'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 mt-5 bg-white/10 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                mode === 'signin' ? 'bg-white text-blue-900 shadow-xs' : 'text-blue-100 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                mode === 'register' ? 'bg-white text-blue-900 shadow-xs' : 'text-blue-100 hover:text-white'
              }`}
            >
              Register Account
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* =========================================
              SIGN IN FORM
              ========================================= */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              
              {/* Sign in method toggle */}
              <div className="flex items-center justify-between text-xs pb-1">
                <span className="font-semibold text-slate-700">Verification Method:</span>
                <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => { setLoginMethod('password'); setOtpSent(false); }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      loginMethod === 'password' ? 'bg-blue-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMethod('otp')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      loginMethod === 'otp' ? 'bg-blue-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Secure OTP
                  </button>
                </div>
              </div>

              {/* Identifier Input (Email OR Mobile) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Registered Email OR Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    {identifier.includes('@') ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. client@example.com or 9845012345"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-medium"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Customers and staff can sign in using their registered email or 10-digit mobile number.
                </p>
              </div>

              {/* Password Mode */}
              {loginMethod === 'password' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Account Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setLoginMethod('otp')}
                      className="text-[11px] text-blue-700 hover:underline"
                    >
                      Forgot password? Use OTP
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    />
                  </div>
                </div>
              )}

              {/* OTP Mode */}
              {loginMethod === 'otp' && (
                <div className="space-y-3 p-3.5 rounded-xl bg-blue-50/50 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900">One-Time Password (OTP)</span>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isSubmitting}
                      className="text-xs font-bold text-blue-700 hover:text-blue-900 underline"
                    >
                      {otpSent ? 'Resend OTP' : 'Send 6-digit OTP'}
                    </button>
                  </div>

                  {otpSent && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 6-digit OTP (e.g. 123456)"
                        className="w-full px-4 py-2.5 rounded-xl border border-blue-300 text-center font-mono tracking-widest text-lg font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                      />
                      {generatedOtpDisplay && (
                        <div className="text-[11px] text-blue-800 bg-blue-100/70 p-2 rounded-lg flex items-center justify-between">
                          <span>Verification code: <strong className="font-mono text-xs">{generatedOtpDisplay}</strong></span>
                          <button
                            type="button"
                            onClick={() => setOtpCode(generatedOtpDisplay)}
                            className="font-bold underline text-blue-900"
                          >
                            Auto-fill
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Submit Sign In Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>Sign In Securely</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* =========================================
              REGISTER ACCOUNT FORM
              ========================================= */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              
              {/* Account Type Selector - ONLY CUSTOMER OR STAFF (NO ADMIN!) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Account Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('customer')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      regRole === 'customer'
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <User className="w-4 h-4 text-blue-700" />
                      <span>Customer / Client</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Business founder or entrepreneur registering entities & booking consultancy.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('staff')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      regRole === 'staff'
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Building2 className="w-4 h-4 text-blue-700" />
                      <span>Staff Member</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Internal CA, CS, or legal associate. Requires administrative approval.
                    </p>
                  </button>
                </div>
              </div>

              {/* Staff Warning Banner */}
              {regRole === 'staff' && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed text-[11px]">
                    <strong>Staff Approval Policy:</strong> Newly registered staff accounts are set to <strong>PENDING</strong> status. An Administrator (naguenterprises84@gmail.com) must review and approve your account before access to the Staff Dashboard is granted.
                  </p>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              {/* Email & Mobile 2-column */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">10-Digit Mobile</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="9845012345"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-mono"
                  />
                </div>
              </div>

              {/* Optional Staff Designation */}
              {regRole === 'staff' && (
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Designation / Department</label>
                  <input
                    type="text"
                    value={regDesignation}
                    onChange={(e) => setRegDesignation(e.target.value)}
                    placeholder="e.g. Associate Company Secretary"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
              )}

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Confirm Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Re-type password"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Submit Register Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>{regRole === 'staff' ? 'Submit Staff Registration' : 'Create Customer Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* =========================================
              TEST / DEMO QUICK LOGIN HELPER
              ========================================= */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400">
                1-Click Evaluator Accounts:
              </span>
              <span className="text-[10px] text-blue-700">Pre-seeded credentials</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => fillCredentials('admin')}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-left transition-colors flex items-center gap-1.5 border border-slate-200"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                <span className="truncate">Admin (naguenterprises84)</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('staff_approved')}
                className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-left transition-colors flex items-center gap-1.5 border border-emerald-200"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Staff (Priya, CS - Approved)</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('staff_pending')}
                className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-left transition-colors flex items-center gap-1.5 border border-amber-200"
                title="Tests the pending approval blocking requirement"
              >
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">Staff (Rahul - Pending)</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('customer')}
                className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold text-left transition-colors flex items-center gap-1.5 border border-blue-200"
              >
                <User className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                <span className="truncate">Customer (Vikramaditya)</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
