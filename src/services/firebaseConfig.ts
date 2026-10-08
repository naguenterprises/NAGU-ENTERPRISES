/**
 * Nagu Enterprises - Firebase & Firestore Architecture Layer
 * 
 * Prepares the application for:
 * 1. Firebase Authentication (Client OTP/Email & Staff Multi-factor login)
 * 2. Cloud Firestore Database (Encrypted NoSQL persistence with real-time listeners)
 * 3. Firebase Cloud Storage (Secure, private KYC vault with time-limited signed URLs)
 */

import { ApplicationRecord, UploadedDocument } from '../types';

export const FIRESTORE_COLLECTIONS = {
  APPLICATIONS: 'applications',
  CLIENTS: 'clients',
  DOCUMENTS: 'documents',
  AUDIT_LOGS: 'audit_logs',
  STAFF_USERS: 'staff_users',
} as const;

export interface FirestoreClientProfile {
  uid: string;
  email: string;
  phone: string;
  fullName: string;
  createdAt: string;
  registeredApplications: string[]; // List of Application IDs (e.g. ['NE-BR-2026-0001'])
  role: 'client' | 'staff' | 'admin';
}

export interface FirestoreDocumentMetadata {
  id: string;
  applicationId: string;
  docDefId: string;
  title: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  storageVaultPath: string; // e.g. 'secure_vault/applications/NE-BR-2026-0001/doc-123.pdf'
  uploadedAt: string;
  uploadedByUid: string;
  status: 'pending' | 'uploaded' | 'under_review' | 'verified' | 'rejected' | 'reupload_required';
  rejectionReason?: string;
  verifiedByStaffId?: string;
  verifiedAt?: string;
  isMaskedInAudit: boolean;
}

/**
 * Proposed Firestore Security Rules for deployment:
 * 
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     // Helper functions
 *     function isAuthenticated() { return request.auth != null; }
 *     function isStaff() { return isAuthenticated() && request.auth.token.role in ['staff', 'admin']; }
 *     function isOwner(applicationId) { 
 *       return isAuthenticated() && resource.data.applicant.mobile == request.auth.token.phone_number;
 *     }
 * 
 *     // Applications Collection
 *     match /applications/{applicationId} {
 *       allow read: if isStaff() || isOwner(applicationId);
 *       allow create: if true; // Allows public client onboarding intake with validation
 *       allow update: if isStaff() || (isOwner(applicationId) && request.resource.data.status == resource.data.status);
 *       allow delete: if false; // Statutory records cannot be hard deleted
 *     }
 * 
 *     // Documents Collection
 *     match /documents/{docId} {
 *       allow read: if isStaff() || (isAuthenticated() && request.auth.uid == resource.data.uploadedByUid);
 *       allow write: if isStaff() || isAuthenticated();
 *     }
 *   }
 * }
 */

// Serializer for Cloud Firestore document representation
export function serializeForFirestore(app: ApplicationRecord): Record<string, any> {
  return {
    applicationId: app.id,
    businessTypeId: app.businessTypeId,
    businessTypeName: app.businessTypeName,
    status: app.status,
    currentStageIndex: app.currentStageIndex,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
    applicant: {
      ...app.applicant,
      // Metadata tags for search indices in Firestore
      searchTokens: [
        app.id.toLowerCase(),
        app.applicant.fullName.toLowerCase(),
        app.applicant.mobile,
        app.applicant.email.toLowerCase(),
      ],
    },
    members: app.members,
    business: app.business,
    office: app.office,
    documents: app.documents.map((d: UploadedDocument) => ({
      id: d.id,
      docDefId: d.docDefId,
      title: d.title,
      fileName: d.fileName,
      fileSizeFormatted: d.fileSizeFormatted,
      uploadDate: d.uploadDate,
      fileType: d.fileType,
      status: d.status,
      rejectionReason: d.rejectionReason || null,
      required: d.required,
      // Omit large base64 dataUrl in main Firestore document; store in Cloud Storage vault
      storageVaultPath: `secure_vault/applications/${app.id}/${d.id}`,
    })),
    declarationConfirmed: app.declarationConfirmed,
    assignedStaffId: app.assignedStaffId || null,
    assignedStaffName: app.assignedStaffName || null,
    clientMessage: app.clientMessage || null,
    notes: app.notes,
    history: app.history,
    estimatedFeeINR: app.estimatedFeeINR || null,
    paymentStatus: app.paymentStatus || 'Unpaid',
  };
}
