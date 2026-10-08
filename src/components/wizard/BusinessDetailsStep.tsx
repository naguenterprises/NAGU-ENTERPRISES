import React, { useState } from 'react';
import { BusinessDetails, BusinessNature, BusinessType } from '../../types';
import { Briefcase, ArrowLeft, ArrowRight, Info, AlertCircle } from 'lucide-react';

interface BusinessDetailsStepProps {
  businessType: BusinessType;
  data: BusinessDetails;
  onChange: (updated: BusinessDetails) => void;
  onNext: () => void;
  onBack: () => void;
}

const BUSINESS_NATURE_OPTIONS: BusinessNature[] = [
  'Technology',
  'Services',
  'Consulting',
  'Trading',
  'Manufacturing',
  'Transport',
  'Construction',
  'Solar / Renewable Energy',
  'Education',
  'Food',
  'Other',
];

export const BusinessDetailsStep: React.FC<BusinessDetailsStepProps> = ({
  businessType,
  data,
  onChange,
  onNext,
  onBack,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!data.proposedName1.trim()) {
      newErrors.proposedName1 = 'Primary Proposed Name is required.';
    }

    if (!data.mainActivity.trim()) {
      newErrors.mainActivity = 'Main business activity summary is required.';
    }

    if (!data.businessDescription.trim() || data.businessDescription.length < 20) {
      newErrors.businessDescription = 'Please provide a detailed description (at least 20 characters) explaining your products/services.';
    }

    if (data.natureOfBusiness === 'Other' && !data.otherNatureText?.trim()) {
      newErrors.otherNatureText = 'Please specify your industry/nature of business.';
    }

    if (businessType.id === 'section_8' && !data.nonProfitObjective?.trim()) {
      newErrors.nonProfitObjective = 'Please specify the charitable / non-profit objective.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  const handleFieldChange = (field: keyof BusinessDetails, value: any) => {
    onChange({
      ...data,
      [field]: value,
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Suffix helper based on entity type
  const getEntitySuffix = () => {
    switch (businessType.id) {
      case 'pvt_ltd': return 'PRIVATE LIMITED';
      case 'opc': return '(OPC) PRIVATE LIMITED';
      case 'public_ltd': return 'LIMITED';
      case 'llp': return 'LLP';
      case 'partnership_firm': return '& CO. / ENTERPRISES';
      default: return '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
          Business Details & Proposed Names
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Provide up to three distinct proposed names in order of preference. Nagu Enterprises will perform statutory MCA Trademark & RoC similarity checks before filing.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
        
        {/* Proposed Names */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span>Proposed Name Preferences {getEntitySuffix() && `(Ending with "${getEntitySuffix()}")`}</span>
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {/* Name 1 */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Proposed Name – 1 (First Preference) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.proposedName1}
                onChange={(e) => handleFieldChange('proposedName1', e.target.value.toUpperCase())}
                placeholder={`e.g., ZENITH TECHWORKS ${getEntitySuffix()}`.trim()}
                className={`w-full px-4 py-2.5 uppercase rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  errors.proposedName1 ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200 focus:border-blue-600'
                }`}
              />
              {errors.proposedName1 && <p className="text-xs text-red-500 mt-1">{errors.proposedName1}</p>}
            </div>

            {/* Name 2 */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Proposed Name – 2 (Alternative Preference)
              </label>
              <input
                type="text"
                value={data.proposedName2}
                onChange={(e) => handleFieldChange('proposedName2', e.target.value.toUpperCase())}
                placeholder={`e.g., ZENITH DIGITAL SYSTEMS ${getEntitySuffix()}`.trim()}
                className="w-full px-4 py-2.5 uppercase rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-600"
              />
            </div>

            {/* Name 3 */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Proposed Name – 3 (Alternative Preference)
              </label>
              <input
                type="text"
                value={data.proposedName3}
                onChange={(e) => handleFieldChange('proposedName3', e.target.value.toUpperCase())}
                placeholder={`e.g., ZENITH INFOTECH SOLUTIONS ${getEntitySuffix()}`.trim()}
                className="w-full px-4 py-2.5 uppercase rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Business Nature & Activities */}
        <div className="pt-6 border-t border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider">
            Industry & Business Scope
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nature of Business */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nature of Business <span className="text-red-500">*</span>
              </label>
              <select
                value={data.natureOfBusiness}
                onChange={(e) => handleFieldChange('natureOfBusiness', e.target.value as BusinessNature)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-600 bg-white"
              >
                {BUSINESS_NATURE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Other Nature Text if Other is selected */}
            {data.natureOfBusiness === 'Other' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specify Nature of Business <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.otherNatureText || ''}
                  onChange={(e) => handleFieldChange('otherNatureText', e.target.value)}
                  placeholder="e.g., Aerospace Defense Logistics"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                    errors.otherNatureText ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200 focus:border-blue-600'
                  }`}
                />
                {errors.otherNatureText && <p className="text-xs text-red-500 mt-1">{errors.otherNatureText}</p>}
              </div>
            )}

            {/* NIC Code (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                National Industrial Classification (NIC Code) <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={data.nicCode || ''}
                onChange={(e) => handleFieldChange('nicCode', e.target.value)}
                placeholder="e.g., 6201 - Computer Programming (Our team can map this)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-600"
              />
            </div>
          </div>

          {/* Main Business Activity */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Main Business Activity (1 - 2 Sentences) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.mainActivity}
              onChange={(e) => handleFieldChange('mainActivity', e.target.value)}
              placeholder="e.g., Providing cloud infrastructure, AI automation software and digital consulting."
              className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                errors.mainActivity ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200 focus:border-blue-600'
              }`}
            />
            {errors.mainActivity && <p className="text-xs text-red-500 mt-1">{errors.mainActivity}</p>}
          </div>

          {/* Detailed Business Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Business Description & Main Objects for MOA / Charter <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={data.businessDescription}
              onChange={(e) => handleFieldChange('businessDescription', e.target.value)}
              placeholder="Describe your planned business operations, target customers, manufacturing or delivery models, and expansion scope so our Company Secretaries can formulate statutory Main Objects..."
              className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                errors.businessDescription ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200 focus:border-blue-600'
              }`}
            />
            {errors.businessDescription && <p className="text-xs text-red-500 mt-1">{errors.businessDescription}</p>}
          </div>

          {/* Section 8 specific fields */}
          {businessType.id === 'section_8' && (
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-3">
              <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                Section 8 Non-Profit Objectives & Charitable Purpose
              </h4>

              <div>
                <label className="block text-xs font-semibold text-purple-900 mb-1">
                  Primary Non-Profit / Charitable Objective <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.nonProfitObjective || ''}
                  onChange={(e) => handleFieldChange('nonProfitObjective', e.target.value)}
                  placeholder="e.g., Promotion of rural education, healthcare, environmental protection, or science"
                  className="w-full px-4 py-2 rounded-lg border border-purple-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white"
                />
                {errors.nonProfitObjective && <p className="text-xs text-red-600 mt-1">{errors.nonProfitObjective}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-900 mb-1">
                  Planned Programs & Utilization of Surpluses
                </label>
                <textarea
                  rows={2}
                  value={data.charitablePurpose || ''}
                  onChange={(e) => handleFieldChange('charitablePurpose', e.target.value)}
                  placeholder="Outline key programs and confirm profits will be applied solely to promote objects without dividend distribution..."
                  className="w-full px-4 py-2 rounded-lg border border-purple-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white"
                />
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Statutory verification advisory */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-slate-600 text-xs leading-relaxed">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <span>
          <strong>Statutory Filing Advisory:</strong> Name approval and applicable activity classification will be verified by Nagu Enterprises before filing. In case a chosen name conflicts with existing trademarks or corporate records under the MCA database, our team will advise modifications.
        </span>
      </div>

      {/* Bottom Nav */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="submit"
          className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold bg-blue-700 hover:bg-blue-800 text-white shadow-md transition-all"
        >
          <span>Save & Continue to Registered Office</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};
