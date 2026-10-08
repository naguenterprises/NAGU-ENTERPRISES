import React from 'react';
import { ApplicationRecord } from '../types';
import { formatDate, formatDateTime, maskPAN } from '../utils/storage';
import { 
  CheckCircle2, 
  ArrowRight, 
  PhoneCall, 
  Download, 
  Copy, 
  Check, 
  Building2, 
  Calendar, 
  FileText,
  Mail
} from 'lucide-react';

interface SubmissionSuccessProps {
  application: ApplicationRecord;
  onViewStatus: (appId: string) => void;
  onContactSupport: () => void;
}

export const SubmissionSuccess: React.FC<SubmissionSuccessProps> = ({
  application,
  onViewStatus,
  onContactSupport,
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(application.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReceipt = () => {
    // Generate text/markdown receipt file
    const content = `=====================================================
NAGU ENTERPRISES – BUSINESS REGISTRATION PORTAL
APPLICATION ACKNOWLEDGEMENT RECEIPT
=====================================================

Application ID:   ${application.id}
Submission Date:  ${new Date(application.createdAt).toLocaleString('en-IN')}
Current Status:   ${application.status}

CLIENT & ENTITY DETAILS:
-----------------------------------------------------
Primary Applicant: ${application.applicant.fullName}
Entity Type:       ${application.businessTypeName}
Proposed Name 1:   ${application.business.proposedName1}
${application.business.proposedName2 ? `Proposed Name 2:   ${application.business.proposedName2}\n` : ''}${application.business.proposedName3 ? `Proposed Name 3:   ${application.business.proposedName3}\n` : ''}
Industry Nature:   ${application.business.natureOfBusiness}
Main Activity:     ${application.business.mainActivity}

REGISTERED OFFICE:
-----------------------------------------------------
Office Category:   ${application.office.officeType.toUpperCase()} PROPERTY
Premises Address:  ${application.office.doorNo}, ${application.office.street}, ${application.office.area}, ${application.office.city}, ${application.office.state} - ${application.office.pincode}
Property Owner:    ${application.office.ownerName} (${application.office.ownerMobile})

PROMOTERS & DIRECTORS:
-----------------------------------------------------
${application.members.map((m, i) => `${i + 1}. ${m.fullName} - ${m.designation || m.roleType} (PAN: ${maskPAN(m.pan)})`).join('\n')}

DOCUMENTS UPLOADED:
-----------------------------------------------------
${application.documents.map((d, i) => `${i + 1}. ${d.title} (${d.fileName} - ${d.fileSizeFormatted})`).join('\n')}

IMPORTANT NOTICE:
-----------------------------------------------------
Final registration and statutory name reservations are subject
to verification by Nagu Enterprises and approval by the 
concerned Registrar of Companies (RoC) / MCA authority.

NAGU ENTERPRISES
Business Registration & Compliance Services
Helpline: naguenterprises84@gmail.com
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Nagu_Enterprises_${application.id}_Acknowledgement.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-8">
      {/* Success Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-10 text-center space-y-6">
        
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-100/70 px-3 py-1 rounded-full">
            Submission Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display mt-2">
            APPLICATION SUBMITTED SUCCESSFULLY
          </h1>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            Your application has been received by Nagu Enterprises corporate secretarial desk. An intake associate will verify your submitted documents.
          </p>
        </div>

        {/* Application ID Highlight Box */}
        <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 text-left space-y-3">
          <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider block">
            Your Official Application Reference ID
          </span>

          <div className="flex items-center justify-between gap-3">
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-blue-900 tracking-wider">
              {application.id}
            </span>

            <button
              type="button"
              onClick={copyToClipboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-blue-300 text-blue-800 hover:bg-blue-100 text-xs font-semibold transition-colors"
              title="Copy Application ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy ID'}</span>
            </button>
          </div>

          <p className="text-xs text-blue-700">
            Please bookmark or note this ID. You can track real-time filing stages and download statutory certificates anytime using this reference.
          </p>
        </div>

        {/* Summary Metadata Grid */}
        <div className="grid grid-cols-2 gap-4 text-left p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm">
          <div>
            <span className="text-slate-500 block text-xs">Client / Promoter:</span>
            <span className="font-semibold text-slate-900">{application.applicant.fullName}</span>
          </div>

          <div>
            <span className="text-slate-500 block text-xs">Entity Type:</span>
            <span className="font-semibold text-slate-900">{application.businessTypeName}</span>
          </div>

          <div>
            <span className="text-slate-500 block text-xs">Submission Date & Time:</span>
            <span className="font-medium text-slate-800">{formatDateTime(application.createdAt)}</span>
          </div>

          <div>
            <span className="text-slate-500 block text-xs">Current Stage:</span>
            <span className="font-bold text-blue-700">{application.status}</span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onViewStatus(application.id)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm shadow-md transition-all"
          >
            <span>VIEW STATUS</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={downloadReceipt}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>DOWNLOAD RECEIPT</span>
          </button>

          <button
            type="button"
            onClick={onContactSupport}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 transition-colors"
          >
            <Mail className="w-4 h-4 text-blue-600" />
            <span>CONTACT SUPPORT</span>
          </button>
        </div>

      </div>
    </div>
  );
};
