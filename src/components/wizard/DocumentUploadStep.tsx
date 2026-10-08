import React, { useRef, useState } from 'react';
import { UploadedDocument, RequiredDocumentDef, BusinessType, OfficeType } from '../../types';
import { getRequiredDocumentsForFlow } from '../../data/businessTypes';
import { DocumentManagementCard } from '../documents/DocumentManagementCard';
import { storeDocumentBlob } from '../../services/secureDocumentVault';
import { 
  UploadCloud, 
  FileCheck, 
  ShieldCheck, 
  ArrowLeft, 
  ArrowRight,
  AlertTriangle,
  Info,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface DocumentUploadStepProps {
  businessType: BusinessType;
  officeType: OfficeType;
  documents: UploadedDocument[];
  onChange: (docs: UploadedDocument[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const DocumentUploadStep: React.FC<DocumentUploadStepProps> = ({
  businessType,
  officeType,
  documents,
  onChange,
  onNext,
  onBack,
}) => {
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Dynamically compute the required checklist
  const dynamicDocDefs = getRequiredDocumentsForFlow(businessType.id, officeType);

  const getUploadedDoc = (docDefId: string): UploadedDocument | undefined => {
    return documents.find(d => d.docDefId === docDefId);
  };

  const handleFileUpload = async (docDef: RequiredDocumentDef, file: File) => {
    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMsg(`File "${file.name}" exceeds the 5MB size limit. Please select a smaller file.`);
      return;
    }

    // Validate type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Invalid file format. Supported formats are PDF, JPG, JPEG, and PNG.');
      return;
    }

    setErrorMsg('');
    setIsProcessing(true);

    try {
      const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      
      // Store raw Blob securely in browser IndexedDB (zero base64 in state)
      const meta = await storeDocumentBlob({
        documentId: docId,
        applicationId: 'NE-BR-DRAFT',
        customerId: 'usr_applicant_draft',
        documentType: docDef.title,
        fileName: file.name,
        fileType: file.type,
        blob: file,
      });

      // Keep reference to docDefId and required flag
      const completeMeta: UploadedDocument = {
        ...meta,
        docDefId: docDef.id,
        required: docDef.required,
      };

      const updated = documents.filter(d => d.docDefId !== docDef.id);
      onChange([...updated, completeMeta]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to securely store document in vault.');
    } finally {
      setIsProcessing(false);
    }
  };

  const validate = () => {
    setErrorMsg('');

    // Check mandatory documents
    const missing = dynamicDocDefs.filter(def => {
      if (!def.required) return false;
      const uploaded = getUploadedDoc(def.id);
      return !uploaded || !uploaded.fileName;
    });

    if (missing.length > 0) {
      setErrorMsg(`Please upload all mandatory documents (${missing.map(m => m.title).join(', ')}).`);
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  const uploadedCount = dynamicDocDefs.filter(d => !!getUploadedDoc(d.id)).length;
  const totalCount = dynamicDocDefs.length;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
              Document Checklist & Secure Management
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Upload clear self-attested copies of applicant, promoter, and registered office records for {businessType.name}.
            </p>
          </div>
          
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-500 block">Checklist Progress</span>
            <span className="text-sm font-bold text-blue-700">
              {uploadedCount} of {totalCount} uploaded
            </span>
          </div>
        </div>

        {/* Formats banner */}
        <div className="mt-4 p-3 bg-slate-100 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-500" />
            <span>Supported formats: <strong>PDF, JPG, JPEG, PNG</strong></span>
          </div>
          <div>Maximum allowed file size: <strong>5 MB per file</strong></div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Mandatory Statutory Requirements Checklist */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Required Document Categories
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {dynamicDocDefs.map((def) => {
            const uploaded = getUploadedDoc(def.id);
            const isDone = !!uploaded;

            return (
              <div 
                key={def.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isDone 
                    ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-200' 
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {def.title}
                    </h4>
                    {def.required ? (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                        Mandatory
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        Optional
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {def.description}
                  </p>
                </div>

                <div className="shrink-0">
                  <input
                    type="file"
                    ref={(el) => { fileInputRefs.current[def.id] = el; }}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(def, e.target.files[0]);
                      }
                    }}
                  />

                  {!isDone ? (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => fileInputRefs.current[def.id]?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Attached</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PROFESSIONAL DOCUMENT MANAGEMENT CARD LIST */}
      {documents.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 font-display">
              Attached Documents ({documents.length})
            </h3>
            <span className="text-xs text-slate-500">
              Encrypted & stored in secure local vault
            </span>
          </div>

          <DocumentManagementCard
            documents={documents}
            applicationId="NE-BR-DRAFT"
            onDocumentsChange={(updated) => onChange(updated)}
          />
        </div>
      )}

      {/* Security guarantee */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-slate-600 text-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <span>
          <strong>Statutory Compliance & Privacy Protection:</strong> KYC documents are archived securely in accordance with Ministry of Corporate Affairs and UIDAI privacy directives. Personal identification numbers like Aadhaar and PAN are automatically masked in all preview manifests.
        </span>
      </div>

      {/* Bottom Nav */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold bg-blue-700 hover:bg-blue-800 text-white shadow-md transition-all cursor-pointer"
        >
          <span>Save & Continue to Review</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
