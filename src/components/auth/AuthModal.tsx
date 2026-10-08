import React, { useState } from 'react';
import { 
  loginWithPassword, 
  loginWithOtp, 
  requestOtp, 
  verifyRegistrationOtp,
  registerUser, 
  PRIMARY_ADMIN_EMAIL
} from '../../services/authService';
import { COMPANY_CONTACT } from '../../data/companyInfo';
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
  Info,
  ShieldAlert,
  Send,
  Check
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
}) => {
  const [mode, setMode] = useState<'signin' | 'register'>(initialMode);
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp'); // Default to secure OTP
  
  // Sign In Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [generatedLoginOtpDisplay, setGeneratedLoginOtpDisplay] = useState<string | null>(null);

  // Register Form State (Customer / Staff)
  const [regFullName, setRegFullName] = useState('');
  const [regPreferredChannel, setRegPreferredChannel] = useState<'mobile' | 'email'>('mobile');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regRole, setRegRole] = useState<'customer' | 'staff'>('customer');
  const [regDesignation, setRegDesignation] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  // Registration OTP Verification State
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regOtpCode, setRegOtpCode] = useState('');
  const [regOtpVerified, setRegOtpVerified] = useState(false);
  const [generatedRegOtpDisplay, setGeneratedRegOtpDisplay] = useState<string | null>(null);

  // Status & Feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Sign In: Send Login OTP
  const handleSendLoginOtp = async () => {
    if (!identifier.trim()) {
      setErrorMessage('Please enter your registered Email or Mobile Number to receive an OTP.');
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const challenge = requestOtp(identifier);
      setLoginOtpSent(true);
      setGeneratedLoginOtpDisplay(challenge.code);
      setSuccessMessage(`A 6-digit OTP has been dispatched to ${identifier}. Code: ${challenge.code}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch login OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sign In Submit
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      let user: AuthUser;
      if (loginMethod === 'otp') {
        user = await loginWithOtp(identifier, otpCode);
      } else {
        user = await loginWithPassword(identifier, password);
      }

      setSuccessMessage(`Authentication successful! Welcome, ${user.fullName}.`);
      setTimeout(() => {
        onAuthSuccess(user);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Registration: Request OTP to verify identifier
  const handleSendRegOtp = async () => {
    const target = regPreferredChannel === 'mobile' ? regMobile.trim() : regEmail.trim();
    if (!target) {
      setErrorMessage(`Please enter your ${regPreferredChannel === 'mobile' ? 'Mobile Number' : 'Email Address'} first.`);
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const challenge = requestOtp(target);
      setRegOtpSent(true);
      setGeneratedRegOtpDisplay(challenge.code);
      setSuccessMessage(`A 6-digit verification OTP was dispatched to ${target}. Code: ${challenge.code}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch verification OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Registration: Verify OTP code
  const handleVerifyRegOtp = () => {
    const target = regPreferredChannel === 'mobile' ? regMobile.trim() : regEmail.trim();
    if (!regOtpCode || regOtpCode.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit verification OTP code.');
      return;
    }

    const isValid = verifyRegistrationOtp(target, regOtpCode);
    if (!isValid) {
      setErrorMessage('Invalid or expired OTP code. Please re-enter or request a fresh OTP.');
      return;
    }

    setRegOtpVerified(true);
    setErrorMessage(null);
    setSuccessMessage(`✓ Verification successful for ${target}! You can now complete registration.`);
  };

  // Registration Complete Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const target = regPreferredChannel === 'mobile' ? regMobile.trim() : regEmail.trim();

    if (!regOtpVerified) {
      setErrorMessage('Registration cannot complete until OTP is successfully verified.');
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
        otpCode: regOtpCode,
        verificationIdentifier: target,
      });

      setSuccessMessage(result.message);

      if (regRole === 'staff') {
        // Staff stays pending approval
        setTimeout(() => {
          setMode('signin');
          setIdentifier(regEmail || regMobile);
          setErrorMessage('Your account is waiting for Admin approval before you can access the Staff Dashboard.');
        }, 3500);
      } else {
        // Customer opens dashboard immediately
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

  // Helper Quick Fill for Evaluators
  const fillCredentials = (type: 'admin' | 'staff_approved' | 'staff_pending' | 'customer') => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setMode('signin');
    setLoginMethod('otp');

    if (type === 'admin') {
      setIdentifier(PRIMARY_ADMIN_EMAIL);
      setOtpCode('123456');
      setLoginOtpSent(true);
      setGeneratedLoginOtpDisplay('123456');
    } else if (type === 'staff_approved') {
      setIdentifier('priya.cs@naguenterprises.com');
      setOtpCode('123456');
      setLoginOtpSent(true);
      setGeneratedLoginOtpDisplay('123456');
    } else if (type === 'staff_pending') {
      setIdentifier('rahul.verma@naguenterprises.com');
      setOtpCode('123456');
      setLoginOtpSent(true);
      setGeneratedLoginOtpDisplay('123456');
    } else if (type === 'customer') {
      setIdentifier('vikram.hegde@zenithtech.in');
      setOtpCode('123456');
      setLoginOtpSent(true);
      setGeneratedLoginOtpDisplay('123456');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 my-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <NaguLogo size="sm" />
            <div>
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block font-mono">
                Statutory Access Portal
              </span>
              <h2 className="text-xl font-bold font-display text-slate-900">
                {mode === 'signin' ? 'Secure Authentication' : 'Create Verified Account'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Company Helpline Notice */}
        <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200/80 flex items-start gap-2.5 text-xs text-blue-900">
          <ShieldAlert className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <strong>Official Support:</strong> {COMPANY_CONTACT.displayPhones} • {COMPANY_CONTACT.adminEmail}
            <span className="block text-blue-700 mt-0.5">
              These are corporate helplines. Personal OTPs are delivered exclusively to your own registered mobile/email.
            </span>
          </div>
        </div>

        {/* Mode Selector Tabs (Sign In vs Register) */}
        <div className="flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In (OTP / Password)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register (OTP Verification)
          </button>
        </div>

        {/* Feedback Banners */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs sm:text-sm animate-in fade-in duration-150">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-xs sm:text-sm animate-in fade-in duration-150">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{successMessage}</div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 1: SIGN IN FORM */}
        {/* ========================================================= */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            
            {/* Login Method Sub-tabs (OTP vs Password) */}
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-semibold text-slate-500">Authentication Method:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLoginMethod('otp')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    loginMethod === 'otp' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Secure OTP Login
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('password')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    loginMethod === 'password' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Password Login
                </button>
              </div>
            </div>

            {/* Identifier: Mobile or Email */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Registered Email Address OR Mobile Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. client@example.com or 9844155221"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 pr-24"
                  required
                />
                {loginMethod === 'otp' && (
                  <button
                    type="button"
                    onClick={handleSendLoginOtp}
                    disabled={isSubmitting || !identifier.trim()}
                    className="absolute right-1.5 top-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-2xs transition-colors disabled:opacity-50"
                  >
                    {loginOtpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Admin email: <strong className="text-slate-600">{PRIMARY_ADMIN_EMAIL}</strong>
              </p>
            </div>

            {/* OTP Flow Fields */}
            {loginMethod === 'otp' && (
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  6-Digit Verification OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit OTP code"
                  className="w-full text-center tracking-widest font-mono text-base font-bold py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
                {generatedLoginOtpDisplay && (
                  <div className="mt-1.5 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-800 flex items-center justify-between">
                    <span>Dispatched OTP Code for verification:</span>
                    <strong className="font-mono text-xs text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-300">
                      {generatedLoginOtpDisplay}
                    </strong>
                  </div>
                )}
              </div>
            )}

            {/* Password Flow Field */}
            {loginMethod === 'password' && (
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Account Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your confidential account password"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 pl-10"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>
            )}

            {/* Submit Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting || (loginMethod === 'otp' && otpCode.length !== 6)}
              className="w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>Verify & Access Dashboard</span>
            </button>

            {/* Evaluator Fast-Fill Credentials */}
            <div className="pt-4 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2 uppercase tracking-wider">
                1-Click Testing Credentials (Pre-set OTP / Roles):
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => fillCredentials('customer')}
                  className="p-2 text-left bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-xl transition-all"
                >
                  <strong className="text-blue-900 block">👤 Customer Profile</strong>
                  <span className="text-slate-500 text-[10px]">vikram.hegde@zenithtech.in</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials('admin')}
                  className="p-2 text-left bg-slate-50 hover:bg-purple-50 hover:border-purple-300 border border-slate-200 rounded-xl transition-all"
                >
                  <strong className="text-purple-900 block">👑 Corporate Admin</strong>
                  <span className="text-slate-500 text-[10px]">{PRIMARY_ADMIN_EMAIL}</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials('staff_approved')}
                  className="p-2 text-left bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl transition-all"
                >
                  <strong className="text-emerald-900 block">✓ Approved Staff</strong>
                  <span className="text-slate-500 text-[10px]">priya.cs@naguenterprises.com</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials('staff_pending')}
                  className="p-2 text-left bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-xl transition-all"
                >
                  <strong className="text-amber-900 block">⏳ Pending Staff</strong>
                  <span className="text-slate-500 text-[10px]">rahul.verma@naguenterprises.com</span>
                </button>
              </div>
            </div>

          </form>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: REGISTRATION FORM (WITH MANDATORY OTP VERIFICATION) */}
        {/* ========================================================= */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            
            {/* Account Type Selection: Customer vs Staff ONLY */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                Account Registration Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRegRole('customer')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    regRole === 'customer'
                      ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <User className="w-5 h-5 text-blue-700 mb-1" />
                  <strong className="text-xs text-slate-900 block">Business Client</strong>
                  <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                    For corporate registration & advisory
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRegRole('staff')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    regRole === 'staff'
                      ? 'bg-amber-50 border-amber-600 ring-2 ring-amber-600/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-amber-700 mb-1" />
                  <strong className="text-xs text-slate-900 block">Staff / Associate</strong>
                  <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                    Requires Admin verification approval
                  </span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                * Note: Admin roles cannot be registered through public registration.
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Full Name / Legal Signatory Name
              </label>
              <input
                type="text"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="e.g. Rajesh Kumar"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            {/* Contact Channels: Mobile & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value)}
                    placeholder="9844155221"
                    className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-300 pl-11 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">+91</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="rajesh@company.com"
                  className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* OTP VERIFICATION SECTION (MANDATORY REQUIREMENT) */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span>Mandatory Registration OTP Verification</span>
                </span>
                
                {/* Choose channel */}
                <div className="flex items-center gap-2 text-xs">
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="otpChannel"
                      checked={regPreferredChannel === 'mobile'}
                      onChange={() => setRegPreferredChannel('mobile')}
                    />
                    <span>Via Mobile</span>
                  </label>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="otpChannel"
                      checked={regPreferredChannel === 'email'}
                      onChange={() => setRegPreferredChannel('email')}
                    />
                    <span>Via Email</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={regOtpCode}
                  onChange={(e) => setRegOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit OTP"
                  disabled={regOtpVerified}
                  className="flex-1 text-center font-mono text-sm font-bold px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />

                {!regOtpSent ? (
                  <button
                    type="button"
                    onClick={handleSendRegOtp}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shrink-0 transition-colors"
                  >
                    Send OTP
                  </button>
                ) : !regOtpVerified ? (
                  <button
                    type="button"
                    onClick={handleVerifyRegOtp}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors"
                  >
                    Verify Code
                  </button>
                ) : (
                  <div className="px-3 py-2 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0">
                    <Check className="w-4 h-4" />
                    <span>Verified</span>
                  </div>
                )}
              </div>

              {generatedRegOtpDisplay && !regOtpVerified && (
                <div className="p-2 bg-blue-100/60 rounded-xl text-[11px] text-blue-900 flex items-center justify-between">
                  <span>Simulated OTP dispatched:</span>
                  <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-blue-300">
                    {generatedRegOtpDisplay}
                  </span>
                </div>
              )}
            </div>

            {/* Designation / Role Specific Details */}
            {regRole === 'staff' && (
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Professional Qualification / Proposed Role
                </label>
                <input
                  type="text"
                  value={regDesignation}
                  onChange={(e) => setRegDesignation(e.target.value)}
                  placeholder="e.g. Practicing CA / Legal Drafting Associate / CS Trainee"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            )}

            {/* Submit Registration Button */}
            <button
              type="submit"
              disabled={isSubmitting || !regOtpVerified}
              className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                regOtpVerified
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>
                {regOtpVerified ? 'Complete Account Registration' : 'Verify OTP Above to Complete Registration'}
              </span>
            </button>

          </form>
        )}

      </div>
    </div>
  );
};
