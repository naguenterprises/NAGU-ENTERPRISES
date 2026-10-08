import React from 'react';
import { 
  ApplicantDetails, 
  BusinessType, 
  DirectorOrMember, 
  BusinessDetails, 
  RegisteredOffice, 
  UploadedDocument 
} from '../../types';
import { maskPAN, maskAadhaar } from '../../utils/storage';
import { 
  User, 
  Building2, 
  Users, 
  MapPin, 
  FileText, 
  Edit3, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ReviewStepProps {
  businessType: BusinessType;
  applicant: ApplicantDetails;
  members: DirectorOrMember[];
  business: BusinessDetails;
  office: RegisteredOffice;
  documents: UploadedDocument[];
  onEditStep: (stepNumber: number) => void;
  onNext: () => void;
  onBack: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  businessType,
  applicant,
  members,
  business,
  office,
  documents,
  onEditStep,
  onNext,
  onBack,
}) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
          Review Application Summary
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Carefully verify all disclosed promoter, entity, registered address, and document details before proceeding to the final statutory declaration.
        </p>
      </div>

      {/* 1. Entity Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-700" />
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              1. Business Registration Category
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(1)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 py-1 px-2.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>EDIT</span>
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div>
            <span className="text-slate-500 block">Entity Type:</span>
            <span className="font-bold text-slate-900 text-base">{businessType.name}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Category:</span>
            <span className="font-medium text-slate-800 capitalize">{businessType.category.replace('_', ' / ')}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Estimated Turnaround:</span>
            <span className="font-medium text-slate-800">{businessType.estimatedDays}</span>
          </div>
        </div>
      </div>

      {/* 2. Applicant / Primary Contact Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-700" />
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              2. Applicant & Primary Contact
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(2)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 py-1 px-2.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>EDIT</span>
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm">
          <div>
            <span className="text-slate-500 block">Full Name:</span>
            <span className="font-semibold text-slate-900">{applicant.fullName}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Parent's Name:</span>
            <span className="font-medium text-slate-800">{applicant.parentName}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Date of Birth & Gender:</span>
            <span className="font-medium text-slate-800">{applicant.dob} · {applicant.gender}</span>
          </div>
          <div>
            <span className="text-slate-500 block">PAN (Masked):</span>
            <span className="font-mono font-medium text-slate-800">{maskPAN(applicant.pan)}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Aadhaar (Masked):</span>
            <span className="font-mono font-medium text-slate-800">{maskAadhaar(applicant.aadhaar)}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Mobile Contact:</span>
            <span className="font-medium text-slate-800">{applicant.mobile}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Official Email:</span>
            <span className="font-medium text-slate-800 truncate block">{applicant.email}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Location:</span>
            <span className="font-medium text-slate-800">{applicant.city}, {applicant.state} - {applicant.pincode}</span>
          </div>
          <div className="sm:col-span-2 lg:col-span-4 pt-2 border-t border-slate-100">
            <span className="text-slate-500 block">Residential Address:</span>
            <span className="font-medium text-slate-800">{applicant.address}</span>
          </div>
        </div>
      </div>

      {/* 3. Members / Directors / Partners Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-700" />
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              3. Members / Directors / Partners ({members.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(3)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 py-1 px-2.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>EDIT</span>
          </button>
        </div>

        <div className="p-6 divide-y divide-slate-100">
          {members.map((mem, i) => (
            <div key={mem.id} className={`${i > 0 ? 'pt-4 mt-4' : ''} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs sm:text-sm`}>
              <div>
                <span className="text-slate-500 block">Person #{i + 1}:</span>
                <span className="font-semibold text-slate-900">{mem.fullName}</span>
                <span className="text-[11px] text-blue-700 block font-medium">
                  {mem.designation || mem.roleType.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">PAN & Aadhaar:</span>
                <span className="font-mono text-slate-800 block">{maskPAN(mem.pan)}</span>
                <span className="font-mono text-slate-600 text-xs block">{maskAadhaar(mem.aadhaar)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Contact:</span>
                <span className="text-slate-800 block">{mem.mobile}</span>
                <span className="text-slate-600 text-xs block truncate">{mem.email}</span>
              </div>
              <div>
                {mem.shareholdingPercent !== undefined && mem.shareholdingPercent > 0 ? (
                  <>
                    <span className="text-slate-500 block">Equity Shares:</span>
                    <span className="font-semibold text-slate-800">{mem.shareholdingPercent}% ({mem.numberOfShares || 0} shares)</span>
                  </>
                ) : mem.profitSharingPercent !== undefined && mem.profitSharingPercent > 0 ? (
                  <>
                    <span className="text-slate-500 block">Profit Sharing & Capital:</span>
                    <span className="font-semibold text-slate-800">{mem.profitSharingPercent}% (₹{mem.capitalContribution?.toLocaleString('en-IN')})</span>
                  </>
                ) : mem.relationshipWithPromoter ? (
                  <>
                    <span className="text-slate-500 block">Nominee Relation:</span>
                    <span className="font-semibold text-amber-800">{mem.relationshipWithPromoter}</span>
                  </>
                ) : (
                  <>
                    <span className="text-slate-500 block">DIN / DPIN:</span>
                    <span className="font-mono text-slate-700">{mem.din || 'To be allotted'}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Business Details & Proposed Names */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-700" />
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              4. Business Profile & Proposed Names
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(4)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 py-1 px-2.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>EDIT</span>
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
              <span className="text-blue-800 text-[11px] font-bold block">1st Name Preference:</span>
              <span className="font-bold text-slate-900 font-mono text-sm">{business.proposedName1}</span>
            </div>
            {business.proposedName2 && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[11px] font-semibold block">2nd Name Preference:</span>
                <span className="font-medium text-slate-800 font-mono text-sm">{business.proposedName2}</span>
              </div>
            )}
            {business.proposedName3 && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[11px] font-semibold block">3rd Name Preference:</span>
                <span className="font-medium text-slate-800 font-mono text-sm">{business.proposedName3}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <span className="text-slate-500 block">Nature of Industry:</span>
              <span className="font-semibold text-slate-900">
                {business.natureOfBusiness === 'Other' ? business.otherNatureText : business.natureOfBusiness}
              </span>
            </div>
            {business.nicCode && (
              <div>
                <span className="text-slate-500 block">NIC Classification:</span>
                <span className="font-medium text-slate-800">{business.nicCode}</span>
              </div>
            )}
            <div className="sm:col-span-2">
              <span className="text-slate-500 block">Main Activity Summary:</span>
              <span className="font-medium text-slate-800">{business.mainActivity}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-500 block">Detailed Description:</span>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                {business.businessDescription}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Registered Office */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-700" />
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              5. Registered Office Address
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(5)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 py-1 px-2.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>EDIT</span>
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div>
            <span className="text-slate-500 block">Property Category:</span>
            <span className="font-semibold text-slate-900 capitalize">{office.officeType} Property</span>
          </div>
          <div>
            <span className="text-slate-500 block">Property Owner / Landlord:</span>
            <span className="font-semibold text-slate-900">{office.ownerName}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Owner Contact:</span>
            <span className="font-medium text-slate-800">{office.ownerMobile}</span>
          </div>
          <div className="sm:col-span-2 lg:col-span-3 pt-2 border-t border-slate-100">
            <span className="text-slate-500 block">Premises Address:</span>
            <span className="font-medium text-slate-800">
              {office.doorNo}, {office.street}, {office.area}, {office.city}, {office.district}, {office.state} - {office.pincode}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Uploaded Documents Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-700" />
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              6. Uploaded Documents ({documents.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(6)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 py-1 px-2.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>EDIT</span>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {documents.map((doc) => (
              <div key={doc.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="truncate">
                    <span className="font-semibold text-slate-900 block truncate">{doc.title}</span>
                    <span className="text-slate-500 text-[11px] truncate block">{doc.fileName}</span>
                  </div>
                </div>
                <span className="text-slate-400 tabular-nums shrink-0">{doc.fileSizeFormatted}</span>
              </div>
            ))}
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
          <span>Back to Documents</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold bg-blue-700 hover:bg-blue-800 text-white shadow-md transition-all"
        >
          <span>Continue to Declaration</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
