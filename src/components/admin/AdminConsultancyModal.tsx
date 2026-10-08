import React, { useState } from 'react';
import { ConsultancyRecord, ConsultancyStatus } from '../../types/consultancy';
import { STAFF_MEMBERS } from '../../data/staffMembers';
import { CONSULTANCY_TIMELINE_STAGES } from '../../data/consultancyServices';
import { 
  X, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  DollarSign, 
  FileText, 
  Send, 
  Download, 
  Check, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface AdminConsultancyModalProps {
  record: ConsultancyRecord;
  onClose: () => void;
  onUpdate: (updated: ConsultancyRecord) => void;
}

export const AdminConsultancyModal: React.FC<AdminConsultancyModalProps> = ({
  record,
  onClose,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'manage' | 'documents' | 'notes' | 'history'>('overview');
  
  // Management state
  const [status, setStatus] = useState<ConsultancyStatus>(record.status);
  const [assignedStaffId, setAssignedStaffId] = useState(record.assignedConsultantId || '');
  const [quotationFee, setQuotationFee] = useState<number>(record.quotationFeeINR || 0);
  const [paymentStatus, setPaymentStatus] = useState<'Unpaid' | 'Advance Paid' | 'Fully Paid'>(record.paymentStatus);
  const [followUpDate, setFollowUpDate] = useState(record.followUpDate || '');
  const [meetingDate, setMeetingDate] = useState(record.consultationMeetingDate || '');
  const [nextAction, setNextAction] = useState(record.nextAction || '');
  const [clientMessage, setClientMessage] = useState(record.clientMessage || '');
  
  // Notes state
  const [newNoteText, setNewNoteText] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('Admin Desk');

  const statusList: ConsultancyStatus[] = [
    'New',
    'Under Review',
    'Consultant Assigned',
    'Documents Pending',
    'Quotation Sent',
    'Payment Pending',
    'In Progress',
    'Client Review',
    'Completed',
  ];

  const handleSaveChanges = () => {
    const assignedStaff = STAFF_MEMBERS.find(s => s.id === assignedStaffId);
    const timestamp = new Date().toISOString();

    const isStatusChanged = status !== record.status;
    const historyUpdate = isStatusChanged
      ? [
          {
            id: `hist-${Date.now()}`,
            status,
            timestamp,
            updatedBy: noteAuthor,
            remarks: `Status updated from ${record.status} to ${status}.`,
          },
          ...record.history,
        ]
      : record.history;

    const updated: ConsultancyRecord = {
      ...record,
      status,
      assignedConsultantId: assignedStaffId || undefined,
      assignedConsultantName: assignedStaff ? `${assignedStaff.name} (${assignedStaff.role})` : undefined,
      quotationFeeINR: quotationFee > 0 ? quotationFee : undefined,
      paymentStatus,
      followUpDate: followUpDate || undefined,
      consultationMeetingDate: meetingDate || undefined,
      nextAction: nextAction || undefined,
      clientMessage: clientMessage || undefined,
      updatedAt: timestamp,
      history: historyUpdate,
    };

    onUpdate(updated);
    alert('Consultancy request updated successfully.');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote = {
      id: `cnote-${Date.now()}`,
      author: noteAuthor,
      text: newNoteText.trim(),
      createdAt: new Date().toISOString(),
      isInternal: true,
    };

    const updated: ConsultancyRecord = {
      ...record,
      notes: [newNote, ...record.notes],
      updatedAt: new Date().toISOString(),
    };

    onUpdate(updated);
    setNewNoteText('');
  };

  const handleMarkCompleted = () => {
    setStatus('Completed');
    const timestamp = new Date().toISOString();
    const updated: ConsultancyRecord = {
      ...record,
      status: 'Completed',
      updatedAt: timestamp,
      history: [
        {
          id: `hist-${Date.now()}`,
          status: 'Completed',
          timestamp,
          updatedBy: noteAuthor,
          remarks: 'Engagement marked as Completed by staff.',
        },
        ...record.history,
      ],
    };
    onUpdate(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              CON
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-mono tracking-tight text-white">
                  {record.id}
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {record.requirement.subServiceName}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {record.business.businessName} • Client: {record.client.fullName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkCompleted}
              disabled={record.status === 'Completed'}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark Completed
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 bg-slate-50 border-b border-slate-200 flex items-center gap-4 text-xs font-medium shrink-0 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Requirements' },
            { id: 'manage', label: 'Workflow & Quotation' },
            { id: 'documents', label: `Documents (${record.documents.length})` },
            { id: 'notes', label: `Internal Notes (${record.notes.length})` },
            { id: 'history', label: 'Audit Timeline' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 border-b-2 font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Status Banner */}
              <div className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/50 border-blue-200">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Current Engagement Status
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-xs font-extrabold bg-blue-600 text-white">
                      {record.status}
                    </span>
                    <span className="text-xs text-slate-600">
                      Assigned to: <strong>{record.assignedConsultantName || 'Unassigned (General Queue)'}</strong>
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">Payment Status</span>
                  <strong className={`text-xs ${
                    record.paymentStatus === 'Fully Paid' ? 'text-emerald-700' : record.paymentStatus === 'Advance Paid' ? 'text-blue-700' : 'text-amber-700'
                  }`}>
                    {record.paymentStatus} {record.quotationFeeINR ? `(₹${record.quotationFeeINR.toLocaleString('en-IN')})` : ''}
                  </strong>
                </div>
              </div>

              {/* Client & Business 2-Column Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Client Profile */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" /> Client Profile
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div><strong>Name:</strong> {record.client.fullName}</div>
                    <div><strong>Mobile:</strong> +91 {record.client.mobile}</div>
                    <div><strong>Email:</strong> {record.client.email}</div>
                    <div><strong>Location:</strong> {record.client.city}, {record.client.state}</div>
                    <div><strong>Preferred Mode:</strong> <span className="font-bold text-blue-700">{record.preference}</span></div>
                  </div>
                </div>

                {/* Business Profile */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" /> Enterprise Details
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div><strong>Name:</strong> {record.business.businessName} ({record.business.businessType})</div>
                    <div><strong>Industry:</strong> {record.business.industry}</div>
                    <div><strong>Stage:</strong> {record.business.businessStage}</div>
                    <div><strong>Turnover:</strong> {record.business.currentTurnover}</div>
                    <div><strong>Investment:</strong> ₹{record.business.approximateInvestment.toLocaleString('en-IN')}</div>
                  </div>
                </div>

              </div>

              {/* Requirement Scope */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-600">
                  Consultancy Scope & Goal
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500 font-semibold block">Primary Goal:</span>
                    <p className="text-slate-800 font-medium">{record.requirement.mainBusinessGoal || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Scope Description:</span>
                    <p className="text-slate-800 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                      {record.requirement.description}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-[11px] border-t border-slate-200">
                    <div>
                      <span className="text-slate-400 block">Funding Required:</span>
                      <strong>{record.requirement.fundingRequired ? `YES (₹${record.requirement.approximateFundingAmount?.toLocaleString('en-IN')})` : 'NO'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Expected Timeline:</span>
                      <strong>{record.requirement.expectedTimeline}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Submission Date:</span>
                      <strong>{new Date(record.createdAt).toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MANAGE & WORKFLOW */}
          {activeTab === 'manage' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Status Update */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Consultancy Status Workflow
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ConsultancyStatus)}
                    className="w-full text-xs font-bold px-3 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 text-blue-900"
                  >
                    {statusList.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500">
                    Changing status triggers an entry in the client tracking timeline.
                  </p>
                </div>

                {/* Assign Consultant */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Assign Staff / Domain Consultant
                  </label>
                  <select
                    value={assignedStaffId}
                    onChange={(e) => setAssignedStaffId(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Unassigned (General Queue) --</option>
                    {STAFF_MEMBERS.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                    ))}
                  </select>
                </div>

                {/* Quotation Fee */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Quotation / Professional Fee (₹ INR)
                  </label>
                  <input
                    type="number"
                    step={1000}
                    value={quotationFee}
                    onChange={(e) => setQuotationFee(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 bg-white font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Payment Status */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Payment Status
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full text-xs font-medium px-3 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Advance Paid">Advance Retainer Paid</option>
                    <option value="Fully Paid">Fully Paid</option>
                  </select>
                </div>

                {/* Follow Up Date */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Next Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Consultation Meeting Date & Time */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Consultation Strategy Meeting Schedule
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2026-10-12 at 11:30 AM (Google Meet)"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

              </div>

              {/* Next Action & Client Message */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Internal Next Action
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Prepare Draft DPR report and send CMA data sheets for review"
                    value={nextAction}
                    onChange={(e) => setNextAction(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Client Notification Message (Visible to Client in Tracker)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Message displayed directly to client on their status tracking dashboard..."
                    value={clientMessage}
                    onChange={(e) => setClientMessage(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Save Workflow & Quotation
                </button>
              </div>

            </div>
          )}

          {/* TAB 3: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-700">
                  Client Attached Documents ({record.documents.length})
                </span>
                <span className="text-[11px] text-slate-500">
                  Confidential Corporate Records
                </span>
              </div>

              {record.documents.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                  No documents were uploaded during intake.
                </div>
              ) : (
                <div className="space-y-3">
                  {record.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-900 block">
                          {doc.docType}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>{doc.fileName}</span>
                          <span>({doc.fileSizeFormatted})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {doc.status}
                        </span>
                        <button
                          onClick={() => alert(`Opening simulated preview for ${doc.fileName}`)}
                          className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: INTERNAL NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              
              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Add New Internal Advisory Note
                  </span>
                  <select
                    value={noteAuthor}
                    onChange={(e) => setNoteAuthor(e.target.value)}
                    className="text-xs px-2 py-1 rounded border border-slate-300 bg-white"
                  >
                    <option value="Rajesh Nagu">Rajesh Nagu (Senior Advisor)</option>
                    <option value="Priya Sharma">Priya Sharma, ACS</option>
                    <option value="Admin Desk">Admin Desk</option>
                  </select>
                </div>

                <textarea
                  required
                  rows={2}
                  placeholder="Record client discussions, strategy points, or document review observations..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Add Note
                  </button>
                </div>
              </form>

              {/* Notes List */}
              <div className="space-y-3">
                {record.notes.map((note) => (
                  <div key={note.id} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <strong>{note.author}</strong>
                      <span>{new Date(note.createdAt).toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed">{note.text}</p>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 5: AUDIT TIMELINE */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-200">
                Engagement Audit Log
              </h4>

              <div className="space-y-3">
                {record.history.map((hist, idx) => (
                  <div key={hist.id} className="flex items-start gap-3 text-xs">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900">{hist.status}</strong>
                        <span className="text-[11px] text-slate-400">by {hist.updatedBy}</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{hist.remarks}</p>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {new Date(hist.timestamp).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs">
          <span className="text-slate-500 font-mono">
            Last Updated: {new Date(record.updatedAt).toLocaleDateString('en-IN')}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
