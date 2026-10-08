import React, { useState } from 'react';
import { ShieldCheck, ArrowLeft, Send, AlertCircle, FileLock2, RefreshCw, ArrowRight } from 'lucide-react';
import { ValidationErrorItem } from '../../services/applicationService';

interface DeclarationStepProps {
  onBack: () => void;
  onSubmit: (declarationsAccepted: boolean) => void;
  isSubmitting: boolean;
  submissionError?: string | null;
  validationErrors?: ValidationErrorItem[];
  onJumpToStep?: (step: number) => void;
  onClearError?: () => void;
}

export const DeclarationStep: React.FC<DeclarationStepProps> = ({
  onBack,
  onSubmit,
  isSubmitting,
  submissionError,
  validationErrors = [],
  onJumpToStep,
  onClearError,
}) => {
  const [chk1, setChk1] = useState(false);
  const [chk2, setChk2] = useState(false);
  const [chk3, setChk3] = useState(false);
  const [localError, setLocalError] = useState('');

  const allAccepted = chk1 && chk2 && chk3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allAccepted) {
      setLocalError('Please confirm all three statutory declaration checkboxes to proceed with filing.');
      return;
    }
    setLocalError('');
    if (onClearError) onClearError();
    onSubmit(allAccepted);
  };

  const getStepName = (step: number) => {
    switch (step) {
      case 1: return 'Entity Type';
      case 2: return 'Applicant Details';
      case 3: return 'Promoters / Members';
      case 4: return 'Business & Names';
      case 5: return 'Registered Office';
      case 6: return 'Document Upload';
      case 7: return 'Review';
      default: return `Step ${step}`;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
          Statutory Declaration & Authorization
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Review the formal legal declarations authorizing Nagu Enterprises to represent you before the relevant authorities and prepare incorporation filings.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
        
        <div className="flex items-center gap-3 p-4 bg-blue-50/70 border border-blue-200 rounded-xl">
          <FileLock2 className="w-5 h-5 text-blue-700 shrink-0" />
          <p className="text-xs sm:text-sm text-blue-900 leading-relaxed font-medium">
            By proceeding, you grant Nagu Enterprises professional mandate to prepare and verify documentation for your entity registration under the Companies Act 2013 / LLP Act 2008 / relevant Indian statutes.
          </p>
        </div>

        {/* Local Checkbox Warning */}
        {localError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
            <span>{localError}</span>
          </div>
        )}

        {/* Real Submission / Persistence Error Alert Box */}
        {submissionError && (
          <div className="p-5 rounded-2xl bg-red-50 border-2 border-red-300 text-red-900 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 shrink-0 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-bold text-base text-red-950 font-display">
                  Application Submission Could Not Be Completed
                </h4>
                <p className="text-xs sm:text-sm text-red-800 mt-1 leading-relaxed">
                  {submissionError}
                </p>
              </div>
            </div>

            {/* List of specific validation issues with jump buttons */}
            {validationErrors.length > 0 && (
              <div className="pt-2 border-t border-red-200/80 space-y-2">
                <span className="text-xs font-bold text-red-950 uppercase tracking-wider block">
                  Items Requiring Attention ({validationErrors.length}):
                </span>
                <div className="space-y-1.5">
                  {validationErrors.map((err, idx) => (
                    <div 
                      key={idx}
                      className="p-2.5 bg-white rounded-xl border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <span className="text-slate-800 font-medium">
                        • {err.message}
                      </span>
                      {onJumpToStep && (
                        <button
                          type="button"
                          onClick={() => onJumpToStep(err.step)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline shrink-0"
                        >
                          <span>Fix in {getStepName(err.step)}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-red-700">
                Please resolve any missing items or retry saving your application.
              </span>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Submission</span>
              </button>
            </div>
          </div>
        )}

        {/* 3 Checkboxes */}
        <div className="space-y-4 pt-2">
          
          {/* Checkbox 1 */}
          <label className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white cursor-pointer transition-colors group">
            <input
              type="checkbox"
              checked={chk1}
              onChange={(e) => {
                setChk1(e.target.checked);
                setLocalError('');
                if (onClearError) onClearError();
              }}
              className="w-5 h-5 rounded border-slate-300 text-blue-700 focus:ring-blue-500 mt-0.5 cursor-pointer"
            />
            <span className="text-sm text-slate-800 font-medium leading-relaxed group-hover:text-slate-900">
              I confirm that the information provided in this application is true, accurate, and correct to the best of my knowledge and belief.
            </span>
          </label>

          {/* Checkbox 2 */}
          <label className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white cursor-pointer transition-colors group">
            <input
              type="checkbox"
              checked={chk2}
              onChange={(e) => {
                setChk2(e.target.checked);
                setLocalError('');
                if (onClearError) onClearError();
              }}
              className="w-5 h-5 rounded border-slate-300 text-blue-700 focus:ring-blue-500 mt-0.5 cursor-pointer"
            />
            <span className="text-sm text-slate-800 font-medium leading-relaxed group-hover:text-slate-900">
              I confirm that the documents uploaded belong to the applicant/entity concerned and are genuine, unadulterated copies of the original records.
            </span>
          </label>

          {/* Checkbox 3 */}
          <label className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white cursor-pointer transition-colors group">
            <input
              type="checkbox"
              checked={chk3}
              onChange={(e) => {
                setChk3(e.target.checked);
                setLocalError('');
                if (onClearError) onClearError();
              }}
              className="w-5 h-5 rounded border-slate-300 text-blue-700 focus:ring-blue-500 mt-0.5 cursor-pointer"
            />
            <span className="text-sm text-slate-800 font-medium leading-relaxed group-hover:text-slate-900">
              I authorize Nagu Enterprises to use the information and documents for the selected registration and related professional compliance services.
            </span>
          </label>

        </div>

        {/* Regulatory note */}
        <div className="pt-4 border-t border-slate-100 flex items-start gap-2.5 text-xs text-slate-500 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            Final registration, approval and statutory requirements are subject to the applicable authority and verification (MCA, RoC, GSTN, MSME, or Registrar of Firms).
          </span>
        </div>

      </div>

      {/* Bottom Nav */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Review</span>
        </button>

        <button
          type="submit"
          disabled={!allAccepted || isSubmitting}
          className={`flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold transition-all shadow-md ${
            allAccepted && !isSubmitting
              ? 'bg-blue-700 hover:bg-blue-800 text-white hover:shadow-lg cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Verifying & Saving Application...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>SUBMIT APPLICATION</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
