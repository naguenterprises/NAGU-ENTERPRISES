import React, { useState } from 'react';
import { ApplicantDetails, Gender } from '../../types';
import { User, Phone, Mail, CreditCard, Shield, MapPin, ArrowRight, ArrowLeft } from 'lucide-react';

interface ApplicantDetailsStepProps {
  data: ApplicantDetails;
  onChange: (updated: ApplicantDetails) => void;
  onNext: () => void;
  onBack: () => void;
}

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi (NCT)', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

export const ApplicantDetailsStep: React.FC<ApplicantDetailsStepProps> = ({
  data,
  onChange,
  onNext,
  onBack,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!data.fullName.trim()) newErrors.fullName = 'Full Name is required.';
    if (!data.parentName.trim()) newErrors.parentName = "Father / Mother's Name is required.";
    if (!data.dob) newErrors.dob = 'Date of Birth is required.';
    
    // Mobile validation (10 digits)
    const cleanMobile = data.mobile.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length < 10) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number.';
    }

    // Email validation
    if (!data.email.trim() || !/^\S+@\S+\.\S+$/.test(data.email)) {
      newErrors.email = 'Enter a valid email address.';
    }

    // PAN validation (5 letters, 4 digits, 1 letter)
    const panClean = data.pan.trim().toUpperCase();
    if (!panClean || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panClean)) {
      newErrors.pan = 'Enter a valid 10-character PAN (e.g., ABCDE1234F).';
    }

    // Aadhaar validation (12 digits)
    const aadhaarClean = data.aadhaar.replace(/\D/g, '');
    if (!aadhaarClean || aadhaarClean.length !== 12) {
      newErrors.aadhaar = 'Enter a valid 12-digit Aadhaar number.';
    }

    if (!data.address.trim()) newErrors.address = 'Residential Address is required.';
    if (!data.city.trim()) newErrors.city = 'City / Town is required.';
    if (!data.district.trim()) newErrors.district = 'District is required.';
    if (!data.state) newErrors.state = 'State is required.';
    
    // PIN code validation (6 digits)
    const pinClean = data.pincode.replace(/\D/g, '');
    if (!pinClean || pinClean.length !== 6) {
      newErrors.pincode = 'Enter a valid 6-digit PIN code.';
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

  const handleFieldChange = (field: keyof ApplicantDetails, value: string) => {
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
          Applicant & Primary Contact Details
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Provide information of the primary promoter / authorized applicant. This person will receive official communication, verification OTPs, and statutory filing updates.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" />
          <span>Personal Identity</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Full Name */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name (As per PAN Card) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.fullName}
              onChange={(e) => handleFieldChange('fullName', e.target.value)}
              placeholder="e.g., Rajesh Kumar Sharma"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                errors.fullName ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200 focus:border-blue-600'
              }`}
            />
            {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
          </div>

          {/* Father / Mother Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Father / Mother's Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.parentName}
              onChange={(e) => handleFieldChange('parentName', e.target.value)}
              placeholder="e.g., Suresh Sharma"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                errors.parentName ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200 focus:border-blue-600'
              }`}
            />
            {errors.parentName && <p className="text-xs text-red-500 mt-1">{errors.parentName}</p>}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={data.dob}
              onChange={(e) => handleFieldChange('dob', e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                errors.dob ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200 focus:border-blue-600'
              }`}
            />
            {errors.dob && <p className="text-xs text-red-500 mt-1">{errors.dob}</p>}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              value={data.gender}
              onChange={(e) => handleFieldChange('gender', e.target.value as Gender)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-600 bg-white"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* PAN */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              PAN Number (10 Alphanumeric) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={10}
                value={data.pan}
                onChange={(e) => handleFieldChange('pan', e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                className={`w-full px-4 py-2.5 uppercase rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  errors.pan ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200 focus:border-blue-600'
                }`}
              />
              <CreditCard className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>
            {errors.pan && <p className="text-xs text-red-500 mt-1">{errors.pan}</p>}
          </div>

          {/* Aadhaar */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Aadhaar Number (12 Digits) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={12}
                value={data.aadhaar}
                onChange={(e) => handleFieldChange('aadhaar', e.target.value.replace(/\D/g, ''))}
                placeholder="123456789012"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  errors.aadhaar ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200 focus:border-blue-600'
                }`}
              />
              <Shield className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>
            {errors.aadhaar && <p className="text-xs text-red-500 mt-1">{errors.aadhaar}</p>}
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mobile Number (For OTP & Filing Alerts) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                value={data.mobile}
                onChange={(e) => handleFieldChange('mobile', e.target.value)}
                placeholder="+91 98450 12345"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  errors.mobile ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200 focus:border-blue-600'
                }`}
              />
              <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>
            {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Official Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={data.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                placeholder="promoter@company.com"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  errors.email ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200 focus:border-blue-600'
                }`}
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
        </div>

        {/* Residential Address Subsection */}
        <div className="pt-6 border-t border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>Applicant Residential Address</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2 lg:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Flat / Door No., Building, Street & Area <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.address}
                onChange={(e) => handleFieldChange('address', e.target.value)}
                placeholder="e.g., Flat 402, Sai Residency, 7th Main, 4th Cross"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  errors.address ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200 focus:border-blue-600'
                }`}
              />
              {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
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
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
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
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
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
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  errors.pincode ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200 focus:border-blue-600'
                }`}
              />
              {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
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
          <span>Save & Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};
