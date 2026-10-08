/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { WelcomeHero } from './components/WelcomeHero';
import { RegistrationWizard } from './components/RegistrationWizard';
import { ClientStatusTracker } from './components/ClientStatusTracker';
import { ServicesShowcase } from './components/ServicesShowcase';
import { AdminPortal } from './components/admin/AdminPortal';
import { ConsultancyLanding } from './components/consultancy/ConsultancyLanding';
import { ConsultancyRequestForm } from './components/consultancy/ConsultancyRequestForm';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { AuthModal } from './components/auth/AuthModal';
import { Footer } from './components/Footer';
import { getCurrentUser, logout, getAllStaffAccounts } from './services/authService';
import { AuthUser } from './types/auth';
import { COMPANY_CONTACT } from './data/companyInfo';
import { Mail, Phone, MapPin, X, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'welcome' | 'register' | 'status' | 'services' | 'admin' | 'consultancy' | 'customer_portal'>('welcome');
  const [trackingAppId, setTrackingAppId] = useState<string>('');
  const [selectedBusinessTypeId, setSelectedBusinessTypeId] = useState<string | undefined>(undefined);
  const [showContactModal, setShowContactModal] = useState<boolean>(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'register'>('signin');
  const [pendingStaffCount, setPendingStaffCount] = useState<number>(0);

  // Consultancy Module Sub-state
  const [isConsultancyFormOpen, setIsConsultancyFormOpen] = useState<boolean>(false);
  const [consultancyCategoryId, setConsultancyCategoryId] = useState<string | undefined>(undefined);
  const [consultancySubServiceId, setConsultancySubServiceId] = useState<string | undefined>(undefined);

  // Load active session and pending staff count on mount
  useEffect(() => {
    const refreshAuthState = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
      try {
        const staffList = await getAllStaffAccounts();
        setPendingStaffCount(staffList.filter(s => s.accountStatus === 'pending').length);
      } catch {
        // fallback
      }
    };
    refreshAuthState();
  }, [currentView]);

  const handleStartRegistration = (typeId?: string) => {
    if (typeId) {
      setSelectedBusinessTypeId(typeId);
    }
    setCurrentView('register');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenConsultancyForm = (categoryId?: string, subServiceId?: string) => {
    setConsultancyCategoryId(categoryId);
    setConsultancySubServiceId(subServiceId);
    setIsConsultancyFormOpen(true);
    setCurrentView('consultancy');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToConsultancyLanding = () => {
    setIsConsultancyFormOpen(false);
    setCurrentView('consultancy');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrackStatus = (appId?: string) => {
    if (appId) {
      setTrackingAppId(appId);
    }
    setCurrentView('status');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreServices = () => {
    setCurrentView('services');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuthModal = (mode: 'signin' | 'register' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);

    if (user.role === 'customer') {
      setCurrentView('customer_portal');
    } else if (user.role === 'staff' || user.role === 'admin') {
      setCurrentView('admin');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOut = () => {
    logout();
    setCurrentUser(null);
    setCurrentView('welcome');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Top Header */}
      <Header
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'consultancy') {
            setIsConsultancyFormOpen(false);
          }
          if (view === 'admin' && !currentUser) {
            // If user clicks staff admin while not logged in, prompt modal
            handleOpenAuthModal('signin');
            return;
          }
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isAdminLoggedIn={currentView === 'admin'}
        currentUser={currentUser}
        onOpenAuthModal={handleOpenAuthModal}
        onSignOut={handleSignOut}
        pendingStaffCount={pendingStaffCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'welcome' && (
          <WelcomeHero
            onStartRegistration={handleStartRegistration}
            onTrackStatus={() => handleTrackStatus()}
            onExploreServices={handleExploreServices}
            onExploreConsultancy={handleNavigateToConsultancyLanding}
          />
        )}

        {currentView === 'register' && (
          <RegistrationWizard
            initialBusinessTypeId={selectedBusinessTypeId}
            onCancel={() => {
              setSelectedBusinessTypeId(undefined);
              setCurrentView('welcome');
            }}
            onViewStatus={(appId) => handleTrackStatus(appId)}
            onContactSupport={() => setShowContactModal(true)}
          />
        )}

        {currentView === 'consultancy' && (
          isConsultancyFormOpen ? (
            <ConsultancyRequestForm
              initialCategoryId={consultancyCategoryId}
              initialSubServiceId={consultancySubServiceId}
              onCancel={handleNavigateToConsultancyLanding}
              onViewStatus={(id) => handleTrackStatus(id)}
              onContactSupport={() => setShowContactModal(true)}
            />
          ) : (
            <ConsultancyLanding
              onOpenConsultancyForm={handleOpenConsultancyForm}
              onNavigateToRegistration={handleStartRegistration}
              onTrackStatus={() => handleTrackStatus()}
            />
          )
        )}

        {currentView === 'status' && (
          <ClientStatusTracker
            initialAppId={trackingAppId}
            onContactSupport={() => setShowContactModal(true)}
            onNewApplication={handleStartRegistration}
          />
        )}

        {currentView === 'services' && (
          <ServicesShowcase
            onStartRegistration={handleStartRegistration}
            onTrackStatus={() => handleTrackStatus()}
          />
        )}

        {currentView === 'customer_portal' && (
          currentUser ? (
            <CustomerPortal
              currentUser={currentUser}
              onStartNewApplication={handleStartRegistration}
              onOpenConsultancy={() => handleOpenConsultancyForm()}
              onTrackSpecificApp={(id) => handleTrackStatus(id)}
              onSignOut={handleSignOut}
            />
          ) : (
            <div className="py-16 text-center space-y-4 max-w-md mx-auto">
              <ShieldAlert className="w-12 h-12 text-blue-600 mx-auto" />
              <h2 className="text-xl font-bold text-slate-900">Client Sign In Required</h2>
              <p className="text-xs text-slate-500">
                Please sign in with your registered email or mobile number to access your business applications and consultancy requests.
              </p>
              <button
                onClick={() => handleOpenAuthModal('signin')}
                className="px-6 py-2.5 rounded-xl bg-blue-700 text-white font-bold text-xs shadow-md"
              >
                Sign In to Customer Portal
              </button>
            </div>
          )
        )}

        {currentView === 'admin' && (
          <AdminPortal
            onExit={() => setCurrentView('welcome')}
            currentUser={currentUser}
            onSignOut={handleSignOut}
          />
        )}
      </main>

      {/* Corporate Footer */}
      <Footer
        onNavigate={(view) => {
          if (view === 'admin' && !currentUser) {
            handleOpenAuthModal('signin');
            return;
          }
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />

      {/* Contact Nagu Enterprises Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
                  Support & Consultation
                </span>
                <h3 className="text-xl font-bold text-slate-900 font-display">
                  Contact Nagu Enterprises
                </h3>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Phone className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800 block">Official Company Helpline</span>
                  <div className="space-y-0.5 mt-0.5">
                    <div>
                      <span className="text-slate-500 text-xs mr-1">Primary:</span>
                      <a href={`tel:${COMPANY_CONTACT.primaryPhone}`} className="text-blue-700 font-bold hover:underline font-mono">
                        {COMPANY_CONTACT.primaryPhone}
                      </a>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs mr-1">Secondary:</span>
                      <a href={`tel:${COMPANY_CONTACT.secondaryPhone}`} className="text-blue-700 font-bold hover:underline font-mono">
                        {COMPANY_CONTACT.secondaryPhone}
                      </a>
                    </div>
                  </div>
                  <span className="text-slate-400 text-xs block mt-1">{COMPANY_CONTACT.operatingHours}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Mail className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800 block">Statutory Inquiries</span>
                  <a href="mailto:naguenterprises84@gmail.com" className="text-blue-700 font-bold hover:underline">
                    naguenterprises84@gmail.com
                  </a>
                  <span className="text-slate-400 text-xs block">Official Registry Correspondence</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <MapPin className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800 block">Registered Office</span>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {COMPANY_CONTACT.registeredOffice}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowContactModal(false)}
              className="w-full py-2.5 rounded-xl bg-blue-700 text-white font-bold text-xs hover:bg-blue-800 transition-colors shadow-sm cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
