import React, { useState, useRef } from 'react';
import { UploadedDocument, DocumentStatus } from '../../types';
import { AuthUser } from '../../types/auth';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { 
  storeDocumentBlob, 
  deleteDocumentBlob, 
  getDocumentBlob, 
  createSyntheticSampleBlob,
  updateDocumentVerificationStatus 
} from '../../services/secureDocumentVault';
import { 
  FileText, 
  Image as ImageIcon, 
  Eye, 
  Download, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  ShieldCheck, 
  UploadCloud,
  FileCode,
  Tag,
  Check
} from 'lucide-react';
import { formatDate } from '../../utils/storage';

interface DocumentManagementCardProps {
  documents: UploadedDocument[];
  applicationId?: string;
  customerId?: string;
  currentUser?: AuthUser | null;
  onDocumentsChange?: (updatedDocs: UploadedDocument[]) => void;
  canManageStatus?: boolean; // For Admin & Staff to change verification status
  readOnly?: boolean;
}

export const DocumentManagementCard: React.FC<DocumentManagementCardProps> = ({
  documents,
  applicationId = 'NE-BR-DRAFT',
  customerId = 'usr_guest',
  currentUser,
  onDocumentsChange,
  canManageStatus = false,
  readOnly = false,
}) => {
  const [previewDoc, setPreviewDoc] = useState<UploadedDocument | null>(null);
  const [activeReplaceDocId, setActiveReplaceDocId] = useState<string | null>(null);
  const [statusChangeDocId, setStatusChangeDocId] = useState<string | null>(null);
  const [statusReason, setStatusReason] = useState<string>('');
  const [pendingStatus, setPendingStatus] = useState<DocumentStatus | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Status Badge styling helper
  const renderStatusBadge = (rawStatus: DocumentStatus) => {
    const status = (rawStatus || 'UPLOADED').toUpperCase();

    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>VERIFIED</span>
          </span>
        );
      case 'UNDER REVIEW':
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>UNDER REVIEW</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>REJECTED</span>
          </span>
        );
      case 'REPLACEMENT REQUIRED':
      case 'REUPLOAD_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
            <span>REPLACEMENT REQUIRED</span>
          </span>
        );
      case 'REQUIRED':
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Tag className="w-3.5 h-3.5 text-slate-500" />
            <span>REQUIRED</span>
          </span>
        );
      case 'UPLOADED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Check className="w-3.5 h-3.5 text-blue-600" />
            <span>UPLOADED</span>
          </span>
        );
    }
  };

  // Handle Secure File Replacement
  const handleTriggerReplace = (docId: string) => {
    setActiveReplaceDocId(docId);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !activeReplaceDocId) return;
    const file = e.target.files[0];
    const existing = documents.find(d => d.id === activeReplaceDocId);
    if (!existing) return;

    try {
      // Store raw Blob in secure IndexedDB Vault
      const updatedMeta = await storeDocumentBlob({
        documentId: existing.id,
        applicationId,
        customerId: currentUser?.id || customerId,
        documentType: existing.documentType || existing.title,
        fileName: file.name,
        fileType: file.type || 'application/pdf',
        blob: file,
      });

      // Update state without base64
      const nextDocs = documents.map(d => d.id === existing.id ? updatedMeta : d);
      if (onDocumentsChange) {
        onDocumentsChange(nextDocs);
      }
    } catch (err: any) {
      console.error('Failed to replace file:', err);
    } finally {
      setActiveReplaceDocId(null);
    }
  };

  // Handle Document Removal
  const handleRemove = async (docId: string) => {
    try {
      await deleteDocumentBlob(docId, currentUser);
    } catch {
      // ignore
    }
    const nextDocs = documents.filter(d => d.id !== docId);
    if (onDocumentsChange) {
      onDocumentsChange(nextDocs);
    }
  };

  // Handle Direct Download
  const handleDownload = async (doc: UploadedDocument) => {
    try {
      let blob: Blob | null = null;
      try {
        const record = await getDocumentBlob(doc.id, currentUser);
        if (record) blob = record.blob;
      } catch (err: any) {
        if (err.message?.includes('Access Denied')) {
          alert(err.message);
          return;
        }
      }

      if (!blob) {
        blob = createSyntheticSampleBlob(doc.documentType || doc.title, doc.fileName, doc.fileType);
      }

      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = doc.fileName || `${doc.documentType || 'document'}.pdf`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  // Status Change by Admin / Staff
  const handleSaveStatusChange = () => {
    if (!statusChangeDocId || !pendingStatus) return;

    const nextDocs = documents.map(d => {
      if (d.id === statusChangeDocId) {
        return {
          ...d,
          status: pendingStatus,
          rejectionReason: statusReason.trim() || undefined,
        };
      }
      return d;
    });

    if (onDocumentsChange) {
      onDocumentsChange(nextDocs);
    }

    if (applicationId && applicationId !== 'NE-BR-DRAFT') {
      updateDocumentVerificationStatus(
        applicationId,
        statusChangeDocId,
        pendingStatus,
        statusReason.trim() || undefined,
        currentUser?.fullName || 'Nagu Compliance Desk'
      );
    }

    setStatusChangeDocId(null);
    setPendingStatus(null);
    setStatusReason('');
  };

  if (!documents || documents.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
        <UploadCloud className="w-10 h-10 text-slate-400 mx-auto" />
        <h4 className="text-sm font-bold text-slate-700 mt-2 font-display">No Documents Uploaded</h4>
        <p className="text-xs text-slate-500 mt-1">
          Statutory compliance documents will appear here once attached.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Hidden file input for Replace action */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFilePicked}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
      />

      {/* Professional Document-Management Card List */}
      <div className="grid grid-cols-1 gap-4">
        {documents.map((doc) => {
          const isPdf = doc.fileType?.toLowerCase().includes('pdf') || doc.fileName.toLowerCase().endsWith('.pdf');
          const isImage = doc.fileType?.toLowerCase().includes('image') || /\.(jpg|jpeg|png)$/i.test(doc.fileName);

          return (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all space-y-4"
            >
              {/* Main Document Summary Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Left: Document Type & Identifiers */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                    isPdf ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-blue-50 text-blue-600 border border-blue-200'
                  }`}>
                    {isPdf ? <FileText className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900 font-display">
                        {doc.documentType || doc.title}
                      </h4>
                      {renderStatusBadge(doc.status)}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                      <span className="font-medium text-slate-700 truncate max-w-xs" title={doc.fileName}>
                        📄 {doc.fileName}
                      </span>
                      <span>•</span>
                      <span className="uppercase font-mono font-semibold text-slate-600">
                        {isPdf ? 'PDF Document' : 'Image File'}
                      </span>
                      <span>•</span>
                      <span className="font-mono">{doc.fileSizeFormatted}</span>
                      <span>•</span>
                      <span>Uploaded {formatDate(doc.uploadDate)}</span>
                    </div>

                    {/* Associated Metadata IDs for Statutory Traceability */}
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 mt-2 font-mono">
                      <span>DOC ID: <strong className="text-slate-600">{doc.id}</strong></span>
                      {doc.applicationId && (
                        <span>• APP: <strong className="text-blue-700">{doc.applicationId}</strong></span>
                      )}
                      {doc.customerId && (
                        <span>• CLIENT: <strong className="text-slate-600">{doc.customerId}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Standard Actions (View / Preview, Download, Replace, Remove) */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-center">
                  
                  {/* 1. View / Preview */}
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(doc)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-colors"
                    title="Open secure preview viewer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View / Preview</span>
                  </button>

                  {/* 2. Download */}
                  <button
                    type="button"
                    onClick={() => handleDownload(doc)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                    title="Download decrypted document"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>

                  {/* 3. Replace */}
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleTriggerReplace(doc.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold transition-colors"
                      title="Replace with an updated document file"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Replace</span>
                    </button>
                  )}

                  {/* 4. Remove */}
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleRemove(doc.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors"
                      title="Remove this document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}

                  {/* Admin / Staff Verification Status Actions */}
                  {canManageStatus && (
                    <button
                      type="button"
                      onClick={() => {
                        setStatusChangeDocId(doc.id);
                        setPendingStatus(doc.status);
                        setStatusReason(doc.rejectionReason || '');
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-colors ml-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Scrutiny Action</span>
                    </button>
                  )}

                </div>
              </div>

              {/* Rejection / Scrutiny Reason Notice if Applicable */}
              {doc.rejectionReason && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Scrutiny Notice ({doc.status}):</strong> {doc.rejectionReason}
                  </div>
                </div>
              )}

              {/* Admin Scrutiny Dialog inline when triggered */}
              {canManageStatus && statusChangeDocId === doc.id && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-300 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Update Scrutiny Status: {doc.documentType || doc.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => setStatusChangeDocId(null)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['VERIFIED', 'UNDER REVIEW', 'REPLACEMENT REQUIRED', 'REJECTED'] as DocumentStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setPendingStatus(st)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                          pendingStatus === st 
                            ? 'bg-blue-700 text-white border-blue-700 shadow-xs' 
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {(pendingStatus === 'REJECTED' || pendingStatus === 'REPLACEMENT REQUIRED') && (
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Reason for {pendingStatus} (will be shown to client):
                      </label>
                      <input
                        type="text"
                        value={statusReason}
                        onChange={(e) => setStatusReason(e.target.value)}
                        placeholder="e.g. Self-attestation signature is blurred / Address mismatch"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setStatusChangeDocId(null)}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-semibold"
                    >
                      Dismiss
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveStatusChange}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                    >
                      Save Status Update
                    </button>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Secure Document Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          document={previewDoc}
          currentUser={currentUser}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
};
