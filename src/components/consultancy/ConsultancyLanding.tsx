import React, { useState } from 'react';
import { CONSULTANCY_CATEGORIES } from '../../data/consultancyServices';
import { ConsultancyCategoryDef, ConsultancySubService } from '../../types/consultancy';
import { 
  Rocket, 
  Landmark, 
  Building2, 
  Calculator, 
  ShieldAlert, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  PhoneCall, 
  Users, 
  TrendingUp, 
  FileText,
  Search,
  Award
} from 'lucide-react';

interface ConsultancyLandingProps {
  onOpenConsultancyForm: (categoryId?: string, subServiceId?: string) => void;
  onNavigateToRegistration: (typeId?: string) => void;
  onTrackStatus: () => void;
}

export const ConsultancyLanding: React.FC<ConsultancyLandingProps> = ({
  onOpenConsultancyForm,
  onNavigateToRegistration,
  onTrackStatus,
}) => {
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Rocket': return <Rocket className="w-5 h-5 text-blue-600" />;
      case 'Landmark': return <Landmark className="w-5 h-5 text-indigo-600" />;
      case 'Building2': return <Building2 className="w-5 h-5 text-emerald-600" />;
      case 'Calculator': return <Calculator className="w-5 h-5 text-amber-600" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-purple-600" />;
      default: return <Sparkles className="w-5 h-5 text-blue-600" />;
    }
  };

  // Filter sub-services based on category and search query
  const displayedCategories = CONSULTANCY_CATEGORIES.map(cat => {
    if (activeCategoryId !== 'all' && cat.id !== activeCategoryId) {
      return null;
    }

    const filteredServices = cat.subServices.filter(svc => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return svc.name.toLowerCase().includes(q) || svc.description.toLowerCase().includes(q);
    });

    if (filteredServices.length === 0) return null;

    return {
      ...cat,
      subServices: filteredServices,
    };
  }).filter(Boolean) as ConsultancyCategoryDef[];

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white shadow-xl border border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 px-6 py-12 sm:px-12 sm:py-16 max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-6">
            <Award className="w-3.5 h-3.5 text-blue-300" />
            <span>NAGU ENTERPRISES • STRATEGIC ADVISORY & CONSULTING</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight font-display">
            Business & Startup Consultancy, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
              Funding Schemes & Compliance
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Accelerate your enterprise from ideation to scale. Get expert guidance on business plans, government subsidies, Startup India recognition, bank DPRs, ROC compliance, and intellectual property.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onOpenConsultancyForm()}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30 transition-all hover:translate-y-[-1px] cursor-pointer"
            >
              <span>Request Strategic Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onTrackStatus}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all cursor-pointer"
            >
              <Clock className="w-4 h-4 text-blue-300" />
              <span>Track Consultancy Status</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-slate-300">
            <div>
              <div className="text-2xl font-black text-white font-display">500+</div>
              <div className="text-xs text-slate-400 mt-0.5">Startups & MSMEs Guided</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-display">₹45 Cr+</div>
              <div className="text-xs text-slate-400 mt-0.5">Subsidies & Loans Facilitated</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-display">100%</div>
              <div className="text-xs text-slate-400 mt-0.5">Confidential & Compliant</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-display">24-48 Hrs</div>
              <div className="text-xs text-slate-400 mt-0.5">Advisory Turnaround</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
              Consultancy Service Domains
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Select a domain or browse our end-to-end corporate services below.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search services (e.g. DPR, Trademark)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveCategoryId('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
              activeCategoryId === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Services ({CONSULTANCY_CATEGORIES.reduce((acc, c) => acc + c.subServices.length, 0)})
          </button>
          {CONSULTANCY_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                activeCategoryId === cat.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.name} ({cat.subServices.length})
            </button>
          ))}
        </div>
      </div>

      {/* Service Cards grouped by Categories */}
      <div className="space-y-10">
        {displayedCategories.map((cat) => (
          <div key={cat.id} className="space-y-4">
            
            {/* Category Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                  {getCategoryIcon(cat.iconName)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-display">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {cat.shortDescription}
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                {cat.subServices.length} offerings
              </span>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cat.subServices.map((svc: ConsultancySubService) => {
                const isRegistrationService = cat.id === 'registration_licensing' && 
                  ['pvt_ltd_service', 'opc_service', 'llp_service', 'partnership_firm_service', 'proprietorship_service', 'section_8_service'].includes(svc.id);

                return (
                  <div
                    key={svc.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {svc.name}
                        </h4>
                        {svc.popular && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                            Popular
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {svc.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
                      {svc.estimatedTimeline && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          <span>Timeline: <strong>{svc.estimatedTimeline}</strong></span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenConsultancyForm(cat.id, svc.id)}
                          className="flex-1 py-2 px-3 rounded-lg text-xs font-bold bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white transition-colors border border-blue-200 hover:border-blue-600 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>Get Consultation</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        {svc.hasApplyNow && (
                          <button
                            onClick={() => {
                              if (isRegistrationService) {
                                // Match to business registration ID if entity setup
                                const mapping: Record<string, string> = {
                                  pvt_ltd_service: 'pvt_ltd',
                                  opc_service: 'opc',
                                  llp_service: 'llp',
                                  partnership_firm_service: 'partnership_firm',
                                  proprietorship_service: 'proprietorship',
                                  section_8_service: 'section_8',
                                };
                                onNavigateToRegistration(mapping[svc.id]);
                              } else {
                                onOpenConsultancyForm(cat.id, svc.id);
                              }
                            }}
                            className="py-2 px-3 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>Apply Now</span>
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        ))}

        {displayedCategories.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <Search className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No consultancy services match your search.</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategoryId('all'); }}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              Clear filters and view all services
            </button>
          </div>
        )}
      </div>

      {/* Corporate Advisory Assurance Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-8 sm:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Nagu Enterprises Client Guarantee
          </div>
          <h3 className="text-2xl font-bold font-display">
            Need customized advisory for unique business requirements?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Our multi-disciplinary team comprising Practicing Company Secretaries (ACS/FCS), Chartered Accountants (FCA), and senior business consultants provides bespoke corporate strategy sessions.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <button
            onClick={() => onOpenConsultancyForm()}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold bg-white text-slate-900 hover:bg-slate-100 transition-colors shadow-md cursor-pointer"
          >
            Submit Custom Request
          </button>
          <a
            href="tel:+919845012345"
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-colors flex items-center justify-center gap-2"
          >
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            <span>Call Advisory Desk</span>
          </a>
        </div>
      </div>

    </div>
  );
};
