import React, { useState, useEffect } from 'react';
import { ApplicationRecord, UploadedDocument } from '../types';
import { ConsultancyRecord, ConsultancyStatus } from '../types/consultancy';
import { TIMELINE_STAGES } from '../data/businessTypes';
import { CONSULTANCY_TIMELINE_STAGES } from '../data/consultancyServices';
import { getStoredApplications, saveSingleApplication, formatDate, formatDateTime, maskPAN, maskAadhaar } from '../utils/storage';
import { getStoredConsultancyRequests, saveConsultancyRequests } from '../services/consultancyService';
import { DocumentManagementCard } from './documents/DocumentManagementCard';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Download, 
  UploadCloud, 
  RefreshCw, 
  Building2, 
  User, 
  MapPin, 
  ShieldCheck,
  PhoneCall,
  Calendar,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Video,
  DollarSign,
  Check,
  CreditCard
} from 'lucide-react';

interface ClientStatusTrackerProps {
  initialAppId?: string;
  onContactSupport: () => void;
  onNewApplication: () => void;
}

export const ClientStatusTracker: React.FC<ClientStatusTrackerProps> = ({
  initialAppId = '',
  onContactSupport,
  onNewApplication,
}) => {
  const [activeModule, setActiveModule] = useState<'registrations' | 'consultancy'>(() => {
    if (initialAppId && initialAppId.toUpperCase().startsWith('NE-CON')) {
      return 'consultancy';
    }
    return 'registrations';
  });

  const [searchQuery, setSearchQuery] = useState(initialAppId);
  const [selectedApp, setSelectedApp] = useState<ApplicationRecord | null>(null);
  const [selectedConsultancy, setSelectedConsultancy] = useState<ConsultancyRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [reuploadSuccess, setReuploadSuccess] = useState('');

  const registrationApps = getStoredApplications();
  const consultancyRequests = getStoredConsultancyRequests();

  // Smart Search across both Registrations and Consultancy Requests
  const handleSearch = (queryToSearch: string) => {
    const clean = queryToSearch.trim().toUpperCase();

    if (!clean) {
      setErrorMessage('Please enter an Application ID (e.g., NE-BR-2026-0001 or NE-CON-2026-0001)');
      setSelectedApp(null);
      setSelectedConsultancy(null);
      return;
    }

    // Check if it's a consultancy ID or in consultancy records
    const foundCon = consultancyRequests.find(c => 
      c.id.toUpperCase() === clean ||
      c.client.mobile.includes(clean) ||
      c.client.email.toLowerCase() === clean.toLowerCase()
    );

    if (foundCon) {
      setSelectedConsultancy(foundCon);
      setSelectedApp(null);
      setActiveModule('consultancy');
      setErrorMessage('');
      return;
    }

    // Check if it's in registration apps
    const foundApp = registrationApps.find(a => 
      a.id.toUpperCase() === clean || 
      a.applicant.mobile.includes(clean) ||
      a.applicant.email.toLowerCase() === clean.toLowerCase()
    );

    if (foundApp) {
      setSelectedApp(foundApp);
      setSelectedConsultancy(null);
      setActiveModule('registrations');
      setErrorMessage('');
      return;
    }

    setSelectedApp(null);
    setSelectedConsultancy(null);
    setErrorMessage(`No record found for "${queryToSearch}". Please verify your Application ID.`);
  };

  useEffect(() => {
    if (initialAppId) {
      setSearchQuery(initialAppId);
      handleSearch(initialAppId);
    } else {
      if (activeModule === 'registrations' && registrationApps.length > 0) {
        setSelectedApp(registrationApps[0]);
        setSearchQuery(registrationApps[0].id);
      } else if (activeModule === 'consultancy' && consultancyRequests.length > 0) {
        setSelectedConsultancy(consultancyRequests[0]);
        setSearchQuery(consultancyRequests[0].id);
      }
    }
  }, [initialAppId]);

  // When switching tabs, select first item if none selected
  const handleSwitchModule = (mod: 'registrations' | 'consultancy') => {
    setActiveModule(mod);
    setErrorMessage('');
    if (mod === 'registrations') {
      if (registrationApps.length > 0) {
        setSelectedApp(registrationApps[0]);
        setSearchQuery(registrationApps[0].id);
      }
    } else {
      if (consultancyRequests.length > 0) {
        setSelectedConsultancy(consultancyRequests[0]);
        setSearchQuery(consultancyRequests[0].id);
      }
    }
  };

  // Re-upload doc for registration
  const handleClientReupload = (docId: string, file: File) => {
    if (!selectedApp) return;

    const sizeFormatted = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    const updatedDocs = selectedApp.documents.map(d => {
      if (d.id === docId) {
        return {
          ...d,
          fileName: file.name,
          fileSizeFormatted: sizeFormatted,
          uploadDate: new Date().toISOString().split('T')[0],
          status: 'under_review' as const,
          rejectionReason: undefined,
        };
      }
      return d;
    });

    const updatedRecord: ApplicationRecord = {
      ...selectedApp,
      documents: updatedDocs,
      updatedAt: new Date().toISOString(),
      status: 'Documents Under Verification',
      clientMessage: 'Replacement document uploaded successfully. Our compliance team is verifying the update.',
      history: [
        ...selectedApp.history,
        {
          id: `hist-${Date.now()}`,
          status: 'Documents Under Verification',
          timestamp: new Date().toISOString(),
          updatedBy: 'Client Portal',
          remarks: `Client re-uploaded document: ${file.name}`,
        },
      ],
    };

    saveSingleApplication(updatedRecord);
    setSelectedApp(updatedRecord);
    setReuploadSuccess(`Document "${file.name}" uploaded successfully!`);
    setTimeout(() => setReuploadSuccess(''), 5000);
  };

  const downloadRegistrationSummary = () => {
    if (!selectedApp) return;

    const text = `=====================================================
NAGU ENTERPRISES – CLIENT STATUS DOSSIER
=====================================================
Application ID:    ${selectedApp.id}
Client Name:       ${selectedApp.applicant.fullName}
Entity Type:       ${selectedApp.businessTypeName}
Status:            ${selectedApp.status}
Assigned Staff:    ${selectedApp.assignedStaffName || 'Compliance Desk'}
Last Updated:      ${formatDateTime(selectedApp.updatedAt)}

Proposed Name 1:   ${selectedApp.business.proposedName1}
Registered Office: ${selectedApp.office.doorNo}, ${selectedApp.office.street}, ${selectedApp.office.city}, ${selectedApp.office.state}
Contact Phone:     ${selectedApp.applicant.mobile}
Contact Email:     ${selectedApp.applicant.email}

DOCUMENTS STATUS:
${selectedApp.documents.map(d => `- ${d.title}: [${d.status.toUpperCase()}] ${d.fileName} (${d.fileSizeFormatted})`).join('\n')}

FILING TIMELINE HISTORY:
${selectedApp.history.map(h => `[${formatDateTime(h.timestamp)}] ${h.status}: ${h.remarks} (by ${h.updatedBy})`).join('\n')}
=====================================================`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedApp.id}_Status_Report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadConsultancySummary = () => {
    if (!selectedConsultancy) return;

    const text = `=====================================================
NAGU ENTERPRISES – CONSULTANCY STATUS DOSSIER
=====================================================
Application ID:      ${selectedConsultancy.id}
Client Name:         ${selectedConsultancy.client.fullName}
Enterprise:          ${selectedConsultancy.business.businessName}
Service Domain:      ${selectedConsultancy.requirement.categoryName}
Consultancy Offer:   ${selectedConsultancy.requirement.subServiceName}
Status:              ${selectedConsultancy.status}
Assigned Consultant: ${selectedConsultancy.assignedConsultantName || 'Advisory Desk'}
Payment Status:      ${selectedConsultancy.paymentStatus} (₹${selectedConsultancy.quotationFeeINR?.toLocaleString('en-IN') || '0'})
Next Action:         ${selectedConsultancy.nextAction || 'Under Evaluation'}
Meeting Schedule:    ${selectedConsultancy.consultationMeetingDate || 'To be scheduled'}

DOCUMENTS ATTACHED:
${selectedConsultancy.documents.map(d => `- ${d.docType}: ${d.fileName} (${d.fileSizeFormatted})`).join('\n')}

ENGAGEMENT TIMELINE HISTORY:
${selectedConsultancy.history.map(h => `[${formatDateTime(h.timestamp)}] ${h.status}: ${h.remarks} (by ${h.updatedBy})`).join('\n')}
=====================================================`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedConsultancy.id}_Consultancy_Report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8">
      
      {/* Header & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            Client Application Tracking & Status
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time status tracking for your Business Registrations and Consultancy Requests with Nagu Enterprises.
          </p>
        </div>

        {/* Module Switcher Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => handleSwitchModule('registrations')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeModule === 'registrations'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Business Registrations ({registrationApps.length})
          </button>
          <button
            onClick={() => handleSwitchModule('consultancy')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeModule === 'consultancy'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            My Consultancy Requests ({consultancyRequests.length})
          </button>
        </div>

        {/* Search Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(searchQuery);
          }}
          className="flex flex-col sm:flex-row gap-3 pt-1"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Application ID (e.g. NE-BR-2026-0001 or NE-CON-2026-0001)"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-900 uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-600"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-blue-700 text-white font-semibold text-sm hover:bg-blue-800 transition-colors shadow-sm shrink-0 cursor-pointer"
          >
            Track Status
          </button>
        </form>

        {/* Quick Clickable Recent Records */}
        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Quick Track:</span>
          {activeModule === 'registrations' ? (
            registrationApps.slice(0, 4).map(app => (
              <button
                key={app.id}
                onClick={() => {
                  setSearchQuery(app.id);
                  handleSearch(app.id);
                }}
                className={`px-2.5 py-1 rounded-lg border font-mono transition-colors cursor-pointer ${
                  selectedApp?.id === app.id
                    ? 'bg-blue-100 text-blue-800 border-blue-300 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {app.id}
              </button>
            ))
          ) : (
            consultancyRequests.slice(0, 4).map(req => (
              <button
                key={req.id}
                onClick={() => {
                  setSearchQuery(req.id);
                  handleSearch(req.id);
                }}
                className={`px-2.5 py-1 rounded-lg border font-mono transition-colors cursor-pointer ${
                  selectedConsultancy?.id === req.id
                    ? 'bg-blue-100 text-blue-800 border-blue-300 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {req.id}
              </button>
            ))
          )}
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
            {errorMessage}
          </div>
        )}
      </div>

      {/* ===================================================================
          CONSULTANCY REQUEST TRACKING VIEW
          =================================================================== */}
      {activeModule === 'consultancy' && selectedConsultancy && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Top Status Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-mono font-bold text-slate-900">
                    {selectedConsultancy.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                    {selectedConsultancy.status}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500">
                  {selectedConsultancy.requirement.subServiceName} • {selectedConsultancy.business.businessName}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={downloadConsultancySummary}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Dossier</span>
                </button>
                <button
                  onClick={onContactSupport}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Contact Advisor</span>
                </button>
              </div>
            </div>

            {/* Visual Timeline of Stages */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Consultancy Engagement Pipeline
              </span>

              <div className="grid grid-cols-3 sm:grid-cols-9 gap-2 text-center">
                {CONSULTANCY_TIMELINE_STAGES.map((stage, idx) => {
                  const currentIdx = CONSULTANCY_TIMELINE_STAGES.findIndex(s => s.status === selectedConsultancy.status);
                  const isDone = idx < currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div key={stage.status} className="space-y-1">
                      <div className={`h-2 rounded-full transition-all ${
                        isCurrent 
                          ? 'bg-blue-600 ring-2 ring-blue-300' 
                          : isDone 
                          ? 'bg-emerald-500' 
                          : 'bg-slate-200'
                      }`} />
                      <span className={`text-[10px] block truncate ${
                        isCurrent ? 'font-bold text-blue-700' : isDone ? 'font-medium text-slate-700' : 'text-slate-400'
                      }`}>
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Key Information Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Assigned Consultant</span>
                <p className="text-sm font-bold text-slate-900">
                  {selectedConsultancy.assignedConsultantName || 'Advisory Team Lead'}
                </p>
                <span className="text-[11px] text-slate-500">Corporate Strategy Partner</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Payment & Fee</span>
                <p className="text-sm font-bold text-slate-900">
                  {selectedConsultancy.quotationFeeINR ? `₹${selectedConsultancy.quotationFeeINR.toLocaleString('en-IN')}` : 'Quotation Under Formulation'}
                </p>
                <span className={`text-[11px] font-bold ${
                  selectedConsultancy.paymentStatus === 'Fully Paid' ? 'text-emerald-700' : selectedConsultancy.paymentStatus === 'Advance Paid' ? 'text-blue-700' : 'text-amber-700'
                }`}>
                  Status: {selectedConsultancy.paymentStatus}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Consultation Schedule</span>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  {selectedConsultancy.consultationMeetingDate || 'Date to be confirmed'}
                </p>
                <span className="text-[11px] text-slate-500">Mode: {selectedConsultancy.preference}</span>
              </div>
            </div>

            {/* Next Action & Officer Updates */}
            {selectedConsultancy.nextAction && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1 text-xs">
                <span className="font-bold text-blue-900 block flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-700" />
                  Next Advisory Milestone:
                </span>
                <p className="text-blue-800 leading-relaxed font-medium">
                  {selectedConsultancy.nextAction}
                </p>
              </div>
            )}

            {/* Consultant Message */}
            {selectedConsultancy.clientMessage && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                <span className="font-bold text-slate-700 block flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  Consultant Update:
                </span>
                <p className="text-slate-800 leading-relaxed">
                  {selectedConsultancy.clientMessage}
                </p>
              </div>
            )}

            {/* Documents Section */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Attached Documents ({selectedConsultancy.documents.length})
              </span>

              {selectedConsultancy.documents.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No files attached during intake.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedConsultancy.documents.map((doc) => (
                    <div key={doc.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">{doc.docType}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{doc.fileName} ({doc.fileSizeFormatted})</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ===================================================================
          BUSINESS REGISTRATIONS TRACKING VIEW (EXISTING INTACT)
          =================================================================== */}
      {activeModule === 'registrations' && selectedApp && (
        <div className="space-y-8 animate-in fade-in">
          
          {/* Top Status Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-mono font-bold text-slate-900">
                    {selectedApp.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                    {selectedApp.status}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500">
                  {selectedApp.businessTypeName} • Proposed: {selectedApp.business.proposedName1}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={downloadRegistrationSummary}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Dossier</span>
                </button>
                <button
                  onClick={onContactSupport}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Contact Case Officer</span>
                </button>
              </div>
            </div>

            {/* Timeline Progress */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center">
                {TIMELINE_STAGES.map((stage, idx) => {
                  const isDone = idx < selectedApp.currentStageIndex;
                  const isCurrent = idx === selectedApp.currentStageIndex;

                  return (
                    <div key={stage.id} className="space-y-1">
                      <div className={`h-2 rounded-full ${
                        isCurrent ? 'bg-blue-600 ring-2 ring-blue-300' : isDone ? 'bg-emerald-500' : 'bg-slate-200'
                      }`} />
                      <span className={`text-[10px] block truncate ${
                        isCurrent ? 'font-bold text-blue-700' : isDone ? 'font-medium text-slate-700' : 'text-slate-400'
                      }`}>
                        {stage.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Officer Message */}
            {selectedApp.clientMessage && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1 text-xs">
                <span className="font-bold text-blue-900 block flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  Compliance Officer Notice:
                </span>
                <p className="text-blue-800 leading-relaxed font-medium">
                  {selectedApp.clientMessage}
                </p>
              </div>
            )}

            {/* Re-upload feedback */}
            {reuploadSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{reuploadSuccess}</span>
              </div>
            )}

            {/* Documents Verification Table */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Document Scrutiny Status & Verification Vault
              </span>

              <DocumentManagementCard
                documents={selectedApp.documents}
                applicationId={selectedApp.id}
                onDocumentsChange={(updatedDocs) => {
                  const updatedApp = {
                    ...selectedApp,
                    documents: updatedDocs,
                    status: 'Documents Under Verification' as any,
                    updatedAt: new Date().toISOString(),
                  };
                  setSelectedApp(updatedApp);
                  saveSingleApplication(updatedApp);
                  setReuploadSuccess('Document record updated and submitted for verification scrutiny.');
                }}
              />
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
