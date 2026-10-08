import React, { useState } from 'react';
import { RegisteredOffice, OfficeType } from '../../types';
import { INDIAN_STATES } from './ApplicantDetailsStep';
import { MapPin, Building, FileCheck2, ArrowLeft, ArrowRight, Info } from 'lucide-react';

interface RegisteredOfficeStepProps {
  data: RegisteredOffice;
  onChange: (updated: RegisteredOffice) => void;
  onNext: () => void;
  onBack: () => void;
}

export const RegisteredOfficeStep: React.FC<RegisteredOfficeStepProps> = ({
  data,
  onChange,
  onNext,
  onBack,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!data.doorNo.trim()) newErrors.doorNo = 'Door / Building / Unit No. is required.';
    if (!data.street.trim()) newErrors.street = 'Street / Road name is required.';
    if (!data.area.trim()) newErrors.area = 'Area / Locality is required.';
    if (!data.city.trim()) newErrors.city = 'City / Town is required.';
    if (!data.district.trim()) newErrors.district = 'District is required.';
    if (!data.state) newErrors.state = 'State is required.';

    const pinClean = data.pincode.replace(/\D/g, '');
    if (!pinClean || pinClean.length !== 6) {
      newErrors.pincode = 'Enter a valid 6-digit PIN code.';
    }

    if (!data.ownerName.trim()) {
      newErrors.ownerName = 'Property owner name is required.';
    }

    const cleanMobile = data.ownerMobile.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length < 10) {
      newErrors.ownerMobile = 'Enter a valid 10-digit owner/landlord mobile number.';
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

  const handleFieldChange = (field: keyof RegisteredOffice, value: any) => {
    onChange({
      ...data,
      [field]: value,
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
          Registered Office Address
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Specify the principal place of business for official MCA jurisdiction, RoC communications, and tax registration.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
        
        {/* Office Type Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Premises Ownership Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <button
              type="button"
              onClick={() => handleFieldChange('officeType', 'rental')}
              className={`p-4 rounded-xl border text-left transition-all ${
                data.officeType === 'rental'
                  ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900 text-sm">Rental Property</span>
                <span className={`w-3.5 h-3.5 rounded-full border-2 ${
                  data.officeType === 'rental' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                }`} />
              </div>
              <p className="text-xs text-slate-500">
                Requires Rent Agreement & Landlord NOC.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleFieldChange('officeType', 'own')}
              className={`p-4 rounded-xl border text-left transition-all ${
                data.officeType === 'own'
                  ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900 text-sm">Own Property</span>
                <span className={`w-3.5 h-3.5 rounded-full border-2 ${
                  data.officeType === 'own' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                }`} />
              </div>
              <p className="text-xs text-slate-500">
                Owned by promoter/director. Requires Title deed or Tax receipt.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleFieldChange('officeType', 'consent')}
              className={`p-4 rounded-xl border text-left transition-all ${
                data.officeType === 'consent'
                  ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900 text-sm">Consent / Other</span>
                <span className={`w-3.5 h-3.5 rounded-full border-2 ${
                  data.officeType === 'consent' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                }`} />
              </div>
              <p className="text-xs text-slate-500">
                Owned by parent/family member who provides consent letter.
              </p>
            </button>

          </div>
        </div>

        {/* Dynamic Document Expectation Alert */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <FileCheck2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong>Document requirements for {data.officeType === 'rental' ? 'Rental Property' : data.officeType === 'own' ? 'Own Property' : 'Consent Property'}:</strong>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-700">
              {data.officeType === 'rental' && (
                <>
                  <li>Rent / Lease Agreement (duly signed)</li>
                  <li>No Objection Certificate (NOC) from property owner</li>
                  <li>Recent Utility Bill (Electricity / Water / Piped Gas &lt; 2 months old)</li>
                </>
              )}
              {data.officeType === 'own' && (
                <>
                  <li>Ownership Proof / Municipal Property Tax Paid Receipt / Sale Deed</li>
                  <li>Recent Utility Bill (Electricity / Water / Piped Gas &lt; 2 months old)</li>
                </>
              )}
              {data.officeType === 'consent' && (
                <>
                  <li>Signed Consent Letter / NOC from owner</li>
                  <li>Proof of Ownership of consenting owner</li>
                  <li>Recent Utility Bill (&lt; 2 months old)</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Address Fields */}
        <div className="pt-4 border-t border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            <span>Premises Address Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Door / Building / Suite / Unit No. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.doorNo}
                onChange={(e) => handleFieldChange('doorNo', e.target.value)}
                placeholder="e.g., Suite 302, 3rd Floor, Prestige Meridian"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                  errors.doorNo ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200 focus:border-blue-600'
                }`}
              />
              {errors.doorNo && <p className="text-xs text-red-500 mt-1">{errors.doorNo}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Street / Road <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.street}
                onChange={(e) => handleFieldChange('street', e.target.value)}
                placeholder="e.g., M.G. Road"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                  errors.street ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200 focus:border-blue-600'
                }`}
              />
              {errors.street && <p className="text-xs text-red-500 mt-1">{errors.street}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Area / Locality <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.area}
                onChange={(e) => handleFieldChange('area', e.target.value)}
                placeholder="e.g., CBD / Indiranagar"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                  errors.area ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200 focus:border-blue-600'
                }`}
              />
              {errors.area && <p className="text-xs text-red-500 mt-1">{errors.area}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City / Town <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.city}
                onChange={(e) => handleFieldChange('city', e.target.value)}
                placeholder="e.g., Bengaluru"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                  errors.city ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200 focus:border-blue-600'
                }`}
              />
              {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                District <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.district}
                onChange={(e) => handleFieldChange('district', e.target.value)}
                placeholder="e.g., Bengaluru Urban"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                  errors.district ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200 focus:border-blue-600'
                }`}
              />
              {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <select
                value={data.state}
                onChange={(e) => handleFieldChange('state', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 bg-white ${
                  errors.state ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200 focus:border-blue-600'
                }`}
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                PIN Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={6}
                value={data.pincode}
                onChange={(e) => handleFieldChange('pincode', e.target.value.replace(/\D/g, ''))}
                placeholder="e.g., 560001"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                  errors.pincode ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200 focus:border-blue-600'
                }`}
              />
              {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>}
            </div>

          </div>
        </div>

        {/* Property Owner Information */}
        <div className="pt-4 border-t border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider">
            Property Owner / Landlord Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Property Owner / Lessor Name (as per Tax/Deed) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.ownerName}
                onChange={(e) => handleFieldChange('ownerName', e.target.value)}
                placeholder="e.g., Srikanth Rao or Commercial Realties Pvt Ltd"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                  errors.ownerName ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200 focus:border-blue-600'
                }`}
              />
              {errors.ownerName && <p className="text-xs text-red-500 mt-1">{errors.ownerName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Owner / Landlord Mobile Contact <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={data.ownerMobile}
                onChange={(e) => handleFieldChange('ownerMobile', e.target.value)}
                placeholder="+91 98450 11223"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                  errors.ownerMobile ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200 focus:border-blue-600'
                }`}
              />
              {errors.ownerMobile && <p className="text-xs text-red-500 mt-1">{errors.ownerMobile}</p>}
            </div>
          </div>
        </div>

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
          <span>Save & Continue to Document Upload</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};
