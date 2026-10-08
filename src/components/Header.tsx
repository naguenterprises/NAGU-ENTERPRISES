import React from 'react';
import { ShieldCheck, UserCheck, ArrowRight, PhoneCall } from 'lucide-react';
import { NaguLogo } from './common/NaguLogo';

interface HeaderProps {
  currentView: 'welcome' | 'register' | 'status' | 'services' | 'admin' | 'consultancy';
  onNavigate: (view: 'welcome' | 'register' | 'status' | 'services' | 'admin' | 'consultancy') => void;
  isAdminLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  isAdminLoggedIn,
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
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
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

          {/* Zone 3: Primary Action & Portal Mode Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate(currentView === 'admin' ? 'welcome' : 'admin')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                currentView === 'admin'
                  ? 'bg-slate-900 text-white shadow-sm hover:bg-slate-800'
                  : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
              }`}
              title="Toggle between Client Portal and Nagu Staff Administration"
            >
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>{currentView === 'admin' ? 'Exit Staff Portal' : 'Staff Admin'}</span>
            </button>

            {currentView !== 'register' && currentView !== 'admin' && (
              <button
                onClick={() => onNavigate('register')}
                className="hidden sm:inline-flex items-center gap-1 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-blue-700 text-white hover:bg-blue-800 transition-colors shadow-sm"
              >
                <span>Register Business</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Quick Sub-bar for seamless mobile-first navigation */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 bg-slate-50/80 px-2 py-2 text-xs font-medium text-slate-600">
        <button
          onClick={() => onNavigate('welcome')}
          className={`px-3 py-1 rounded-md ${currentView === 'welcome' ? 'bg-white text-blue-700 shadow-xs font-semibold' : ''}`}
        >
          Home
        </button>
        <button
          onClick={() => onNavigate('register')}
          className={`px-2.5 py-1 rounded-md ${currentView === 'register' ? 'bg-white text-blue-700 shadow-xs font-semibold' : ''}`}
        >
          Register
        </button>
        <button
          onClick={() => onNavigate('consultancy')}
          className={`px-2.5 py-1 rounded-md ${currentView === 'consultancy' ? 'bg-white text-blue-700 shadow-xs font-semibold' : ''}`}
        >
          Consultancy
        </button>
        <button
          onClick={() => onNavigate('status')}
          className={`px-3 py-1 rounded-md ${currentView === 'status' ? 'bg-white text-blue-700 shadow-xs font-semibold' : ''}`}
        >
          Track Status
        </button>
        <button
          onClick={() => onNavigate('services')}
          className={`px-3 py-1 rounded-md ${currentView === 'services' ? 'bg-white text-blue-700 shadow-xs font-semibold' : ''}`}
        >
          Services
        </button>
      </div>
    </header>
  );
};
