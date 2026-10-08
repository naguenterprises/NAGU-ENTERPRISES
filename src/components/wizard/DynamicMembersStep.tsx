import React, { useState } from 'react';
import { DirectorOrMember, BusinessType, ApplicantDetails } from '../../types';
import { 
  Users, 
  Plus, 
  Trash2, 
  UserCheck, 
  Briefcase, 
  ArrowLeft, 
  ArrowRight, 
  ShieldAlert, 
  Info,
  CheckCircle2,
  Copy
} from 'lucide-react';

interface DynamicMembersStepProps {
  businessType: BusinessType;
  applicant: ApplicantDetails;
  members: DirectorOrMember[];
  onChange: (members: DirectorOrMember[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const DynamicMembersStep: React.FC<DynamicMembersStepProps> = ({
  businessType,
  applicant,
  members,
  onChange,
  onNext,
  onBack,
}) => {
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Helper to generate a new empty member record
  const createNewMember = (roleType: DirectorOrMember['roleType'], designationDefault = ''): DirectorOrMember => ({
    id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    fullName: '',
    roleType,
    din: '',
    pan: '',
    aadhaar: '',
    dob: '',
    mobile: '',
    email: '',
    address: '',
    designation: designationDefault,
    shareholdingPercent: 0,
    numberOfShares: 0,
    capitalContribution: 0,
    profitSharingPercent: 0,
    occupation: '',
    relationshipWithPromoter: '',
  });

  // Pre-fill from applicant if list is empty
  const initializeIfNeeded = () => {
    if (members.length === 0) {
      if (businessType.id === 'pvt_ltd') {
        const d1: DirectorOrMember = {
          ...createNewMember('both', 'Managing Director'),
          fullName: applicant.fullName,
          pan: applicant.pan,
          aadhaar: applicant.aadhaar,
          dob: applicant.dob,
          mobile: applicant.mobile,
          email: applicant.email,
          address: `${applicant.address}, ${applicant.city}, ${applicant.state} - ${applicant.pincode}`,
          shareholdingPercent: 50,
          numberOfShares: 5000,
        };
        const d2: DirectorOrMember = {
          ...createNewMember('both', 'Director'),
          designation: 'Director',
          shareholdingPercent: 50,
          numberOfShares: 5000,
        };
        onChange([d1, d2]);
      } else if (businessType.id === 'opc') {
        const sole: DirectorOrMember = {
          ...createNewMember('proprietor', 'Sole Director / Member'),
          fullName: applicant.fullName,
          pan: applicant.pan,
          aadhaar: applicant.aadhaar,
          dob: applicant.dob,
          mobile: applicant.mobile,
          email: applicant.email,
          address: `${applicant.address}, ${applicant.city}, ${applicant.state} - ${applicant.pincode}`,
          shareholdingPercent: 100,
          numberOfShares: 10000,
        };
        const nominee: DirectorOrMember = {
          ...createNewMember('nominee', 'Nominee'),
          relationshipWithPromoter: 'Spouse / Family',
        };
        onChange([sole, nominee]);
      } else if (businessType.id === 'llp') {
        const dp1: DirectorOrMember = {
          ...createNewMember('designated_partner', 'Designated Partner'),
          fullName: applicant.fullName,
          pan: applicant.pan,
          aadhaar: applicant.aadhaar,
          dob: applicant.dob,
          mobile: applicant.mobile,
          email: applicant.email,
          address: `${applicant.address}, ${applicant.city}, ${applicant.state} - ${applicant.pincode}`,
          profitSharingPercent: 50,
          capitalContribution: 100000,
        };
        const dp2: DirectorOrMember = {
          ...createNewMember('designated_partner', 'Designated Partner'),
          profitSharingPercent: 50,
          capitalContribution: 100000,
        };
        onChange([dp1, dp2]);
      } else if (businessType.id === 'partnership_firm') {
        const p1: DirectorOrMember = {
          ...createNewMember('partner', 'Partner'),
          fullName: applicant.fullName,
          pan: applicant.pan,
          aadhaar: applicant.aadhaar,
          mobile: applicant.mobile,
          email: applicant.email,
          address: `${applicant.address}, ${applicant.city}, ${applicant.state} - ${applicant.pincode}`,
          profitSharingPercent: 50,
          capitalContribution: 50000,
        };
        const p2: DirectorOrMember = {
          ...createNewMember('partner', 'Partner'),
          profitSharingPercent: 50,
          capitalContribution: 50000,
        };
        onChange([p1, p2]);
      } else if (businessType.id === 'proprietorship') {
        const prop: DirectorOrMember = {
          ...createNewMember('proprietor', 'Sole Proprietor'),
          fullName: applicant.fullName,
          pan: applicant.pan,
          aadhaar: applicant.aadhaar,
          mobile: applicant.mobile,
          email: applicant.email,
          address: `${applicant.address}, ${applicant.city}, ${applicant.state} - ${applicant.pincode}`,
        };
        onChange([prop]);
      } else if (businessType.id === 'section_8') {
        const dir1: DirectorOrMember = {
          ...createNewMember('director', 'Director / Trustee'),
          fullName: applicant.fullName,
          pan: applicant.pan,
          aadhaar: applicant.aadhaar,
          mobile: applicant.mobile,
          email: applicant.email,
          address: `${applicant.address}, ${applicant.city}, ${applicant.state} - ${applicant.pincode}`,
          occupation: 'Social Worker / Professional',
        };
        const dir2: DirectorOrMember = {
          ...createNewMember('director', 'Director / Trustee'),
          occupation: 'Educationist / Professional',
        };
        onChange([dir1, dir2]);
      } else {
        // Generic default
        const m1: DirectorOrMember = {
          ...createNewMember('director', 'Promoter'),
          fullName: applicant.fullName,
          pan: applicant.pan,
          aadhaar: applicant.aadhaar,
          mobile: applicant.mobile,
          email: applicant.email,
          address: `${applicant.address}, ${applicant.city}, ${applicant.state} - ${applicant.pincode}`,
        };
        onChange([m1]);
      }
    }
  };

  React.useEffect(() => {
    initializeIfNeeded();
  }, [businessType.id]);

  const updateMember = (index: number, updates: Partial<DirectorOrMember>) => {
    const next = [...members];
    next[index] = { ...next[index], ...updates };
    onChange(next);
    setErrorMsg('');
  };

  const removeMember = (index: number) => {
    if (members.length <= 1) {
      setErrorMsg('At least one primary member/promoter is required.');
      return;
    }
    const next = members.filter((_, i) => i !== index);
    onChange(next);
  };

  const addDirector = () => {
    onChange([...members, createNewMember('director', 'Director')]);
  };

  const addShareholder = () => {
    onChange([...members, createNewMember('shareholder', 'Shareholder')]);
  };

  const addDesignatedPartner = () => {
    onChange([...members, createNewMember('designated_partner', 'Designated Partner')]);
  };

  const addPartner = () => {
    onChange([...members, createNewMember('partner', 'Partner')]);
  };

  const validate = (): boolean => {
    setErrorMsg('');

    if (members.length === 0) {
      setErrorMsg('Please add at least one member or director.');
      return false;
    }

    // Minimum check
    if (businessType.id === 'pvt_ltd' && members.length < 2) {
      setErrorMsg('Private Limited Company requires at least 2 directors / shareholders.');
      return false;
    }

    if (businessType.id === 'llp' && members.length < 2) {
      setErrorMsg('LLP requires at least 2 partners (minimum 2 designated partners).');
      return false;
    }

    if (businessType.id === 'opc') {
      const nominee = members.find(m => m.roleType === 'nominee');
      if (!nominee || !nominee.fullName.trim() || !nominee.pan.trim()) {
        setErrorMsg('Please provide complete details for the Nominee as mandated under Companies Act for OPC.');
        return false;
      }
    }

    // Individual member fields check
    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.fullName.trim()) {
        setErrorMsg(`Please enter Full Name for Member #${i + 1} (${m.designation || m.roleType}).`);
        return false;
      }
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      const mPan = m.pan.trim().toUpperCase();
      if (!panRegex.test(mPan)) {
        setErrorMsg(`Invalid PAN for Member #${i + 1} (${m.fullName || 'Member'}). Must be 10 characters (e.g. ABCDE1234F).`);
        return false;
      }
      const mMobile = m.mobile.replace(/\D/g, '');
      if (mMobile.length < 10) {
        setErrorMsg(`Please enter a valid 10-digit Mobile for Member #${i + 1} (${m.fullName}).`);
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      {/* Dynamic Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
          <Briefcase className="w-4 h-4" />
          <span>Entity Structure: {businessType.name}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
          {businessType.id === 'opc' && 'Sole Member & Nominee Disclosures'}
          {businessType.id === 'pvt_ltd' && 'Directors & Shareholders Disclosure'}
          {businessType.id === 'llp' && 'Designated Partners & Partners Structure'}
          {businessType.id === 'partnership_firm' && 'Partners & Capital Contribution'}
          {businessType.id === 'proprietorship' && 'Proprietorship Identification'}
          {businessType.id === 'section_8' && 'Founding Directors & Non-Profit Promoters'}
          {!['opc', 'pvt_ltd', 'llp', 'partnership_firm', 'proprietorship', 'section_8'].includes(businessType.id) &&
            'Directors, Promoters & Key Stakeholders'}
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          {businessType.id === 'pvt_ltd' && 'Minimum 2 directors required. Indian law permits individuals to hold both directorship and equity shares.'}
          {businessType.id === 'opc' && 'As per Companies Act 2013, a single natural person incorporates the OPC and must nominate another Indian citizen.'}
          {businessType.id === 'llp' && 'Minimum 2 designated partners required. Designated partners obtain DPIN / DIN for regulatory compliance.'}
          {businessType.id === 'partnership_firm' && 'Specify all partners, their capital investment, and agreed profit sharing ratio.'}
          {businessType.id === 'proprietorship' && 'Sole proprietorship is managed exclusively by one individual.'}
          {businessType.id === 'section_8' && 'Enter founding directors and key promoters dedicated to charitable/non-profit objectives.'}
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Dynamic Member Cards List */}
      <div className="space-y-6">
        {members.map((member, index) => {
          const isNominee = member.roleType === 'nominee';
          const isSole = member.roleType === 'proprietor' && businessType.id === 'opc';
          
          return (
            <div 
              key={member.id} 
              className={`rounded-2xl border p-5 sm:p-7 transition-all ${
                isNominee 
                  ? 'bg-amber-50/50 border-amber-200' 
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isNominee ? 'bg-amber-600 text-white' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base sm:text-lg font-display">
                      {isNominee ? 'Nominee Details (INC-3)' : (member.designation || `Person ${index + 1}`)}
                    </h3>
                    <span className="text-xs text-slate-500 font-medium">
                      {member.roleType.toUpperCase().replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Remove button */}
                {!isNominee && !isSole && members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMember(index)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Input Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Legal Name (as per PAN) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={member.fullName}
                    onChange={(e) => updateMember(index, { fullName: e.target.value })}
                    placeholder="e.g., Sneha Ramesh Kulkarni"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-600"
                  />
                </div>

                {/* Designation / Role */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={member.designation || ''}
                    onChange={(e) => updateMember(index, { designation: e.target.value })}
                    placeholder="e.g., Director / Designated Partner"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-600"
                  />
                </div>

                {/* PAN Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    PAN Card Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={member.pan}
                    onChange={(e) => updateMember(index, { pan: e.target.value.toUpperCase() })}
                    placeholder="ABCDE1234F"
                    className="w-full px-4 py-2.5 uppercase rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-600"
                  />
                </div>

                {/* Aadhaar Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Aadhaar Number (12 Digits)
                  </label>
                  <input
                    type="text"
                    maxLength={12}
                    value={member.aadhaar}
                    onChange={(e) => updateMember(index, { aadhaar: e.target.value.replace(/\D/g, '') })}
                    placeholder="123456789012"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-600"
                  />
                </div>

                {/* DIN (if available for Companies) */}
                {['pvt_ltd', 'public_ltd', 'opc', 'section_8'].includes(businessType.id) && !isNominee && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      DIN (Director Identification No, if any)
                    </label>
                    <input
                      type="text"
                      maxLength={8}
                      value={member.din || ''}
                      onChange={(e) => updateMember(index, { din: e.target.value.replace(/\D/g, '') })}
                      placeholder="e.g., 08924152 (Optional)"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-600"
                    />
                  </div>
                )}

                {/* Mobile */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={member.mobile}
                    onChange={(e) => updateMember(index, { mobile: e.target.value })}
                    placeholder="+91 98450 12345"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-600"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={member.email}
                    onChange={(e) => updateMember(index, { email: e.target.value })}
                    placeholder="member@company.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-600"
                  />
                </div>

                {/* Relationship for Nominee */}
                {isNominee && (
                  <div>
                    <label className="block text-xs font-semibold text-amber-900 mb-1">
                      Relationship with Promoter <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={member.relationshipWithPromoter || ''}
                      onChange={(e) => updateMember(index, { relationshipWithPromoter: e.target.value })}
                      placeholder="e.g., Spouse / Brother / Father"
                      className="w-full px-4 py-2.5 rounded-xl border border-amber-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-600"
                    />
                  </div>
                )}

                {/* Shareholding % & Number of Shares for Pvt Ltd */}
                {['pvt_ltd', 'public_ltd'].includes(businessType.id) && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Shareholding (%)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={member.shareholdingPercent || ''}
                        onChange={(e) => updateMember(index, { shareholdingPercent: parseFloat(e.target.value) || 0 })}
                        placeholder="e.g., 50"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Number of Equity Shares
                      </label>
                      <input
                        type="number"
                        value={member.numberOfShares || ''}
                        onChange={(e) => updateMember(index, { numberOfShares: parseInt(e.target.value, 10) || 0 })}
                        placeholder="e.g., 5000"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-600"
                      />
                    </div>
                  </>
                )}

                {/* Capital Contribution & Profit Sharing for LLP / Partnership */}
                {['llp', 'partnership_firm'].includes(businessType.id) && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Capital Contribution (₹)
                      </label>
                      <input
                        type="number"
                        value={member.capitalContribution || ''}
                        onChange={(e) => updateMember(index, { capitalContribution: parseFloat(e.target.value) || 0 })}
                        placeholder="e.g., 100000"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Profit Sharing Ratio (%)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={member.profitSharingPercent || ''}
                        onChange={(e) => updateMember(index, { profitSharingPercent: parseFloat(e.target.value) || 0 })}
                        placeholder="e.g., 50"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-600"
                      />
                    </div>
                  </>
                )}

                {/* Occupation for Section 8 */}
                {businessType.id === 'section_8' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Occupation / Background
                    </label>
                    <input
                      type="text"
                      value={member.occupation || ''}
                      onChange={(e) => updateMember(index, { occupation: e.target.value })}
                      placeholder="e.g., Social Worker / Academician"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-600"
                    />
                  </div>
                )}

                {/* Full Address */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Residential Address (with PIN code)
                  </label>
                  <input
                    type="text"
                    value={member.address}
                    onChange={(e) => updateMember(index, { address: e.target.value })}
                    placeholder="Full residential street address, city, state, pin"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-600"
                  />
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Action Buttons for adding people */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        {businessType.id === 'pvt_ltd' && (
          <>
            <button
              type="button"
              onClick={addDirector}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ ADD DIRECTOR</span>
            </button>
            <button
              type="button"
              onClick={addShareholder}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ ADD SHAREHOLDER</span>
            </button>
          </>
        )}

        {businessType.id === 'llp' && (
          <>
            <button
              type="button"
              onClick={addDesignatedPartner}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ ADD DESIGNATED PARTNER</span>
            </button>
            <button
              type="button"
              onClick={addPartner}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ ADD PARTNER</span>
            </button>
          </>
        )}

        {businessType.id === 'partnership_firm' && (
          <button
            type="button"
            onClick={addPartner}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ ADD PARTNER</span>
          </button>
        )}

        {businessType.id === 'section_8' && (
          <button
            type="button"
            onClick={addDirector}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ ADD PROPOSED DIRECTOR / TRUSTEE</span>
          </button>
        )}
      </div>

      {/* Advisory Note */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <span>
          Nagu Enterprises will verify each director's PAN with the Income Tax e-filing registry and perform DIN cross-checks before drafting SPICe+ Part B articles.
        </span>
      </div>

      {/* Bottom Nav */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold bg-blue-700 hover:bg-blue-800 text-white shadow-md transition-all"
        >
          <span>Save & Continue to Business Details</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
