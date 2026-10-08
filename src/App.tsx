/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { WelcomeHero } from './components/WelcomeHero';
import { RegistrationWizard } from './components/RegistrationWizard';
import { ClientStatusTracker } from './components/ClientStatusTracker';
import { ServicesShowcase } from './components/ServicesShowcase';
import { AdminPortal } from './components/admin/AdminPortal';
import { ConsultancyLanding } from './components/consultancy/ConsultancyLanding';
import { ConsultancyRequestForm } from './components/consultancy/ConsultancyRequestForm';
import { Footer } from './components/Footer';
import { Mail, Phone, MapPin, X, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'welcome' | 'register' | 'status' | 'services' | 'admin' | 'consultancy'>('welcome');
  const [trackingAppId, setTrackingAppId] = useState<string>('');
  const [selectedBusinessTypeId, setSelectedBusinessTypeId] = useState<string | undefined>(undefined);
  const [showContactModal, setShowContactModal] = useState<boolean>(false);

  // Consultancy Module Sub-state
  const [isConsultancyFormOpen, setIsConsultancyFormOpen] = useState<boolean>(false);
  const [consultancyCategoryId, setConsultancyCategoryId] = useState<string | undefined>(undefined);
  const [consultancySubServiceId, setConsultancySubServiceId] = useState<string | undefined>(undefined);

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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Top Header */}
      <Header
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'consultancy') {
            setIsConsultancyFormOpen(false);
          }
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isAdminLoggedIn={currentView === 'admin'}
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

        {currentView === 'admin' && (
          <AdminPortal
            onExit={() => setCurrentView('welcome')}
          />
        )}
      </main>

      {/* Corporate Footer */}
      <Footer
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
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
                  NAGU ENTERPRISES
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Our certified Company Secretaries and corporate advisory team are available Monday through Saturday (9:30 AM to 6:30 PM IST) to assist with your business registration queries and document verification.
            </p>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 text-xs block">Official Support Email</span>
                  <a href="mailto:naguenterprises84@gmail.com" className="font-bold text-blue-900 hover:underline">
                    naguenterprises84@gmail.com
                  </a>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 text-xs block">Corporate Helpline</span>
                  <span className="font-bold text-slate-900">+91 98450 12345 / +91 80 2559 1000</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 text-xs block">Principal Office</span>
                  <span className="text-slate-800 font-medium">Prestige Meridian & Indiranagar Corporate Hub, Bengaluru, Karnataka</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowContactModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
