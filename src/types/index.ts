export type BusinessCategory = 'company' | 'llp_firm' | 'other';

export interface BusinessType {
  id: string;
  name: string;
  category: BusinessCategory;
  shortDescription: string;
  minMembers: number;
  maxMembers?: number;
  memberRoleLabel: string;
  estimatedDays: string;
  icon: string;
  popular?: boolean;
}

export type Gender = 'Male' | 'Female' | 'Other';

export interface ApplicantDetails {
  fullName: string;
  parentName: string;
  dob: string;
  gender: Gender;
  mobile: string;
  email: string;
  alternateNumber?: string;
  pan: string;
  aadhaar: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
}

export interface DirectorOrMember {
  id: string;
  fullName: string;
  roleType: 'director' | 'shareholder' | 'both' | 'partner' | 'designated_partner' | 'proprietor' | 'nominee' | 'member';
  din?: string; // Director Identification Number / DPIN
  pan: string;
  aadhaar: string;
  dob?: string;
  mobile: string;
  email: string;
  address: string;
  designation?: string;
  shareholdingPercent?: number;
  numberOfShares?: number;
  capitalContribution?: number;
  profitSharingPercent?: number;
  occupation?: string;
  relationshipWithPromoter?: string; // For OPC Nominee
  nomineeConsentGiven?: boolean;
}

export type OfficeType = 'own' | 'rental' | 'consent';

export interface RegisteredOffice {
  officeType: OfficeType;
  doorNo: string;
  street: string;
  area: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  ownerName: string;
  ownerMobile: string;
}

export type BusinessNature = 
  | 'Manufacturing'
  | 'Trading'
  | 'Services'
  | 'Consulting'
  | 'Technology'
  | 'Transport'
  | 'Construction'
  | 'Solar / Renewable Energy'
  | 'Education'
  | 'Food'
  | 'Other';

export interface BusinessDetails {
  proposedName1: string;
  proposedName2: string;
  proposedName3: string;
  mainActivity: string;
  productServicesType?: string;
  targetMarket?: string;
  businessDescription: string;
  existingWebsite?: string;
  natureOfBusiness: BusinessNature;
  otherNatureText?: string;
  nicCode?: string;
  // Section 8 specific
  nonProfitObjective?: string;
  charitablePurpose?: string;
  mainPrograms?: string;
}

export interface CapitalDetails {
  authorisedCapital: number;
  paidUpCapital: number;
  numberOfShares: number;
  faceValuePerShare: number;
}

export interface AdditionalServices {
  needDSC: boolean;
  needPanTan: boolean;
  needBankAccount: boolean;
  needGST: boolean;
  needMSME: boolean;
  needTrademark: boolean;
  otherServices?: string;
}

export interface DeclarationDetails {
  confirmTrue: boolean;
  authorizeNagu: boolean;
  clientName: string;
  date: string;
  signatureName: string;
}

export type DocumentStatus = 'pending' | 'uploaded' | 'under_review' | 'verified' | 'rejected' | 'reupload_required';

export interface RequiredDocumentDef {
  id: string;
  title: string;
  description: string;
  category: 'applicant' | 'office' | 'entity' | 'members';
  required: boolean;
  applicableBusinessTypes?: string[];
  applicableOfficeTypes?: OfficeType[];
}

export interface UploadedDocument {
  id: string;
  docDefId: string;
  title: string;
  fileName: string;
  fileSizeFormatted: string;
  uploadDate: string;
  dataUrl?: string; // Simulated or Base64 preview
  fileType: string;
  status: DocumentStatus;
  rejectionReason?: string;
  required: boolean;
}

export type ApplicationStatus =
  | 'Application Received'
  | 'New Application'
  | 'Documents Pending'
  | 'Documents Under Verification'
  | 'Documents Verified'
  | 'Name Preparation'
  | 'Name Reservation'
  | 'Application Preparation'
  | 'MCA / Authority Filing'
  | 'Under Processing'
  | 'Additional Information Required'
  | 'Approved'
  | 'Completed'
  | 'On Hold'
  | 'Rejected'
  | 'Cancelled';

export interface StatusHistoryItem {
  id: string;
  status: ApplicationStatus;
  timestamp: string;
  updatedBy: string;
  remarks: string;
}

export interface AdminNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  isInternal: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  activeCount: number;
}

export interface ApplicationRecord {
  id: string; // e.g., NE-BR-2026-0001
  createdAt: string;
  updatedAt: string;
  businessTypeId: string;
  businessTypeName: string;
  applicant: ApplicantDetails;
  members: DirectorOrMember[];
  business: BusinessDetails;
  office: RegisteredOffice;
  documents: UploadedDocument[];
  declarationConfirmed: boolean;
  declarationDetails?: DeclarationDetails;
  capital?: CapitalDetails;
  additionalServices?: AdditionalServices;
  status: ApplicationStatus;
  currentStageIndex: number;
  assignedStaffId?: string;
  assignedStaffName?: string;
  clientMessage?: string;
  notes: AdminNote[];
  history: StatusHistoryItem[];
  // Future payment summary
  estimatedFeeINR?: number;
  paymentStatus?: 'Unpaid' | 'Advance Paid' | 'Fully Paid';
}

export * from './consultancy';
