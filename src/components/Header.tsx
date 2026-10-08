import React from 'react';
import { ShieldCheck, UserCheck, ArrowRight, User, LogOut, KeyRound, Lock, Crown, Sparkles, Building2 } from 'lucide-react';
import { NaguLogo } from './common/NaguLogo';
import { AuthUser } from '../types/auth';

interface HeaderProps {
  currentView: 'welcome' | 'register' | 'status' | 'services' | 'admin' | 'consultancy' | 'customer_portal';
  onNavigate: (view: 'welcome' | 'register' | 'status' | 'services' | 'admin' | 'consultancy' | 'customer_portal') => void;
  isAdminLoggedIn: boolean;
  currentUser: AuthUser | null;
  onOpenAuthModal: (mode?: 'signin' | 'register') => void;
  onSignOut: () => void;
  pendingStaffCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  isAdminLoggedIn,
  currentUser,
  onOpenAuthModal,
  onSignOut,
  pendingStaffCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Zone 1: Clean Brand Wordmark with Official Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('welcome')}
              className="text-left group cursor-pointer focus:outline-none transition-transform active:scale-98"
              title="Nagu Enterprises - Business Registration & Compliance Services"
            >
              <NaguLogo
                size="md"
                subtitleText="Registration • Consultancy • Compliance"
              />
            </button>
          </div>

          {/* Zone 2: Navigation Links (Clean text with hover states) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium text-slate-600">
            <button
              onClick={() => onNavigate('welcome')}
              className={`transition-colors hover:text-blue-700 py-1 ${
                currentView === 'welcome' ? 'text-blue-700 font-semibold border-b-2 border-blue-700' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('register')}
              className={`transition-colors hover:text-blue-700 py-1 ${
                currentView === 'register' ? 'text-blue-700 font-semibold border-b-2 border-blue-700' : ''
              }`}
            >
              Business Registration
            </button>
            <button
              onClick={() => onNavigate('consultancy')}
              className={`transition-colors hover:text-blue-700 py-1 relative flex items-center gap-1 ${
                currentView === 'consultancy' ? 'text-blue-700 font-semibold border-b-2 border-blue-700' : ''
              }`}
            >
              <span>Consultancy Services</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            </button>
            <button
              onClick={() => onNavigate('status')}
              className={`transition-colors hover:text-blue-700 py-1 ${
                currentView === 'status' ? 'text-blue-700 font-semibold border-b-2 border-blue-700' : ''
              }`}
            >
              Track Status
            </button>
            <button
              onClick={() => onNavigate('services')}
              className={`transition-colors hover:text-blue-700 py-1 ${
                currentView === 'services' ? 'text-blue-700 font-semibold border-b-2 border-blue-700' : ''
              }`}
            >
              All Services
            </button>
          </nav>

          {/* Zone 3: Authentication & Action Zone */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* If USER IS LOGGED IN */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                
                {/* Customer Pill & Dashboard Link */}
                {currentUser.role === 'customer' && (
                  <button
                    onClick={() => onNavigate('customer_portal')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      currentView === 'customer_portal'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100'
                    }`}
                    title="Open My Customer Portal"
                  >
                    <User className="w-3.5 h-3.5 text-blue-700" />
                    <span className="hidden sm:inline font-medium text-slate-600">Client:</span>
                    <span className="max-w-[110px] sm:max-w-[150px] truncate">{currentUser.fullName}</span>
                  </button>
                )}

                {/* Staff Pill & Workspace Link */}
                {currentUser.role === 'staff' && (
                  <button
                    onClick={() => onNavigate('admin')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      currentView === 'admin'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100'
                    }`}
                    title="Staff Workspace"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline font-medium text-slate-600">Staff:</span>
                    <span className="max-w-[100px] truncate">{currentUser.fullName}</span>
                    <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-200 text-emerald-800">Approved</span>
                  </button>
                )}

                {/* Admin Pill & Console Link */}
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => onNavigate('admin')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
                      currentView === 'admin'
                        ? 'bg-slate-900 text-white shadow-xs ring-2 ring-blue-500/20'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                    title="Nagu Enterprises Admin Console"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Admin Console</span>
                    <span className="sm:hidden">Admin</span>
                    {pendingStaffCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    )}
                  </button>
                )}

                {/* Sign Out Button */}
                <button
                  type="button"
                  onClick={onSignOut}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors border border-slate-200 flex items-center gap-1"
                  title="Sign Out of Portal"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              /* If USER IS NOT LOGGED IN */
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenAuthModal('signin')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 transition-all shadow-2xs"
                  title="Sign In with Email or Mobile (Customer, Staff, Admin)"
                >
                  <Lock className="w-3.5 h-3.5 text-blue-700" />
                  <span>Portal Login</span>
                </button>

                <button
                  onClick={() => onNavigate(currentView === 'admin' ? 'welcome' : 'admin')}
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    currentView === 'admin'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
                  }`}
                  title="Staff & Admin Portal Toggle"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>{currentView === 'admin' ? 'Exit Admin' : 'Staff Admin'}</span>
                </button>
              </div>
            )}

            {/* Quick Register CTA */}
            {currentView !== 'register' && currentView !== 'admin' && (
              <button
                onClick={() => onNavigate('register')}
                className="hidden md:inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-blue-700 text-white hover:bg-blue-800 transition-colors shadow-xs"
              >
                <span>Register Business</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Mobile Quick Sub-bar for seamless mobile-first navigation */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-100 bg-slate-50/90 px-2 py-2 text-xs font-medium text-slate-600 overflow-x-auto">
        <button
          onClick={() => onNavigate('welcome')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap ${currentView === 'welcome' ? 'bg-white text-blue-700 shadow-xs font-semibold' : ''}`}
        >
          Home
        </button>
        <button
          onClick={() => onNavigate('register')}
          className={`px-2 py-1 rounded-md whitespace-nowrap ${currentView === 'register' ? 'bg-white text-blue-700 shadow-xs font-semibold' : ''}`}
        >
          Register
        </button>
        <button
          onClick={() => onNavigate('consultancy')}
          className={`px-2 py-1 rounded-md whitespace-nowrap ${currentView === 'consultancy' ? 'bg-white text-blue-700 shadow-xs font-semibold' : ''}`}
        >
          Consultancy
        </button>
        <button
          onClick={() => onNavigate('status')}
          className={`px-2 py-1 rounded-md whitespace-nowrap ${currentView === 'status' ? 'bg-white text-blue-700 shadow-xs font-semibold' : ''}`}
        >
          Track Status
        </button>
        {currentUser?.role === 'customer' && (
          <button
            onClick={() => onNavigate('customer_portal')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${currentView === 'customer_portal' ? 'bg-blue-700 text-white shadow-xs font-bold' : 'text-blue-700 font-semibold'}`}
          >
            My Portal
          </button>
        )}
        <button
          onClick={() => onNavigate(currentView === 'admin' ? 'welcome' : 'admin')}
          className={`px-2 py-1 rounded-md whitespace-nowrap ${currentView === 'admin' ? 'bg-slate-900 text-white shadow-xs font-bold' : ''}`}
        >
          Staff Desk
        </button>
      </div>
    </header>
  );
};
