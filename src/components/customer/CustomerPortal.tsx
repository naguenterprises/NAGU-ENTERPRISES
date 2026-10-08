import React, { useState, useEffect } from 'react';
import { AuthUser } from '../../types/auth';
import { ApplicationRecord } from '../../types';
import { ConsultancyRecord } from '../../types/consultancy';
import { getScopedApplicationsForUser, getScopedConsultancyForUser } from '../../services/authService';
import { DocumentManagementCard } from '../documents/DocumentManagementCard';
import { formatDate, formatDateTime, maskPAN, maskAadhaar, saveApplications, getStoredApplications } from '../../utils/storage';
import { TIMELINE_STAGES } from '../../data/businessTypes';
import { CONSULTANCY_TIMELINE_STAGES } from '../../data/consultancyServices';
import {
  Building2,
  Sparkles,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Calendar,
  PhoneCall,
  User,
  CreditCard,
  MessageSquare,
  Download,
  Eye,
  PlusCircle,
  Briefcase,
  HelpCircle,
  FileCheck2,
  ExternalLink
} from 'lucide-react';

interface CustomerPortalProps {
  currentUser: AuthUser;
  onStartNewApplication: () => void;
  onOpenConsultancy: () => void;
  onTrackSpecificApp: (id: string) => void;
  onSignOut: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  currentUser,
  onStartNewApplication,
  onOpenConsultancy,
  onTrackSpecificApp,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<'applications' | 'consultancy' | 'documents' | 'payments'>('applications');
  const [myApplications, setMyApplications] = useState<ApplicationRecord[]>([]);
  const [myConsultancyRequests, setMyConsultancyRequests] = useState<ConsultancyRecord[]>([]);

  useEffect(() => {
    const apps = getScopedApplicationsForUser(currentUser);
    const consultancies = getScopedConsultancyForUser(currentUser);
    setMyApplications(apps);
    setMyConsultancyRequests(consultancies);
  }, [currentUser]);

  // Aggregate customer documents across their own applications
  const allUploadedDocs = myApplications.flatMap(app => 
    app.documents.map(d => ({ ...d, appRefId: app.id, appEntityName: app.business.proposedName1 || app.businessTypeName }))
  );

  return (
    <div className="space-y-8 pb-16">
      
      {/* Customer Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle decorative background watermark */}
        <div className="absolute right-0 top-0 bottom-0 w-96 opacity-10 pointer-events-none flex items-center justify-end pr-8">
          <Building2 className="w-80 h-80" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-700/60 border border-blue-400/30 text-xs font-semibold text-blue-200">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
              <span>Verified Client Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
              Welcome, {currentUser.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              Your centralized Nagu Enterprises Client Hub. Manage your corporate registrations, professional consultancy advisory requests, compliance filings, and verified KYC vault.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-blue-200 pt-1">
              <span>Email: <strong className="text-white font-mono">{currentUser.email}</strong></span>
              <span>•</span>
              <span>Mobile: <strong className="text-white font-mono">+91 {currentUser.mobile}</strong></span>
              <span>•</span>
              <span>Client ID: <strong className="text-white font-mono">{currentUser.id}</strong></span>
            </div>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onStartNewApplication}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-900 hover:bg-blue-50 text-xs sm:text-sm font-bold shadow-md transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-blue-700" />
              <span>Register New Business</span>
            </button>
            <button
              onClick={onOpenConsultancy}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs sm:text-sm font-bold shadow-md transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-900" />
              <span>Request Consultation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveTab('applications')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-blue-300 cursor-pointer transition-all"
        >
          <span className="text-xs font-semibold text-slate-500 block">Registered Businesses</span>
          <span className="text-3xl font-bold font-mono text-slate-900 mt-1 block">
            {myApplications.length}
          </span>
          <span className="text-xs text-blue-700 font-medium mt-1 inline-flex items-center gap-1">
            View Applications <ArrowRight className="w-3 h-3" />
          </span>
        </div>

        <div 
          onClick={() => setActiveTab('consultancy')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-amber-300 cursor-pointer transition-all"
        >
          <span className="text-xs font-semibold text-slate-500 block">Consultancy Requests</span>
          <span className="text-3xl font-bold font-mono text-amber-600 mt-1 block">
            {myConsultancyRequests.length}
          </span>
          <span className="text-xs text-amber-700 font-medium mt-1 inline-flex items-center gap-1">
            View Advisory Cases <ArrowRight className="w-3 h-3" />
          </span>
        </div>

        <div 
          onClick={() => setActiveTab('documents')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-blue-300 cursor-pointer transition-all"
        >
          <span className="text-xs font-semibold text-slate-500 block">Verified KYC Documents</span>
          <span className="text-3xl font-bold font-mono text-emerald-600 mt-1 block">
            {allUploadedDocs.length}
          </span>
          <span className="text-xs text-emerald-700 font-medium mt-1 inline-flex items-center gap-1">
            Open Document Vault <ArrowRight className="w-3 h-3" />
          </span>
        </div>

        <div 
          onClick={() => setActiveTab('payments')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-blue-300 cursor-pointer transition-all"
        >
          <span className="text-xs font-semibold text-slate-500 block">Statutory Invoices</span>
          <span className="text-3xl font-bold font-mono text-purple-600 mt-1 block">
            {myApplications.filter(a => a.paymentStatus).length}
          </span>
          <span className="text-xs text-purple-700 font-medium mt-1 inline-flex items-center gap-1">
            Review Payments <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('applications')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl transition-colors ${
            activeTab === 'applications'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>My Business Registrations ({myApplications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('consultancy')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl transition-colors ${
            activeTab === 'consultancy'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>My Consultancy Requests ({myConsultancyRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl transition-colors ${
            activeTab === 'documents'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Document Vault ({allUploadedDocs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl transition-colors ${
            activeTab === 'payments'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Quotations & Invoices</span>
        </button>
      </div>

      {/* TAB 1: BUSINESS REGISTRATIONS */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {myApplications.length === 0 ? (
            <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-2xs">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="font-bold text-slate-900 text-lg">No Business Registrations Yet</h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Ready to incorporate your Private Limited Company, LLP, or register your GST / MSME? Submit your dossier in minutes with full statutory assistance.
                </p>
              </div>
              <button
                onClick={onStartNewApplication}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-sm transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Start Business Registration</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myApplications.map((app) => (
                <div 
                  key={app.id}
                  className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 shadow-2xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                        {app.id}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {app.businessTypeName}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        {app.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 font-display">
                      {app.business.proposedName1 || 'Company Name in Reservation'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span>Submitted: <strong className="text-slate-700">{formatDate(app.createdAt)}</strong></span>
                      <span>•</span>
                      <span>Assigned Expert: <strong className="text-slate-700">{app.assignedStaffName || 'Under CA Scrutiny'}</strong></span>
                      <span>•</span>
                      <span>Documents Uploaded: <strong className="text-slate-700">{app.documents.length}</strong></span>
                    </div>

                    {app.clientMessage && (
                      <div className="text-xs bg-amber-50 text-amber-900 p-2.5 rounded-xl border border-amber-200 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span><strong>Staff Update:</strong> {app.clientMessage}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => onTrackSpecificApp(app.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Dossier & Timeline</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CONSULTANCY REQUESTS */}
      {activeTab === 'consultancy' && (
        <div className="space-y-4">
          {myConsultancyRequests.length === 0 ? (
            <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-2xs">
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="font-bold text-slate-900 text-lg">No Active Consultancy Requests</h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Need Startup India guidance, pitch deck review, DPR project reports, or trademark legal advisory? Submit a request and our principal consultants will connect with you.
                </p>
              </div>
              <button
                onClick={onOpenConsultancy}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs sm:text-sm font-bold shadow-sm transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-900" />
                <span>Request Consultation</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myConsultancyRequests.map((req) => (
                <div 
                  key={req.id}
                  className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-amber-300 shadow-2xs transition-all space-y-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-sm font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                          {req.id}
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {req.requirement.categoryName}
                        </span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                          Status: {req.status}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">
                        {req.requirement.subServiceName} — <span className="font-normal text-slate-600">{req.business.businessName || 'Proposed Venture'}</span>
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onTrackSpecificApp(req.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Track Case Details</span>
                      </button>
                    </div>
                  </div>

                  {/* Consultancy Status Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block text-[11px]">Assigned Consultant:</span>
                      <strong className="text-slate-900 font-semibold mt-0.5 block">
                        {req.assignedConsultantName || 'Pending Assignment'}
                      </strong>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block text-[11px]">Preferred Mode:</span>
                      <strong className="text-slate-900 font-semibold mt-0.5 block">
                        {req.preference}
                      </strong>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block text-[11px]">Consultation Date:</span>
                      <strong className="text-blue-700 font-semibold mt-0.5 block">
                        {req.consultationMeetingDate ? formatDateTime(req.consultationMeetingDate) : 'Scheduling in progress'}
                      </strong>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block text-[11px]">Quotation / Fee Status:</span>
                      <strong className="text-emerald-700 font-semibold mt-0.5 block">
                        {req.quotationFeeINR 
                          ? `₹${req.quotationFeeINR.toLocaleString('en-IN')} (${req.paymentStatus || 'Pending'})` 
                          : 'Under Review'}
                      </strong>
                    </div>
                  </div>

                  {/* Next Step / Notes / Updates */}
                  {(req.nextAction || req.clientMessage || (req.notes && req.notes.length > 0)) && (
                    <div className="text-xs bg-blue-50 text-blue-900 p-3 rounded-xl border border-blue-200 space-y-1">
                      {req.nextAction && (
                        <div><strong>Next Action:</strong> {req.nextAction}</div>
                      )}
                      {req.clientMessage && (
                        <div><strong>Update:</strong> {req.clientMessage}</div>
                      )}
                      {!req.clientMessage && req.notes && req.notes.length > 0 && (
                        <div><strong>Notes / Updates:</strong> {req.notes[req.notes.length - 1].text}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DOCUMENT VAULT */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-lg font-display">
                  Client Encrypted Document Vault
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  All statutory PAN, Aadhaar, Board Resolutions, and registered office records for your applications.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 self-start sm:self-auto">
                {allUploadedDocs.length} Documents Encrypted
              </span>
            </div>

            {allUploadedDocs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No documents uploaded yet. Documents will appear here once you attach them to an application.
              </div>
            ) : (
              <DocumentManagementCard
                documents={allUploadedDocs}
                customerId={currentUser.id}
                currentUser={currentUser}
                readOnly={false}
                onDocumentsChange={(updatedDocs) => {
                  // Propagate document changes back to customer application records
                  const allApps = getStoredApplications();
                  const updatedApps = allApps.map(app => {
                    const matchedDocs = updatedDocs.filter(d => (d as any).appRefId === app.id || d.applicationId === app.id);
                    if (matchedDocs.length > 0) {
                      return { ...app, documents: matchedDocs };
                    }
                    return app;
                  });
                  saveApplications(updatedApps);
                  setMyApplications(getScopedApplicationsForUser(currentUser));
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PAYMENTS & QUOTATIONS */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg font-display">
                Statutory Quotations & Payments
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Official Ministry filing fees, stamp duties, and professional consultation invoices.
              </p>
            </div>

            <div className="space-y-3">
              {myApplications.map((app) => (
                <div key={app.id} className="p-4 bg-slate-50 rounded-xl flex items-center justify-between gap-4 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900">{app.business.proposedName1 || app.businessTypeName}</h4>
                    <p className="text-slate-500 font-mono text-[11px] mt-0.5">{app.id}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">
                      {app.estimatedFeeINR ? `₹${app.estimatedFeeINR.toLocaleString('en-IN')}` : 'Statutory Pricing'}
                    </span>
                    <span className="text-emerald-700 font-semibold text-[11px]">
                      {app.paymentStatus || 'Verified / Advance Paid'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
