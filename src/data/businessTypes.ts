import { BusinessType, RequiredDocumentDef, OfficeType } from '../types';

export const BUSINESS_TYPES: BusinessType[] = [
  // 1. Private Limited Company
  {
    id: 'pvt_ltd',
    name: 'Private Limited Company',
    category: 'company',
    shortDescription: 'Suitable for businesses with two or more members/directors and structured equity shareholding.',
    minMembers: 2,
    maxMembers: 200,
    memberRoleLabel: 'Directors & Shareholders',
    estimatedDays: '7 - 10 working days',
    icon: 'Building2',
    popular: true,
  },
  // 2. One Person Company (OPC)
  {
    id: 'opc',
    name: 'One Person Company (OPC)',
    category: 'company',
    shortDescription: 'Ideal for solo entrepreneurs looking for a corporate identity with limited liability and a nominee structure.',
    minMembers: 1,
    maxMembers: 1,
    memberRoleLabel: 'Sole Director & Nominee',
    estimatedDays: '7 - 10 working days',
    icon: 'UserCheck',
    popular: true,
  },
  // 3. Limited Liability Partnership (LLP)
  {
    id: 'llp',
    name: 'Limited Liability Partnership (LLP)',
    category: 'llp_firm',
    shortDescription: 'Suitable for businesses operated by two or more partners with limited liability and flexible agreement structure.',
    minMembers: 2,
    memberRoleLabel: 'Designated Partners & Partners',
    estimatedDays: '8 - 12 working days',
    icon: 'Users',
    popular: true,
  },
  // 4. Public Limited Company
  {
    id: 'public_ltd',
    name: 'Public Limited Company',
    category: 'company',
    shortDescription: 'For large-scale enterprises with minimum 7 shareholders, 3 directors, and public investment plans.',
    minMembers: 3,
    memberRoleLabel: 'Directors & Key Promoters',
    estimatedDays: '15 - 20 working days',
    icon: 'Landmark',
  },
  // 5. Section 8 Company
  {
    id: 'section_8',
    name: 'Section 8 Company',
    category: 'company',
    shortDescription: 'For eligible non-profit, charitable, art, commerce, and social objectives under applicable MCA guidelines.',
    minMembers: 2,
    memberRoleLabel: 'Founding Directors & Trustees',
    estimatedDays: '15 - 25 working days',
    icon: 'HeartHandshake',
  },
  // 6. Partnership Firm
  {
    id: 'partnership_firm',
    name: 'Partnership Firm',
    category: 'llp_firm',
    shortDescription: 'For traditional businesses operated by partners under a partnership agreement with Registrar of Firms registration.',
    minMembers: 2,
    maxMembers: 50,
    memberRoleLabel: 'Partners',
    estimatedDays: '5 - 8 working days',
    icon: 'Briefcase',
  },
  // 7. Proprietorship
  {
    id: 'proprietorship',
    name: 'Proprietorship',
    category: 'llp_firm',
    shortDescription: 'For businesses owned and managed by a single proprietor with trade licenses, GST & MSME setup.',
    minMembers: 1,
    maxMembers: 1,
    memberRoleLabel: 'Sole Proprietor',
    estimatedDays: '3 - 5 working days',
    icon: 'User',
    popular: true,
  },
  // 8. Other Business Registration
  {
    id: 'other_business',
    name: 'Other Business Registration',
    category: 'other',
    shortDescription: 'Specialized entity setups including Producer Companies, Joint Ventures, Branch Offices, or custom entity structures.',
    minMembers: 1,
    memberRoleLabel: 'Promoters / Authorized Signatories',
    estimatedDays: '10 - 15 working days',
    icon: 'Layers',
  },
];

// Document definitions master list
export const MASTER_DOC_REQUIREMENTS: RequiredDocumentDef[] = [
  // Applicant Docs (Universal)
  {
    id: 'applicant_pan',
    title: 'Applicant PAN Card',
    description: 'Self-attested clear copy of Permanent Account Number card.',
    category: 'applicant',
    required: true,
  },
  {
    id: 'applicant_aadhaar',
    title: 'Applicant Aadhaar Card',
    description: 'Front and back self-attested copy of Aadhaar card.',
    category: 'applicant',
    required: true,
  },
  {
    id: 'applicant_photo',
    title: 'Passport-size Photograph',
    description: 'Recent colored passport photograph with clear white background.',
    category: 'applicant',
    required: true,
  },
  {
    id: 'applicant_address_proof',
    title: 'Applicant Address Proof',
    description: 'Bank Statement (latest 2 months) with transaction entries, or Electricity Bill / Voter ID.',
    category: 'applicant',
    required: true,
  },

  // Office Docs (Conditional based on Office Type)
  {
    id: 'office_ownership_proof',
    title: 'Property Ownership Proof / Tax Receipt',
    description: 'Property tax paid receipt or Municipal deed copy proving property ownership.',
    category: 'office',
    required: true,
    applicableOfficeTypes: ['own'],
  },
  {
    id: 'office_rent_agreement',
    title: 'Rent / Lease Agreement',
    description: 'Registered or notarized rent agreement in the name of owner and promoter/entity.',
    category: 'office',
    required: true,
    applicableOfficeTypes: ['rental'],
  },
  {
    id: 'office_owner_noc',
    title: 'Property Owner NOC (No Objection Certificate)',
    description: 'Signed NOC from landlord/owner permitting commercial business registration.',
    category: 'office',
    required: true,
    applicableOfficeTypes: ['rental', 'consent'],
  },
  {
    id: 'office_utility_bill',
    title: 'Recent Registered Office Utility Bill',
    description: 'Electricity bill, water bill, or piped gas bill not older than 2 months.',
    category: 'office',
    required: true,
  },

  // Entity-Specific Docs
  {
    id: 'director_documents',
    title: 'Additional Directors KYC & DIN Documents',
    description: 'Self-attested PAN, Aadhaar and bank statement for all additional directors.',
    category: 'members',
    required: true,
    applicableBusinessTypes: ['pvt_ltd', 'public_ltd'],
  },
  {
    id: 'shareholder_documents',
    title: 'Shareholders Identity & Address Proof',
    description: 'KYC bundle for non-director equity shareholders.',
    category: 'members',
    required: false,
    applicableBusinessTypes: ['pvt_ltd', 'public_ltd'],
  },
  {
    id: 'opc_nominee_pan',
    title: 'Nominee PAN Card',
    description: 'Clear copy of Permanent Account Number of nominated individual.',
    category: 'members',
    required: true,
    applicableBusinessTypes: ['opc'],
  },
  {
    id: 'opc_nominee_aadhaar',
    title: 'Nominee Aadhaar Card',
    description: 'Front and back self-attested Aadhaar card of nominee.',
    category: 'members',
    required: true,
    applicableBusinessTypes: ['opc'],
  },
  {
    id: 'opc_nominee_photo',
    title: 'Nominee Passport-size Photograph',
    description: 'Recent white background passport photograph of nominee.',
    category: 'members',
    required: true,
    applicableBusinessTypes: ['opc'],
  },
  {
    id: 'opc_nominee_address_proof',
    title: 'Nominee Address Proof',
    description: 'Bank statement or electricity bill of nominee (within 2 months).',
    category: 'members',
    required: true,
    applicableBusinessTypes: ['opc'],
  },
  {
    id: 'opc_nominee_consent',
    title: 'Nominee Signed Consent (Form INC-3)',
    description: 'Statutory Form INC-3 consent duly signed by nominated person.',
    category: 'members',
    required: true,
    applicableBusinessTypes: ['opc'],
  },
  {
    id: 'llp_partner_kyc',
    title: 'Designated Partners & Partners KYC',
    description: 'PAN, Aadhaar, photo and address proof of all designated partners.',
    category: 'members',
    required: true,
    applicableBusinessTypes: ['llp'],
  },
  {
    id: 'partnership_deed_draft',
    title: 'Partnership Terms / Deed Draft (if existing)',
    description: 'Signed partnership deed or key profit-sharing clauses agreement.',
    category: 'members',
    required: false,
    applicableBusinessTypes: ['partnership_firm'],
  },
  {
    id: 'section_8_objectives',
    title: 'Charitable Objectives & Non-profit Charter',
    description: 'Detailed description of social, educational or charitable activities planned.',
    category: 'entity',
    required: true,
    applicableBusinessTypes: ['section_8'],
  },
  {
    id: 'trademark_or_noc',
    title: 'NOC / Authorization for Proposed Name (Optional)',
    description: 'If proposed name includes existing trademark or registered group name.',
    category: 'entity',
    required: false,
  },
];

export function getRequiredDocumentsForFlow(businessTypeId: string, officeType: OfficeType): RequiredDocumentDef[] {
  return MASTER_DOC_REQUIREMENTS.filter(doc => {
    // Check office type filter
    if (doc.applicableOfficeTypes && !doc.applicableOfficeTypes.includes(officeType)) {
      return false;
    }
    // Check business type filter
    if (doc.applicableBusinessTypes && !doc.applicableBusinessTypes.includes(businessTypeId)) {
      return false;
    }
    return true;
  });
}

export const TIMELINE_STAGES = [
  {
    id: 'received',
    title: 'Application Received',
    description: 'Application submitted and preliminary intake queued.',
  },
  {
    id: 'verification',
    title: 'Document Verification',
    description: 'Nagu Enterprises compliance team reviews KYC and office proofs.',
  },
  {
    id: 'prep',
    title: 'Name / Registration Preparation',
    description: 'Name availability checking, MOA/AOA drafting & RUN/SPICe+ prep.',
  },
  {
    id: 'filing',
    title: 'Application Filing',
    description: 'Submission to Registrar of Companies (MCA) or concerned authority.',
  },
  {
    id: 'processing',
    title: 'Authority Processing',
    description: 'Statutory scrutiny, stamp duty settlement and officer review.',
  },
  {
    id: 'approval',
    title: 'Approval / Certificate',
    description: 'Certificate of Incorporation (COI) / PAN / TAN / Registration issued.',
  },
  {
    id: 'completed',
    title: 'Completed',
    description: 'Final documents, compliance kit and bank opening support dispatched.',
  },
];
