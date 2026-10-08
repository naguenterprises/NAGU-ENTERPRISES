import React, { useEffect, useRef } from 'react';
import { 
  Building2, 
  UserCheck, 
  Users, 
  Landmark, 
  HeartHandshake, 
  Briefcase, 
  User, 
  Layers, 
  Check, 
  ArrowRight,
  Info,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { BUSINESS_TYPES } from '../data/businessTypes';
import { BusinessType } from '../types';

interface BusinessTypeSelectorProps {
  selectedTypeId: string | null;
  onSelectType: (type: BusinessType) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const BusinessTypeSelector: React.FC<BusinessTypeSelectorProps> = ({
  selectedTypeId,
  onSelectType,
  onContinue,
  onBack,
}) => {
  const topActionRef = useRef<HTMLDivElement>(null);

  // Find currently selected object
  const currentSelected = BUSINESS_TYPES.find(t => t.id === selectedTypeId) || null;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building2': return <Building2 className="w-6 h-6" />;
      case 'UserCheck': return <UserCheck className="w-6 h-6" />;
      case 'Users': return <Users className="w-6 h-6" />;
      case 'Landmark': return <Landmark className="w-6 h-6" />;
      case 'HeartHandshake': return <HeartHandshake className="w-6 h-6" />;
      case 'Briefcase': return <Briefcase className="w-6 h-6" />;
      case 'User': return <User className="w-6 h-6" />;
      case 'Layers': return <Layers className="w-6 h-6" />;
      default: return <Building2 className="w-6 h-6" />;
    }
  };

  const handleCardClick = (type: BusinessType) => {
    onSelectType(type);
  };

  const handleButtonClick = (e: React.MouseEvent, type: BusinessType) => {
    e.stopPropagation();
    // If not selected yet, select it. If already selected, advance to next step!
    if (selectedTypeId === type.id) {
      onContinue();
    } else {
      onSelectType(type);
    }
  };

  return (
    <div className="space-y-8 pb-20 sm:pb-8">
      {/* Page Title & Instructions */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
          Select Your Business Registration Type
        </h2>
        <p className="text-sm sm:text-base text-slate-600">
          Click any business entity below to select it. The application workflow, promoter fields, and document requirements will dynamically adapt to your selection.
        </p>
      </div>

      {/* Prominent Active Selection Banner (Visible whenever an entity is selected) */}
      {currentSelected && (
        <div 
          ref={topActionRef}
          className="p-4 sm:p-5 rounded-2xl bg-blue-700 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-blue-200 uppercase tracking-wider block">
                Selected Business Entity
              </span>
              <span className="text-base sm:text-lg font-bold font-display text-white block">
                {currentSelected.name}
              </span>
              <span className="text-xs text-blue-100">
                {currentSelected.memberRoleLabel} · {currentSelected.estimatedDays}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onContinue}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-900 hover:bg-blue-50 font-bold rounded-xl text-sm shadow-sm transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>Continue to Applicant Details</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 8 Business Types Grid (Numbered 1 through 8 in required order) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {BUSINESS_TYPES.map((type, index) => {
          const isSelected = selectedTypeId === type.id;
          const numberLabel = index + 1;

          return (
            <div
              key={type.id}
              role="button"
              tabIndex={0}
              onClick={() => handleCardClick(type)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(type);
                }
              }}
              className={`group relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between text-left select-none ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/80 shadow-md ring-4 ring-blue-500/20 translate-y-[-2px]'
                  : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/60 hover:shadow-sm'
              }`}
            >
              <div>
                {/* Header Row: Icon, Number index & Status Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : 'bg-slate-100 text-blue-700 group-hover:bg-blue-50'
                    }`}>
                      {getIcon(type.icon)}
                    </div>
                    <span className="text-xs font-bold text-slate-400 font-mono">
                      #{numberLabel}
                    </span>
                  </div>

                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100/90 border border-blue-300 px-2.5 py-1 rounded-full shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      Selected
                    </span>
                  ) : type.popular ? (
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      Popular
                    </span>
                  ) : null}
                </div>

                {/* Title */}
                <h3 className={`text-base sm:text-lg font-bold font-display mb-2 transition-colors ${
                  isSelected ? 'text-blue-900' : 'text-slate-900 group-hover:text-blue-700'
                }`}>
                  {type.name}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  {type.shortDescription}
                </p>
              </div>

              {/* Card Footer: Metadata and Action Button */}
              <div className="pt-3 border-t border-slate-100/80 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Structure:</span>
                  <span className="font-semibold text-slate-700">{type.memberRoleLabel}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Turnaround:</span>
                  <span className="font-medium text-slate-700">{type.estimatedDays}</span>
                </div>

                {/* Action button inside card */}
                <button
                  type="button"
                  onClick={(e) => handleButtonClick(e, type)}
                  className={`w-full mt-3 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-700 text-white shadow-sm hover:bg-blue-800'
                      : 'bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <span>Continue with this Entity</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 opacity-60" />
                      <span>Select {type.name.split(' ')[0]}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advisory Note */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          <strong>Important Advisory:</strong> Final eligibility and document requirements will be verified by Nagu Enterprises before filing. Our compliance officers review statutory name availability and stamp duty jurisdiction prior to government submission.
        </div>
      </div>

      {/* Bottom Actions Bar */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Cancel & Return Home
        </button>

        <button
          type="button"
          onClick={onContinue}
          disabled={!selectedTypeId}
          className={`flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold transition-all ${
            selectedTypeId
              ? 'bg-blue-700 hover:bg-blue-800 text-white shadow-md cursor-pointer hover:scale-[1.01]'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          <span>Continue to Applicant Details</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Sticky Bar (Appears when scrolled or on mobile to ensure Continue button is always reachable) */}
      {currentSelected && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-lg flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-200">
          <div className="truncate">
            <span className="text-[10px] text-blue-700 font-semibold uppercase block">Selected:</span>
            <span className="text-xs font-bold text-slate-900 truncate block">
              {currentSelected.name}
            </span>
          </div>

          <button
            type="button"
            onClick={onContinue}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-md shrink-0 cursor-pointer"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
