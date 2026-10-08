import { AdminNote } from './index';

export type ConsultancyStatus =
  | 'New'
  | 'Under Review'
  | 'Consultant Assigned'
  | 'Documents Pending'
  | 'Quotation Sent'
  | 'Payment Pending'
  | 'In Progress'
  | 'Client Review'
  | 'Completed';

export type ConsultationPreference = 
  | 'Phone Call' 
  | 'WhatsApp' 
  | 'Video Meeting' 
  | 'Direct Office Meeting';

export type BusinessStage = 
  | 'Ideation / Concept' 
  | 'Early Stage' 
  | 'Operational' 
  | 'Growth / Expansion';

export type TurnoverRange = 
  | 'Pre-revenue' 
  | '< ₹25 Lakhs' 
  | '₹25 Lakhs - ₹1 Crore' 
  | '₹1 Crore - ₹5 Crores' 
  | '> ₹5 Crores';

export interface ConsultancySubService {
  id: string;
  name: string;
  description: string;
  popular?: boolean;
  hasApplyNow?: boolean;
  estimatedTimeline?: string;
}

export interface ConsultancyCategoryDef {
  id: string;
  name: string;
  shortDescription: string;
  iconName: string;
  subServices: ConsultancySubService[];
}

export interface ConsultancyDocument {
  id: string;
  docType: string;
  title: string;
  fileName: string;
  fileSizeFormatted: string;
  uploadDate: string;
  fileType: string;
  status: 'uploaded' | 'verified' | 'rejected';
  rejectionReason?: string;
  dataUrl?: string;
}

export interface ConsultancyStatusHistoryItem {
  id: string;
  status: ConsultancyStatus;
  timestamp: string;
  updatedBy: string;
  remarks: string;
}

export interface ConsultancyRecord {
  id: string; // Format: NE-CON-YYYY-XXXX (e.g. NE-CON-2026-0001)
  createdAt: string;
  updatedAt: string;
  status: ConsultancyStatus;

  // 1. Client Details
  client: {
    fullName: string;
    mobile: string;
    email: string;
    city: string;
    state: string;
  };

  // 2. Business Details
  business: {
    businessType: 'New Business' | 'Existing Business';
    businessName: string;
    industry: string;
    businessActivity: string;
    businessStage: BusinessStage;
    currentTurnover: TurnoverRange;
    approximateInvestment: number;
  };

  // 3. Consultancy Requirement
  requirement: {
    categoryId: string;
    categoryName: string;
    subServiceId: string;
    subServiceName: string;
    description: string;
    mainBusinessGoal: string;
    fundingRequired: boolean;
    approximateFundingAmount?: number;
    expectedTimeline: string;
  };

  // 4. Documents
  documents: ConsultancyDocument[];

  // 5. Consultation Preference
  preference: ConsultationPreference;

  // 6. Additional Information
  additionalNotes?: string;

  // 7. Declaration
  declaration: {
    confirmed: boolean;
    clientName: string;
    date: string;
    digitalSignature: string;
  };

  // Admin & Processing Management
  assignedConsultantId?: string;
  assignedConsultantName?: string;
  quotationFeeINR?: number;
  paymentStatus: 'Unpaid' | 'Advance Paid' | 'Fully Paid';
  followUpDate?: string;
  consultationMeetingDate?: string;
  nextAction?: string;
  clientMessage?: string;
  notes: AdminNote[];
  history: ConsultancyStatusHistoryItem[];
}
