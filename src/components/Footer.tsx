import React from 'react';
import { ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import { NaguLogo } from './common/NaguLogo';
import { COMPANY_CONTACT } from '../data/companyInfo';

interface FooterProps {
  onNavigate: (view: 'welcome' | 'register' | 'status' | 'services' | 'admin' | 'consultancy') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-4">
            <NaguLogo
              variant="dark"
              size="md"
              subtitleText="Business Registration & Compliance Services"
            />

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md">
              Professional corporate advisory, Ministry of Corporate Affairs (MCA) filings, Registrar of Companies liaison, and post-incorporation statutory compliance.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Registered Corporate Services Practice · Strict KYC Security</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest">
              Portal Navigation
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('welcome')}
                  className="hover:text-white transition-colors"
                >
                  Home & Overview
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="hover:text-white transition-colors"
                >
                  Business Registration
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('consultancy')}
                  className="hover:text-white text-blue-300 font-medium transition-colors"
                >
                  Consultancy Services
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('status')}
                  className="hover:text-white transition-colors"
                >
                  Check Application Status
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('services')}
                  className="hover:text-white transition-colors"
                >
                  All Business Services
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('admin')}
                  className="hover:text-white text-blue-400 transition-colors"
                >
                  Staff Admin Desk
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest">
              Client Advisory Desk
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>naguenterprises84@gmail.com</span>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span className="font-mono">{COMPANY_CONTACT.displayPhones}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>{COMPANY_CONTACT.registeredOffice}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Disclaimer & Copyright */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} Nagu Enterprises. All rights reserved. Final registration and statutory approval subject to Ministry of Corporate Affairs (MCA) / RoC authority.
          </p>
          <div className="flex items-center gap-4">
            <span>Confidentiality Guaranteed</span>
            <span>·</span>
            <span>MCA SPICe+ Compliant</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
