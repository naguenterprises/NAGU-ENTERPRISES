import React, { useRef, useState } from 'react';
import { UploadedDocument, RequiredDocumentDef, BusinessType, OfficeType } from '../../types';
import { getRequiredDocumentsForFlow } from '../../data/businessTypes';
import { 
  UploadCloud, 
  FileCheck, 
  Trash2, 
  RefreshCw, 
  FileText, 
  Image, 
  ShieldCheck, 
  ArrowLeft, 
  ArrowRight,
  AlertTriangle,
  Info
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
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Dynamically compute the required checklist
  const dynamicDocDefs = getRequiredDocumentsForFlow(businessType.id, officeType);

  // Helper to get uploaded document state for a def
  const getUploadedDoc = (docDefId: string): UploadedDocument | undefined => {
    return documents.find(d => d.docDefId === docDefId);
  };

  const handleFileUpload = (docDef: RequiredDocumentDef, file: File) => {
    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMsg(`File "${file.name}" exceeds the 5MB size limit. Please choose a smaller file.`);
      return;
    }

    // Validate type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Invalid file format. Supported formats are PDF, JPG, JPEG, and PNG.');
      return;
    }

    setErrorMsg('');

    // Format size
    const sizeFormatted = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    // Create simulated data URL for preview
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;

      const newDoc: UploadedDocument = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        docDefId: docDef.id,
        title: docDef.title,
        fileName: file.name,
        fileSizeFormatted: sizeFormatted,
        uploadDate: new Date().toISOString().split('T')[0],
        dataUrl,
        fileType: file.type,
        status: 'uploaded',
        required: docDef.required,
      };

      const updated = documents.filter(d => d.docDefId !== docDef.id);
      onChange([...updated, newDoc]);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveDoc = (docDefId: string) => {
    onChange(documents.filter(d => d.docDefId !== docDefId));
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
              Document Checklist & Upload
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

      {/* Dynamic Document Cards List */}
      <div className="space-y-4">
        {dynamicDocDefs.map((docDef) => {
          const uploaded = getUploadedDoc(docDef.id);
          const isUploaded = !!uploaded;

          return (
            <div
              key={docDef.id}
              className={`p-5 rounded-2xl border transition-all ${
                isUploaded
                  ? 'bg-blue-50/30 border-blue-200'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Left: Document Info */}
                <div className="flex items-start gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isUploaded ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {uploaded?.fileType.includes('image') ? (
                      <Image className="w-5 h-5" />
                    ) : (
                      <FileText className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base font-display">
                        {docDef.title}
                      </h3>
                      {docDef.required ? (
                        <span className="text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                          Required
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          Optional
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-slate-500 mt-0.5">
                      {docDef.description}
                    </p>

                    {/* Uploaded File Pill */}
                    {isUploaded && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-blue-800 bg-white border border-blue-200 px-3 py-1.5 rounded-lg w-fit">
                        <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium truncate max-w-xs">{uploaded.fileName}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500 tabular-nums">{uploaded.fileSizeFormatted}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 sm:self-center shrink-0">
                  <input
                    type="file"
                    ref={(el) => {
                      fileInputRefs.current[docDef.id] = el;
                    }}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(docDef, e.target.files[0]);
                      }
                    }}
                  />

                  {!isUploaded ? (
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[docDef.id]?.click()}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Upload Document</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[docDef.id]?.click()}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors"
                        title="Replace this document"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Replace</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(docDef.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors"
                        title="Remove uploaded document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Security guarantee */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-slate-600 text-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <span>
          <strong>Data Protection & UIDAI Guidelines:</strong> Your KYC documents are encrypted and accessible only by authorized Nagu Enterprises compliance associates. Personal identification numbers like Aadhaar and PAN are automatically masked in all preview manifests.
        </span>
      </div>

      {/* Bottom Nav */}
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
          type="button"
          onClick={handleNext}
          className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold bg-blue-700 hover:bg-blue-800 text-white shadow-md transition-all"
        >
          <span>Save & Continue to Review</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
