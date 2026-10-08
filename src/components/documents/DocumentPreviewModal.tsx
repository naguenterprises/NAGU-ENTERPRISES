import React, { useState, useEffect } from 'react';
import { UploadedDocument } from '../../types';
import { AuthUser } from '../../types/auth';
import { getDocumentBlob, createSyntheticSampleBlob } from '../../services/secureDocumentVault';
import { 
  X, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  ShieldCheck, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCw, 
  Lock,
  AlertTriangle
} from 'lucide-react';
import { formatDate } from '../../utils/storage';

interface DocumentPreviewModalProps {
  document: UploadedDocument;
  currentUser?: AuthUser | null;
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  currentUser,
  onClose,
}) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);

  useEffect(() => {
    let activeUrl: string | null = null;
    let isMounted = true;

    async function loadBlob() {
      setLoading(true);
      setError(null);
      try {
        let blob: Blob | null = null;
        try {
          const record = await getDocumentBlob(document.id, currentUser);
          if (record) {
            blob = record.blob;
          }
        } catch (err: any) {
          // If RBAC blocked, surface exact security exception
          if (err?.message?.includes('Access Denied') || err?.message?.includes('Unauthorized')) {
            throw err;
          }
        }

        // If no stored blob found in vault (e.g. pre-seeded test file), generate synthetic encrypted sample blob
        if (!blob) {
          blob = createSyntheticSampleBlob(
            document.documentType || document.title,
            document.fileName,
            document.fileType || 'application/pdf'
          );
        }

        if (isMounted && blob) {
          activeUrl = URL.createObjectURL(blob);
          setObjectUrl(activeUrl);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Unable to open secure document preview.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadBlob();

    return () => {
      isMounted = false;
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [document.id, currentUser]);

  const isPdf = document.fileType?.toLowerCase().includes('pdf') || document.fileName.toLowerCase().endsWith('.pdf');

  const handleDownload = () => {
    if (!objectUrl) return;
    const a = window.document.createElement('a');
    a.href = objectUrl;
    a.download = document.fileName || 'Nagu_Enterprises_Document.pdf';
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Top Preview Control Bar */}
        <div className="p-4 sm:px-6 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
              {isPdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white truncate font-display">
                  {document.documentType || document.title}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {document.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {document.fileName} • {document.fileSizeFormatted}
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            {!isPdf && (
              <>
                <button
                  type="button"
                  onClick={() => setZoom(prev => Math.max(50, prev - 25))}
                  className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-slate-400 w-12 text-center hidden sm:inline-block">
                  {zoom}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom(prev => Math.min(200, prev + 25))}
                  className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                  title="Rotate 90 degrees"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
              title="Secure Download"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors ml-2"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Canvas / Viewer Container */}
        <div className="flex-1 overflow-auto bg-slate-950 p-4 sm:p-6 flex items-center justify-center relative">
          
          {loading && (
            <div className="text-center space-y-3">
              <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-medium">Decrypting file from Document Vault...</p>
            </div>
          )}

          {error && (
            <div className="max-w-md p-6 bg-rose-950/40 border border-rose-800/60 rounded-2xl text-center space-y-3">
              <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
              <h4 className="text-sm font-bold text-white">Access Prohibited or Render Failure</h4>
              <p className="text-xs text-rose-300">{error}</p>
            </div>
          )}

          {!loading && !error && objectUrl && (
            isPdf ? (
              <iframe
                src={`${objectUrl}#toolbar=0&navpanes=0`}
                className="w-full h-full rounded-2xl bg-white border border-slate-800 shadow-inner"
                title={`Secure PDF Preview - ${document.fileName}`}
              />
            ) : (
              <div 
                className="flex items-center justify-center transition-transform duration-200"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                }}
              >
                <img
                  src={objectUrl}
                  alt={document.fileName}
                  className="max-h-[75vh] max-w-full rounded-2xl shadow-2xl object-contain border border-slate-800 bg-slate-900"
                />
              </div>
            )
          )}
        </div>

        {/* Statutory Compliance Footer Notice */}
        <div className="p-3 sm:px-6 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted In-Memory Streaming • No Public URLs • Ephemeral Token</span>
          </div>
          <div className="text-slate-500">
            Uploaded on {formatDate(document.uploadDate)}
          </div>
        </div>

      </div>
    </div>
  );
};
