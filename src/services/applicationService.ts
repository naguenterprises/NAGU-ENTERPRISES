import { 
  ApplicationRecord, 
  BusinessType, 
  ApplicantDetails, 
  DirectorOrMember, 
  BusinessDetails, 
  RegisteredOffice, 
  UploadedDocument, 
  ApplicationStatus,
  CapitalDetails,
  AdditionalServices,
  DeclarationDetails
} from '../types';
import { getRequiredDocumentsForFlow } from '../data/businessTypes';
import { getStoredApplications, saveApplications } from '../utils/storage';
import { serializeForFirestore } from './firebaseConfig';

export interface ApplicationSubmissionPayload {
  selectedType: BusinessType;
  applicant: ApplicantDetails;
  members: DirectorOrMember[];
  business: BusinessDetails;
  office: RegisteredOffice;
  documents: UploadedDocument[];
  capital?: CapitalDetails;
  additionalServices?: AdditionalServices;
  declarationDetails?: DeclarationDetails;
  declarationConfirmed: boolean;
}

export interface ValidationErrorItem {
  field: string;
  step: number; // 1 to 8
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrorItem[];
}

export interface SubmissionResponse {
  success: boolean;
  application?: ApplicationRecord;
  error?: string;
  validationErrors?: ValidationErrorItem[];
}

/**
 * Strict Pre-submission Validator
 */
export function validateApplication(payload: ApplicationSubmissionPayload): ValidationResult {
  const errors: ValidationErrorItem[] = [];

  // 1. Business Type Validation
  if (!payload.selectedType || !payload.selectedType.id) {
    errors.push({
      field: 'selectedType',
      step: 1,
      message: 'Please select a valid business registration entity type.',
    });
  }

  // 2. Applicant Details Validation
  const app = payload.applicant;
  if (!app.fullName || !app.fullName.trim()) {
    errors.push({ field: 'fullName', step: 2, message: 'Applicant full name is required.' });
  }
  if (!app.parentName || !app.parentName.trim()) {
    errors.push({ field: 'parentName', step: 2, message: "Father / Mother's name is required." });
  }
  if (!app.dob) {
    errors.push({ field: 'dob', step: 2, message: 'Applicant date of birth is required.' });
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!app.email || !emailRegex.test(app.email.trim())) {
    errors.push({ field: 'email', step: 2, message: 'A valid email address is required (e.g. client@example.com).' });
  }

  // Mobile number validation (10 digits)
  const mobileClean = (app.mobile || '').replace(/\D/g, '');
  if (mobileClean.length < 10) {
    errors.push({ field: 'mobile', step: 2, message: 'A valid 10-digit mobile number is required.' });
  }

  // PAN format validation: 5 uppercase letters, 4 numbers, 1 uppercase letter
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const panClean = (app.pan || '').trim().toUpperCase();
  if (!panRegex.test(panClean)) {
    errors.push({ field: 'pan', step: 2, message: 'Invalid PAN format. Must be 10 characters (e.g. ABCDE1234F).' });
  }

  // Aadhaar validation (12 digits)
  const aadhaarClean = (app.aadhaar || '').replace(/\D/g, '');
  if (aadhaarClean.length !== 12) {
    errors.push({ field: 'aadhaar', step: 2, message: 'A valid 12-digit Aadhaar number is required.' });
  }

  if (!app.address || !app.address.trim()) {
    errors.push({ field: 'address', step: 2, message: 'Applicant residential street address is required.' });
  }
  if (!app.city || !app.city.trim()) {
    errors.push({ field: 'city', step: 2, message: 'City / Town is required.' });
  }
  if (!app.district || !app.district.trim()) {
    errors.push({ field: 'district', step: 2, message: 'District is required.' });
  }
  if (!app.state) {
    errors.push({ field: 'state', step: 2, message: 'State selection is required.' });
  }
  const pinClean = (app.pincode || '').replace(/\D/g, '');
  if (pinClean.length !== 6) {
    errors.push({ field: 'pincode', step: 2, message: 'A valid 6-digit postal PIN code is required.' });
  }

  // 3. Dynamic Members / Promoters Validation
  const members = payload.members;
  if (!members || members.length === 0) {
    errors.push({ field: 'members', step: 3, message: 'Please disclose at least one director, partner, or promoter.' });
  } else {
    // Specific business type minimum constraints
    if (payload.selectedType.id === 'pvt_ltd' && members.length < 2) {
      errors.push({ field: 'members', step: 3, message: 'Private Limited Company requires at least 2 directors.' });
    }
    if (payload.selectedType.id === 'llp' && members.length < 2) {
      errors.push({ field: 'members', step: 3, message: 'LLP requires at least 2 designated partners.' });
    }
    if (payload.selectedType.id === 'opc') {
      const nominee = members.find(m => m.roleType === 'nominee');
      if (!nominee || !nominee.fullName?.trim() || !nominee.pan?.trim()) {
        errors.push({ field: 'nominee', step: 3, message: 'OPC requires complete details for the statutory Nominee (INC-3).' });
      }
    }

    // Individual member fields validation
    members.forEach((m, idx) => {
      if (!m.fullName || !m.fullName.trim()) {
        errors.push({ field: `member_${idx}_name`, step: 3, message: `Full name required for Member #${idx + 1}.` });
      }
      const mPanClean = (m.pan || '').trim().toUpperCase();
      if (!panRegex.test(mPanClean)) {
        errors.push({ field: `member_${idx}_pan`, step: 3, message: `Valid PAN required for ${m.fullName || `Member #${idx + 1}`}.` });
      }
      const mMobileClean = (m.mobile || '').replace(/\D/g, '');
      if (mMobileClean.length < 10) {
        errors.push({ field: `member_${idx}_mobile`, step: 3, message: `Valid 10-digit mobile required for ${m.fullName || `Member #${idx + 1}`}.` });
      }
    });
  }

  // 4. Business Profile & Proposed Names Validation
  const biz = payload.business;
  if (!biz.proposedName1 || !biz.proposedName1.trim()) {
    errors.push({ field: 'proposedName1', step: 4, message: 'Primary Proposed Business Name – 1 is required.' });
  }
  if (!biz.mainActivity || !biz.mainActivity.trim()) {
    errors.push({ field: 'mainActivity', step: 4, message: 'Main business activity summary is required.' });
  }
  if (!biz.businessDescription || biz.businessDescription.trim().length < 20) {
    errors.push({ field: 'businessDescription', step: 4, message: 'Business description must be at least 20 characters.' });
  }
  if (biz.natureOfBusiness === 'Other' && (!biz.otherNatureText || !biz.otherNatureText.trim())) {
    errors.push({ field: 'otherNatureText', step: 4, message: 'Please specify the industry nature for "Other".' });
  }
  if (payload.selectedType.id === 'section_8' && (!biz.nonProfitObjective || !biz.nonProfitObjective.trim())) {
    errors.push({ field: 'nonProfitObjective', step: 4, message: 'Section 8 non-profit / charitable objective is required.' });
  }

  // 5. Registered Office Validation
  const off = payload.office;
  if (!off.doorNo || !off.doorNo.trim()) {
    errors.push({ field: 'doorNo', step: 5, message: 'Door / Unit / Building number is required.' });
  }
  if (!off.street || !off.street.trim()) {
    errors.push({ field: 'street', step: 5, message: 'Street / Road name is required.' });
  }
  if (!off.area || !off.area.trim()) {
    errors.push({ field: 'area', step: 5, message: 'Area / Locality is required.' });
  }
  if (!off.city || !off.city.trim()) {
    errors.push({ field: 'city', step: 5, message: 'Registered office city is required.' });
  }
  if (!off.state) {
    errors.push({ field: 'state', step: 5, message: 'Registered office state is required.' });
  }
  const officePinClean = (off.pincode || '').replace(/\D/g, '');
  if (officePinClean.length !== 6) {
    errors.push({ field: 'pincode', step: 5, message: 'Registered office 6-digit PIN code is required.' });
  }
  if (!off.ownerName || !off.ownerName.trim()) {
    errors.push({ field: 'ownerName', step: 5, message: 'Property owner / lessor name is required.' });
  }
  const ownerMobileClean = (off.ownerMobile || '').replace(/\D/g, '');
  if (ownerMobileClean.length < 10) {
    errors.push({ field: 'ownerMobile', step: 5, message: 'Property owner 10-digit mobile number is required.' });
  }

  // 6. Mandatory Documents Upload Verification
  const requiredDocDefs = getRequiredDocumentsForFlow(payload.selectedType.id, payload.office.officeType);
  const mandatoryDocDefs = requiredDocDefs.filter(d => d.required);

  mandatoryDocDefs.forEach(docDef => {
    const uploaded = payload.documents.find(d => d.docDefId === docDef.id);
    if (!uploaded || !uploaded.fileName) {
      errors.push({
        field: `doc_${docDef.id}`,
        step: 6,
        message: `Mandatory document missing: "${docDef.title}". Please upload this document.`,
      });
    }
  });

  // 7. Declaration Confirmation
  if (!payload.declarationConfirmed) {
    errors.push({
      field: 'declarationConfirmed',
      step: 8,
      message: 'All three statutory declaration checkboxes must be accepted.',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate Next Unique Application ID
 * Format: NE-BR-YYYY-XXXX (e.g. NE-BR-2026-0005)
 * Guaranteed non-mock, persistent sequence tracking
 */
export function generateNextApplicationId(): string {
  const currentYear = new Date().getFullYear();
  const existingApps = getStoredApplications();

  let maxSeq = 4; // Seeds end at 0004
  const pattern = new RegExp(`^NE-BR-${currentYear}-(\\d{4})$`, 'i');

  existingApps.forEach(a => {
    const match = a.id.match(pattern);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  });

  const nextSeq = (maxSeq + 1).toString().padStart(4, '0');
  return `NE-BR-${currentYear}-${nextSeq}`;
}

/**
 * Submit Application (Production Persistence with atomic write verification)
 */
export async function submitApplication(payload: ApplicationSubmissionPayload): Promise<SubmissionResponse> {
  try {
    // 1. Run Pre-submission Validation
    const validation = validateApplication(payload);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors[0].message}`,
        validationErrors: validation.errors,
      };
    }

    // 2. Generate Real Unique Application ID
    const newId = generateNextApplicationId();
    const submissionTimestamp = new Date().toISOString();

    // 3. Construct Complete Application Data Record
    const newApplication: ApplicationRecord = {
      id: newId,
      createdAt: submissionTimestamp,
      updatedAt: submissionTimestamp,
      businessTypeId: payload.selectedType.id,
      businessTypeName: payload.selectedType.name,
      applicant: {
        ...payload.applicant,
        pan: payload.applicant.pan.trim().toUpperCase(),
      },
      members: payload.members.map(m => ({
        ...m,
        pan: m.pan.trim().toUpperCase(),
      })),
      business: {
        ...payload.business,
        proposedName1: payload.business.proposedName1.trim().toUpperCase(),
        proposedName2: (payload.business.proposedName2 || '').trim().toUpperCase(),
        proposedName3: (payload.business.proposedName3 || '').trim().toUpperCase(),
      },
      office: { ...payload.office },
      documents: payload.documents.map(d => ({
        ...d,
        status: 'uploaded', // Initial status is uploaded
      })),
      declarationConfirmed: true,
      declarationDetails: payload.declarationDetails,
      capital: payload.capital,
      additionalServices: payload.additionalServices,
      // Status strictly set to "Application Received"
      status: 'Application Received',
      currentStageIndex: 0, // Stage 1 in timeline
      assignedStaffId: 'staff-2',
      assignedStaffName: 'Priya Sharma, ACS',
      clientMessage: 'Your application has been received. Our compliance team is initiating statutory preliminary document verification.',
      notes: [
        {
          id: `note-${Date.now()}`,
          author: 'System Intake Desk',
          text: `Application filed online for ${payload.selectedType.name} with ${payload.members.length} members/directors. Pre-submission checks passed.`,
          createdAt: submissionTimestamp,
          isInternal: true,
        },
      ],
      history: [
        {
          id: `hist-${Date.now()}`,
          status: 'Application Received',
          timestamp: submissionTimestamp,
          updatedBy: 'Client Portal',
          remarks: `Application submitted online by ${payload.applicant.fullName}. Initial status set to Application Received.`,
        },
      ],
      estimatedFeeINR: payload.selectedType.id === 'pvt_ltd' ? 14999 : payload.selectedType.id === 'llp' ? 9999 : payload.selectedType.id === 'opc' ? 11999 : 6999,
      paymentStatus: 'Unpaid',
    };

    // 4. Save to persistent storage with error verification
    const currentList = getStoredApplications();
    const updatedList = [newApplication, ...currentList.filter(a => a.id !== newId)];

    saveApplications(updatedList);

    // 5. Verify that it was actually written and is retrievable
    const verificationList = getStoredApplications();
    const verifiedRecord = verificationList.find(a => a.id === newId);

    if (!verifiedRecord) {
      throw new Error('Application write verification failed. Data could not be confirmed in persistent storage.');
    }

    // 6. Prepare Firestore metadata representation
    try {
      const firestoreData = serializeForFirestore(verifiedRecord);
      // Stores prepared Firestore document bundle in session for offline sync / Firestore push
      sessionStorage.setItem(`firestore_pending_${newId}`, JSON.stringify(firestoreData));
    } catch {
      // Non-blocking for client experience
    }

    return {
      success: true,
      application: verifiedRecord,
    };
  } catch (err: any) {
    console.error('Submission error:', err);
    return {
      success: false,
      error: err?.message || 'A storage error occurred while saving your application. Please try again.',
    };
  }
}
