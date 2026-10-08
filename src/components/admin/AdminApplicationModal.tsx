import React, { useState } from 'react';
import { 
  ApplicationRecord, 
  ApplicationStatus, 
  UploadedDocument, 
  AdminNote, 
  StatusHistoryItem 
} from '../../types';
import { STAFF_MEMBERS } from '../../data/staffMembers';
import { DocumentManagementCard } from '../documents/DocumentManagementCard';
import { formatDate, formatDateTime, maskPAN, maskAadhaar } from '../../utils/storage';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  User, 
  Users, 
  Building2, 
  MapPin, 
  FileText, 
  MessageSquare, 
  History, 
  Send, 
  Eye, 
  Download, 
  ShieldCheck, 
  RefreshCw,
  Phone,
  Mail,
  Edit2,
  Lock,
  Unlock
} from 'lucide-react';

interface AdminApplicationModalProps {
  application: ApplicationRecord;
  onClose: () => void;
  onUpdate: (updated: ApplicationRecord) => void;
}

const ALL_STATUSES: ApplicationStatus[] = [
  'New Application',
  'Documents Pending',
  'Documents Under Verification',
  'Documents Verified',
  'Name Preparation',
  'Name Reservation',
  'Application Preparation',
  'MCA / Authority Filing',
  'Under Processing',
  'Additional Information Required',
  'Approved',
  'Completed',
  'On Hold',
  'Rejected',
  'Cancelled',
];

export const AdminApplicationModal: React.FC<AdminApplicationModalProps> = ({
  application,
  onClose,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'applicant' | 'members' | 'business' | 'office' | 'documents' | 'notes' | 'history'
  >('overview');

  const [currentStatus, setCurrentStatus] = useState<ApplicationStatus>(application.status);
  const [statusRemarks, setStatusRemarks] = useState('');
  const [assignedStaffId, setAssignedStaffId] = useState(application.assignedStaffId || 'staff-2');
  const [clientMessage, setClientMessage] = useState(application.clientMessage || '');
  const [newNoteText, setNewNoteText] = useState('');
  const [unmaskSensitive, setUnmaskSensitive] = useState(false);

  // Document rejection modal/state
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Handle status update
  const handleSaveStatus = () => {
    const staff = STAFF_MEMBERS.find(s => s.id === assignedStaffId);
    const now = new Date().toISOString();

    const newHistory: StatusHistoryItem = {
      id: `hist-${Date.now()}`,
      status: currentStatus,
      timestamp: now,
      updatedBy: staff ? staff.name : 'Admin',
      remarks: statusRemarks || `Status updated to ${currentStatus}`,
    };

    // Calculate stage index roughly
    let stageIndex = 0;
    if (['Documents Under Verification', 'Documents Verified'].includes(currentStatus)) stageIndex = 1;
    if (['Name Preparation', 'Name Reservation'].includes(currentStatus)) stageIndex = 2;
    if (['Application Preparation', 'MCA / Authority Filing'].includes(currentStatus)) stageIndex = 3;
    if (['Under Processing', 'Additional Information Required'].includes(currentStatus)) stageIndex = 4;
    if (['Approved'].includes(currentStatus)) stageIndex = 5;
    if (['Completed'].includes(currentStatus)) stageIndex = 6;

    const updatedApp: ApplicationRecord = {
      ...application,
      status: currentStatus,
      currentStageIndex: stageIndex,
      assignedStaffId,
      assignedStaffName: staff?.name,
      clientMessage,
      updatedAt: now,
      history: [...application.history, newHistory],
    };

    onUpdate(updatedApp);
    setStatusRemarks('');
  };

  // Handle document verification
  const handleVerifyDocument = (docId: string) => {
    const updatedDocs = application.documents.map(d => {
      if (d.id === docId) {
        return { ...d, status: 'verified' as const, rejectionReason: undefined };
      }
      return d;
    });

    const updated: ApplicationRecord = {
      ...application,
      documents: updatedDocs,
      updatedAt: new Date().toISOString(),
    };
    onUpdate(updated);
  };

  // Handle document rejection / request re-upload
  const handleRejectDocument = (docId: string) => {
    if (!rejectionReason.trim()) return;

    const updatedDocs = application.documents.map(d => {
      if (d.id === docId) {
        return {
          ...d,
          status: 'reupload_required' as const,
          rejectionReason,
        };
      }
      return d;
    });

    const now = new Date().toISOString();
    const updated: ApplicationRecord = {
      ...application,
      documents: updatedDocs,
      status: 'Additional Information Required',
      clientMessage: `Document Action Required: ${rejectionReason}`,
      updatedAt: now,
      history: [
        ...application.history,
        {
          id: `hist-${Date.now()}`,
          status: 'Additional Information Required',
          timestamp: now,
          updatedBy: 'Nagu Verification Desk',
          remarks: `Re-upload requested for document: ${rejectionReason}`,
        },
      ],
    };

    onUpdate(updated);
    setRejectingDocId(null);
    setRejectionReason('');
  };

  // Add internal staff note
  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const staff = STAFF_MEMBERS.find(s => s.id === assignedStaffId);

    const note: AdminNote = {
      id: `note-${Date.now()}`,
      author: staff ? staff.name : 'Nagu Admin',
      text: newNoteText,
      createdAt: new Date().toISOString(),
      isInternal: true,
    };

    const updated: ApplicationRecord = {
      ...application,
      notes: [...application.notes, note],
      updatedAt: new Date().toISOString(),
    };

    onUpdate(updated);
    setNewNoteText('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg sm:text-xl font-bold tracking-wider text-blue-300">
              {application.id}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {application.businessTypeName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setUnmaskSensitive(!unmaskSensitive)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
              title="Admin role security: Toggle full unmasked PAN/Aadhaar data"
            >
              {unmaskSensitive ? <Unlock className="w-3.5 h-3.5 text-amber-400" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
              <span>{unmaskSensitive ? 'Mask PAN/Aadhaar' : 'Unmask KYC (Admin)'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 bg-slate-50 border-b border-slate-200 overflow-x-auto text-xs font-semibold text-slate-600 shrink-0">
          {[
            { id: 'overview', label: 'Overview & Actions', icon: CheckCircle2 },
            { id: 'applicant', label: 'Applicant Details', icon: User },
            { id: 'members', label: `Directors/Partners (${application.members.length})`, icon: Users },
            { id: 'business', label: 'Business & Names', icon: Building2 },
            { id: 'office', label: 'Registered Office', icon: MapPin },
            { id: 'documents', label: `Documents (${application.documents.length})`, icon: FileText },
            { id: 'notes', label: `Internal Notes (${application.notes.length})`, icon: MessageSquare },
            { id: 'history', label: 'Status History', icon: History },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 py-3 px-3.5 border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-700 text-blue-700 font-bold bg-white'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: OVERVIEW & ACTIONS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Quick Status Updater Box */}
              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-4">
                <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-blue-700" />
                  <span>Update Application Workflow Status & Assignment</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Status Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Statutory Status
                    </label>
                    <select
                      value={currentStatus}
                      onChange={(e) => setCurrentStatus(e.target.value as ApplicationStatus)}
                      className="w-full px-3 py-2 rounded-xl border border-blue-300 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      {ALL_STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Assign Staff */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Assigned Compliance Staff
                    </label>
                    <select
                      value={assignedStaffId}
                      onChange={(e) => setAssignedStaffId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-blue-300 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      {STAFF_MEMBERS.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.role.split(' ')[0]})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Client Notice */}
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Remarks / Milestone Log
                    </label>
                    <input
                      type="text"
                      value={statusRemarks}
                      onChange={(e) => setStatusRemarks(e.target.value)}
                      placeholder="e.g., SPICe+ Part A submitted to RoC"
                      className="w-full px-3 py-2 rounded-xl border border-blue-300 bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>

                  {/* Client Portal Message */}
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Public Client Desk Message (Visible to client on tracking page)
                    </label>
                    <input
                      type="text"
                      value={clientMessage}
                      onChange={(e) => setClientMessage(e.target.value)}
                      placeholder="e.g., CRC scrutiny underway. Approval certificate expected in 48 hours."
                      className="w-full px-3 py-2 rounded-xl border border-blue-300 bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleSaveStatus}
                    className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    Save Status & Notify Log
                  </button>
                </div>
              </div>

              {/* Overview Snapshot Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-slate-500 block text-xs">Primary Applicant</span>
                  <span className="font-bold text-slate-900 mt-1 block">{application.applicant.fullName}</span>
                  <span className="text-slate-600 text-xs block">{application.applicant.mobile}</span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-slate-500 block text-xs">Primary Proposed Name</span>
                  <span className="font-bold text-slate-900 font-mono text-xs mt-1 block">
                    {application.business.proposedName1}
                  </span>
                  <span className="text-slate-600 text-xs block">{application.business.natureOfBusiness}</span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-slate-500 block text-xs">Document Verification</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-emerald-700">
                      {application.documents.filter(d => d.status === 'verified').length} / {application.documents.length}
                    </span>
                    <span className="text-xs text-slate-500">verified</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-slate-500 block text-xs">Fee & Billing Status</span>
                  <span className="font-bold text-slate-900 mt-1 block">
                    ₹{application.estimatedFeeINR?.toLocaleString('en-IN') || '9,999'}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 block">
                    {application.paymentStatus || 'Advance Paid'}
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: APPLICANT DETAILS */}
          {activeTab === 'applicant' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 block">Full Name:</span>
                  <span className="font-bold text-slate-900">{application.applicant.fullName}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 block">Parent's Name:</span>
                  <span className="font-semibold text-slate-800">{application.applicant.parentName}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 block">DOB & Gender:</span>
                  <span className="font-semibold text-slate-800">{application.applicant.dob} ({application.applicant.gender})</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 block">PAN:</span>
                  <span className="font-mono font-bold text-blue-800">
                    {unmaskSensitive ? application.applicant.pan : maskPAN(application.applicant.pan)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 block">Aadhaar:</span>
                  <span className="font-mono font-bold text-blue-800">
                    {unmaskSensitive ? application.applicant.aadhaar : maskAadhaar(application.applicant.aadhaar)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 block">Mobile & Email:</span>
                  <span className="font-semibold text-slate-800 block">{application.applicant.mobile}</span>
                  <span className="text-slate-600 text-xs block">{application.applicant.email}</span>
                </div>
                <div className="sm:col-span-2 lg:col-span-3 p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 block">Residential Address:</span>
                  <span className="font-medium text-slate-800">
                    {application.applicant.address}, {application.applicant.city}, {application.applicant.district}, {application.applicant.state} - {application.applicant.pincode}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MEMBERS / DIRECTORS */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              {application.members.map((mem, i) => (
                <div key={mem.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
                        {i + 1}
                      </span>
                      <span className="font-bold text-slate-900 text-sm font-display">
                        {mem.fullName}
                      </span>
                      <span className="text-xs text-blue-700 font-semibold px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200">
                        {mem.designation || mem.roleType}
                      </span>
                    </div>

                    {mem.din && (
                      <span className="text-xs font-mono text-slate-600 bg-white px-2 py-1 rounded-md border border-slate-200">
                        DIN: {mem.din}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">PAN:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {unmaskSensitive ? mem.pan : maskPAN(mem.pan)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Aadhaar:</span>
                      <span className="font-mono text-slate-800">
                        {unmaskSensitive ? mem.aadhaar : maskAadhaar(mem.aadhaar)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Contact:</span>
                      <span className="text-slate-800">{mem.mobile}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Shareholding / Contribution:</span>
                      <span className="font-semibold text-slate-800">
                        {mem.shareholdingPercent ? `${mem.shareholdingPercent}% (${mem.numberOfShares} shares)` : 
                         mem.profitSharingPercent ? `${mem.profitSharingPercent}% (₹${mem.capitalContribution})` :
                         mem.relationshipWithPromoter ? `Nominee (${mem.relationshipWithPromoter})` : 'Promoter'}
                      </span>
                    </div>
                    <div className="col-span-2 sm:col-span-4">
                      <span className="text-slate-500 block">Residential Address:</span>
                      <span className="text-slate-800">{mem.address || 'Same as promoter address'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: BUSINESS & NAMES */}
          {activeTab === 'business' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block">
                  Proposed Entity Names
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2 bg-white rounded-lg border border-blue-200">
                    <span className="text-[10px] text-slate-400 block">Preference 1</span>
                    <span className="font-bold text-blue-900 font-mono text-xs">{application.business.proposedName1}</span>
                  </div>
                  {application.business.proposedName2 && (
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Preference 2</span>
                      <span className="font-medium text-slate-800 font-mono text-xs">{application.business.proposedName2}</span>
                    </div>
                  )}
                  {application.business.proposedName3 && (
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Preference 3</span>
                      <span className="font-medium text-slate-800 font-mono text-xs">{application.business.proposedName3}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 block">Industry Nature:</span>
                  <span className="font-semibold text-slate-900">{application.business.natureOfBusiness}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 block">NIC Code:</span>
                  <span className="font-semibold text-slate-900">{application.business.nicCode || 'Not provided (CS to map)'}</span>
                </div>
                <div className="sm:col-span-2 p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 block">Main Business Activity:</span>
                  <span className="font-semibold text-slate-900">{application.business.mainActivity}</span>
                </div>
                <div className="sm:col-span-2 p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 block">Detailed Description for MOA Objects:</span>
                  <p className="text-slate-700 leading-relaxed mt-1 text-xs">{application.business.businessDescription}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: REGISTERED OFFICE */}
          {activeTab === 'office' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 block">Property Type:</span>
                  <span className="font-bold text-slate-900 capitalize">{application.office.officeType} Property</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 block">Owner / Landlord Name:</span>
                  <span className="font-bold text-slate-900">{application.office.ownerName}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 block">Owner Contact:</span>
                  <span className="font-semibold text-slate-800">{application.office.ownerMobile}</span>
                </div>
                <div className="sm:col-span-3 p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 block">Full Registered Office Address:</span>
                  <span className="font-semibold text-slate-900">
                    {application.office.doorNo}, {application.office.street}, {application.office.area}, {application.office.city}, {application.office.district}, {application.office.state} - {application.office.pincode}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DOCUMENT VERIFICATION */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-display">
                    Applicant Dossier & Statutory Records
                  </h3>
                  <p className="text-xs text-slate-500">
                    Inspect applicant KYC and registered office proofs. Review, verify, or update scrutiny action.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  {application.documents.length} Files Attached
                </span>
              </div>

              <DocumentManagementCard
                documents={application.documents}
                applicationId={application.id}
                canManageStatus={true}
                onDocumentsChange={(updatedDocs) => {
                  onUpdate({
                    ...application,
                    documents: updatedDocs,
                    updatedAt: new Date().toISOString(),
                  });
                }}
              />
            </div>
          )}

          {/* TAB 7: INTERNAL STAFF NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Add Internal Compliance Note
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Enter confidential internal note (e.g., MCA CRC examiner requested DIN link confirmation)..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <button
                    type="button"
                    onClick={handleAddNote}
                    disabled={!newNoteText.trim()}
                    className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl text-xs sm:text-sm disabled:opacity-50"
                  >
                    Post Note
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Note History ({application.notes.length})
                </h4>
                {application.notes.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No internal notes posted yet.</p>
                ) : (
                  application.notes.map(n => (
                    <div key={n.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-900">{n.author}</span>
                        <span className="text-slate-400 tabular-nums">{formatDateTime(n.createdAt)}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{n.text}</p>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* TAB 8: AUDIT & STATUS HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Statutory Milestone Audit Log
              </h4>

              <div className="divide-y divide-slate-100 border rounded-2xl border-slate-200 overflow-hidden">
                {application.history.map((h) => (
                  <div key={h.id} className="p-4 bg-white flex items-start justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{h.status}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500">Updated by {h.updatedBy}</span>
                      </div>
                      <p className="text-slate-600 mt-1">{h.remarks}</p>
                    </div>
                    <span className="text-slate-400 tabular-nums shrink-0">{formatDateTime(h.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Assigned: <strong className="text-slate-800">{application.assignedStaffName || 'Priya Sharma'}</strong> · Last modified: {formatDateTime(application.updatedAt)}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Close Dossier
          </button>
        </div>

      </div>
    </div>
  );
};
