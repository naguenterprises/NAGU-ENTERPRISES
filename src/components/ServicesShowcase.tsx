import React from 'react';
import { BUSINESS_TYPES } from '../data/businessTypes';
import { 
  Building2, 
  Users, 
  Briefcase, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  FileText,
  Sparkles
} from 'lucide-react';

interface ServicesShowcaseProps {
  onStartRegistration: (typeId?: string) => void;
  onTrackStatus: () => void;
}

export const ServicesShowcase: React.FC<ServicesShowcaseProps> = ({
  onStartRegistration,
  onTrackStatus,
}) => {
  return (
    <div className="max-w-6xl mx-auto py-8 space-y-12">
      
      {/* Services Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
          Comprehensive Legal & Corporate Portfolio
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
          Registration & Compliance Services
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          From first-time company incorporation to statutory corporate secretarial maintenance, Nagu Enterprises provides end-to-end guidance for Indian entrepreneurs and enterprises.
        </p>
      </div>

      {/* Primary Business Registration Grid */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-xl font-bold text-slate-900 font-display">
            Business Incorporation Services
          </h2>
          <p className="text-xs text-slate-500">
            Select an entity to initiate your dynamic digital intake form.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BUSINESS_TYPES.map((type) => (
            <div
              key={type.id}
              className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                    {type.category.replace('_', ' / ').toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {type.estimatedDays}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 font-display">
                  {type.name}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {type.shortDescription}
                </p>

                <div className="pt-2 text-xs text-slate-500 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Includes PAN, TAN & Bank Resolution</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>SPICe+ / FiLLiP Ministry Filing</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => onStartRegistration(type.id)}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <span>Register {type.name.split(' ')[0]}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Post-Registration & Compliance Services Grid */}
      <div className="space-y-6 pt-6">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-xl font-bold text-slate-900 font-display">
            Compliance, Tax & Intellectual Property Services
          </h2>
          <p className="text-xs text-slate-500">
            Essential licenses and ongoing annual maintenance for registered companies.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'GST Registration & Filings',
              desc: 'Mandatory for interstate commerce and turnover above threshold. Includes monthly GSTR-1 & 3B return assistance.',
            },
            {
              title: 'MSME / Udyam Registration',
              desc: 'Government recognized enterprise certificate for priority sector banking, interest subsidies and tenders.',
            },
            {
              title: 'Trademark Registration',
              desc: 'Comprehensive brand, trademark and logo protection before the Controller General of Patents & Trademarks.',
            },
            {
              title: 'FSSAI Food Licensing',
              desc: 'Mandatory hygiene and safety compliance license for cloud kitchens, restaurants and food manufacturers.',
            },
            {
              title: 'Import Export Code (IEC)',
              desc: 'DGFT lifetime registration allowing businesses to import raw materials or export products internationally.',
            },
            {
              title: 'Digital Signature (DSC)',
              desc: 'Class 3 USB cryptographic token for directors, partner filings, and e-tendering portals.',
            },
            {
              title: 'Annual MCA Returns',
              desc: 'Company Secretary led AOC-4, MGT-7, and Director KYC filings to maintain compliant active legal standing.',
            },
            {
              title: 'Accounting & Payroll',
              desc: 'Monthly books of account maintenance, TDS calculation, professional tax settlement, and balance sheets.',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm font-display">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              <span className="text-[11px] font-semibold text-blue-700 block pt-1">
                Contact Nagu Enterprises Desk
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div className="bg-blue-700 text-white rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-lg">
        <h2 className="text-2xl sm:text-3xl font-bold font-display">
          Ready to Start Your Business Registration?
        </h2>
        <p className="text-blue-100 text-sm max-w-xl mx-auto">
          Begin your application now. Our digital onboarding wizard takes less than 10 minutes to complete.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onStartRegistration()}
            className="px-6 py-3 bg-white text-blue-800 font-bold rounded-xl text-sm hover:bg-blue-50 transition-colors shadow-sm"
          >
            START NEW APPLICATION
          </button>
          <button
            type="button"
            onClick={onTrackStatus}
            className="px-6 py-3 bg-blue-800 text-white font-bold rounded-xl text-sm hover:bg-blue-900 transition-colors border border-blue-600"
          >
            TRACK EXISTING APPLICATION
          </button>
        </div>
      </div>

    </div>
  );
};
