import React from 'react';
import { 
  Building2, 
  Users, 
  Briefcase, 
  User, 
  ShieldCheck, 
  FileCheck2, 
  ArrowRight, 
  Search, 
  Clock, 
  Sparkles,
  Lock,
  Headphones
} from 'lucide-react';
import heroImage from '../assets/images/nagu_corporate_office_1791443035400.jpg';

interface WelcomeHeroProps {
  onStartRegistration: (typeId?: string) => void;
  onTrackStatus: () => void;
  onExploreServices: () => void;
  onExploreConsultancy?: () => void;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({
  onStartRegistration,
  onTrackStatus,
  onExploreServices,
  onExploreConsultancy,
}) => {
  return (
    <div className="space-y-12 pb-16">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Headlines & Actions */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                MCA & RoC Certified Corporate Registration Desk
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight font-display leading-[1.1]">
                  NAGU ENTERPRISES
                </h1>
                <p className="text-lg sm:text-2xl font-semibold text-blue-700 font-display">
                  Business Registration & Compliance Services
                </p>
              </div>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Register your business through a simple and secure online process. 
                From Private Limited Companies and LLPs to Sole Proprietorships, our dedicated 
                corporate secretarial and legal experts handle end-to-end documentation, name approvals, 
                and statutory government filings.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  onClick={() => onStartRegistration()}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl text-base shadow-md hover:shadow-lg transition-all"
                >
                  <span>START NEW APPLICATION</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={onTrackStatus}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-xl text-base border border-slate-300 shadow-xs transition-colors"
                >
                  <Search className="w-5 h-5 text-slate-600" />
                  <span>CHECK APPLICATION STATUS</span>
                </button>
              </div>

              {/* Trust signals */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-100 text-slate-600 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Confidential</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>MCA Scrutinized</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Masked KYC Security</span>
                </div>
              </div>

            </div>

            {/* Right Column: Corporate Visual Asset & Quick Intake Box */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100 group">
                <img
                  src={heroImage}
                  alt="Nagu Enterprises corporate advisory office and documentation desk"
                  className="w-full h-72 sm:h-88 object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                    Client Onboarding Portal
                  </span>
                  <h3 className="text-xl font-bold font-display text-white mt-1">
                    Seamless Digital Registration
                  </h3>
                  <p className="text-xs text-slate-200 mt-1 line-clamp-2">
                    Multi-entity intake workflow customized for directors, partners, and single promoters with automated KYC checks.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Service Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
            Core Registration & Compliance Categories
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Choose the right legal framework for your venture. Nagu Enterprises provides dedicated guidance across corporate, partnership, and individual enterprise formations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* 1. Company Registration */}
          <div 
            onClick={() => onStartRegistration('pvt_ltd')}
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1 font-display group-hover:text-blue-700">
                Company Registration
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                Private Limited, OPC, Public Ltd, and Section 8 non-profit incorporations with MCA SPICe+ filing.
              </p>
            </div>
            <div className="text-xs font-semibold text-blue-700 flex items-center gap-1">
              <span>Start Application</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. LLP Registration */}
          <div 
            onClick={() => onStartRegistration('llp')}
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3 group-hover:bg-indigo-700 group-hover:text-white transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1 font-display group-hover:text-indigo-700">
                LLP Registration
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                Limited Liability Partnership with FiLLiP forms, agreement drafting, and designated partner DPIN allotment.
              </p>
            </div>
            <div className="text-xs font-semibold text-indigo-700 flex items-center gap-1">
              <span>Start Application</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 3. Partnership Firm */}
          <div 
            onClick={() => onStartRegistration('partnership_firm')}
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:bg-amber-700 group-hover:text-white transition-colors">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1 font-display group-hover:text-amber-700">
                Partnership Firm
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                Traditional partnership deed drafting, registrar of firms (RoF) registration, and PAN allocation.
              </p>
            </div>
            <div className="text-xs font-semibold text-amber-700 flex items-center gap-1">
              <span>Start Application</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 4. Proprietorship */}
          <div 
            onClick={() => onStartRegistration('proprietorship')}
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                <User className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1 font-display group-hover:text-emerald-700">
                Proprietorship
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                Sole proprietor identity, Udyam MSME, GSTIN trade certification, and current account bank resolution.
              </p>
            </div>
            <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <span>Start Application</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 5. Compliance Services */}
          <div 
            onClick={onExploreServices}
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-3 group-hover:bg-purple-700 group-hover:text-white transition-colors">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1 font-display group-hover:text-purple-700">
                Compliance Services
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                Post-incorporation filings, annual MCA returns, GST periodic returns, trademark protection & accounting.
              </p>
            </div>
            <div className="text-xs font-semibold text-purple-700 flex items-center gap-1">
              <span>View Services</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>

        {/* New Spotlight: Consultancy Services Module */}
        {onExploreConsultancy && (
          <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                NEW MODULE: STRATEGIC CONSULTANCY SERVICES
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                Business Plans, Startup India, DPR Reports & Funding
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Unlock government subsidies, DPIIT recognition, bank loan documentation (CMA/DPR), trademark protection, and structured corporate advisory.
              </p>
            </div>

            <button
              onClick={onExploreConsultancy}
              className="w-full md:w-auto px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Explore Consultancy Services</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Legal Disclaimer Box */}
        <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            <strong className="text-slate-800 font-semibold">Statutory Verification Note:</strong> Final eligibility and document requirements will be verified by Nagu Enterprises before statutory filing with the Ministry of Corporate Affairs (MCA), Registrar of Companies (RoC), or local registration authorities.
          </p>
        </div>

      </section>

      {/* How the Process Works (3 Steps) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-12">
          <div className="max-w-3xl mb-8">
            <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold">
              Simplified Client Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display mt-1">
              How Your Business Registration Works
            </h2>
            <p className="text-slate-300 text-sm mt-2">
              We eliminated bureaucratic confusion with a clean digital onboarding system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="font-semibold text-lg text-white font-display">
                Select Entity & Enter Details
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Pick your business type (Pvt Ltd, LLP, OPC, etc.). Fill applicant, promoter, and proposed names with clear dynamic prompts.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="font-semibold text-lg text-white font-display">
                Upload KYC & Office Proofs
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Upload self-attested PAN, Aadhaar, address proofs and property documents in our secure upload area.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="font-semibold text-lg text-white font-display">
                Track Online to Certificate
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Receive your unique Application ID (NE-BR-YYYY-XXXX). Track live progress stages as our legal team files with the authorities.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
