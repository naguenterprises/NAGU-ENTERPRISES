import React, { useState, useEffect, useId } from 'react';
import { 
  BusinessType, 
  ApplicantDetails, 
  DirectorOrMember, 
  BusinessDetails, 
  RegisteredOffice, 
  UploadedDocument, 
  ApplicationRecord,
  OfficeType,
  CapitalDetails,
  AdditionalServices,
  DeclarationDetails
} from '../types';
import { BUSINESS_TYPES, getRequiredDocumentsForFlow } from '../data/businessTypes';
import { submitApplication, ValidationErrorItem } from '../services/applicationService';
import { createOrLinkCustomerAccount } from '../services/authService';
import { SubmissionSuccess } from './SubmissionSuccess';
import { INDIAN_STATES } from './wizard/ApplicantDetailsStep';
import logoImage from '../assets/images/nagu_emblem_clean_1791478386994.jpg';
import { 
  Building2, 
  UserCheck, 
  Users, 
  Briefcase, 
  User, 
  Landmark, 
  HeartHandshake, 
  Layers,
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  UploadCloud, 
  FileText, 
  Trash2, 
  Plus, 
  HelpCircle, 
  Check, 
  Sparkles, 
  Save, 
  RotateCcw, 
  ChevronDown, 
  Clock, 
  FileCheck2, 
  ArrowRight,
  ExternalLink,
  Shield,
  CreditCard,
  Building,
  Info
} from 'lucide-react';

interface SinglePageApplicationFormProps {
  initialBusinessTypeId?: string;
  onCancel: () => void;
  onViewStatus: (appId: string) => void;
  onContactSupport: () => void;
}

export const SinglePageApplicationForm: React.FC<SinglePageApplicationFormProps> = ({
  initialBusinessTypeId,
  onCancel,
  onViewStatus,
  onContactSupport,
}) => {
  const formUid = useId();

  // 1. Business Type Selection State
  const [selectedType, setSelectedType] = useState<BusinessType>(() => {
    if (initialBusinessTypeId) {
      const match = BUSINESS_TYPES.find(b => b.id === initialBusinessTypeId);
      if (match) return match;
    }
    return BUSINESS_TYPES[1]; // Default to OPC or Pvt Ltd
  });

  // 2. Applicant Details State
  const [applicant, setApplicant] = useState<ApplicantDetails>({
    fullName: '',
    parentName: '',
    dob: '',
    gender: 'Male',
    mobile: '',
    email: '',
    alternateNumber: '',
    pan: '',
    aadhaar: '',
    address: '',
    city: '',
    district: '',
    state: 'Karnataka',
    pincode: '',
  });

  // 3. Proposed Names & Business Objects
  const [business, setBusiness] = useState<BusinessDetails>({
    proposedName1: '',
    proposedName2: '',
    proposedName3: '',
    mainActivity: '',
    businessDescription: '',
    natureOfBusiness: 'Technology',
    otherNatureText: '',
    nicCode: '',
    nonProfitObjective: '',
  });

  // 4. Capital Details
  const [capital, setCapital] = useState<CapitalDetails>({
    authorisedCapital: 100000,
    paidUpCapital: 100000,
    numberOfShares: 10000,
    faceValuePerShare: 10,
  });

  // 5. Directors / Partners / Nominee State
  const [members, setMembers] = useState<DirectorOrMember[]>([]);

  // 6. Registered Office Details
  const [office, setOffice] = useState<RegisteredOffice>({
    officeType: 'rental',
    doorNo: '',
    street: '',
    area: '',
    city: '',
    district: '',
    state: 'Karnataka',
    pincode: '',
    ownerName: '',
    ownerMobile: '',
  });

  // 7. Documents State
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);

  // 8. Additional Services
  const [additionalServices, setAdditionalServices] = useState<AdditionalServices>({
    needDSC: true,
    needPanTan: true,
    needBankAccount: true,
    needGST: false,
    needMSME: true,
    needTrademark: false,
    otherServices: '',
  });

  // 9. Declaration & Submission State
  const [declarationConfirmed1, setDeclarationConfirmed1] = useState(false);
  const [declarationConfirmed2, setDeclarationConfirmed2] = useState(false);
  const [declarationConfirmed3, setDeclarationConfirmed3] = useState(false);
  const [authorizedSignatory, setAuthorizedSignatory] = useState('');
  const [declarationCity, setDeclarationCity] = useState('');
  const [declarationDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Submission Status & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submittedApp, setSubmittedApp] = useState<ApplicationRecord | null>(null);
  const [draftSavedToast, setDraftSavedToast] = useState(false);

  // Initialize members default structure when business type changes
  useEffect(() => {
    // If switching entity type, adjust members template if empty
    setMembers(prev => {
      if (selectedType.id === 'opc') {
        const hasNominee = prev.some(m => m.roleType === 'nominee');
        if (hasNominee) return prev;
        return [
          {
            id: `member-${Date.now()}-1`,
            fullName: applicant.fullName || '',
            roleType: 'director',
            designation: 'Sole Director & Promoter',
            pan: applicant.pan || '',
            aadhaar: applicant.aadhaar || '',
            mobile: applicant.mobile || '',
            email: applicant.email || '',
            address: applicant.address || '',
            shareholdingPercent: 100,
          },
          {
            id: `member-${Date.now()}-2`,
            fullName: '',
            roleType: 'nominee',
            designation: 'Statutory Nominee (INC-3)',
            pan: '',
            aadhaar: '',
            mobile: '',
            email: '',
            address: '',
            relationshipWithPromoter: 'Spouse',
            nomineeConsentGiven: true,
          }
        ];
      } else if (selectedType.id === 'pvt_ltd' || selectedType.id === 'public_ltd') {
        if (prev.length >= 2 && prev.every(m => m.roleType !== 'nominee')) return prev;
        return [
          {
            id: `member-${Date.now()}-1`,
            fullName: applicant.fullName || '',
            roleType: 'director',
            designation: 'Managing Director',
            pan: applicant.pan || '',
            aadhaar: applicant.aadhaar || '',
            mobile: applicant.mobile || '',
            email: applicant.email || '',
            address: applicant.address || '',
            shareholdingPercent: 50,
          },
          {
            id: `member-${Date.now()}-2`,
            fullName: '',
            roleType: 'director',
            designation: 'Director',
            pan: '',
            aadhaar: '',
            mobile: '',
            email: '',
            address: '',
            shareholdingPercent: 50,
          }
        ];
      } else if (selectedType.id === 'llp') {
        if (prev.length >= 2) return prev;
        return [
          {
            id: `member-${Date.now()}-1`,
            fullName: applicant.fullName || '',
            roleType: 'designated_partner',
            designation: 'Designated Partner 1',
            pan: applicant.pan || '',
            aadhaar: applicant.aadhaar || '',
            mobile: applicant.mobile || '',
            email: applicant.email || '',
            address: applicant.address || '',
            capitalContribution: 50000,
            profitSharingPercent: 50,
          },
          {
            id: `member-${Date.now()}-2`,
            fullName: '',
            roleType: 'designated_partner',
            designation: 'Designated Partner 2',
            pan: '',
            aadhaar: '',
            mobile: '',
            email: '',
            address: '',
            capitalContribution: 50000,
            profitSharingPercent: 50,
          }
        ];
      } else if (selectedType.id === 'partnership_firm') {
        if (prev.length >= 2) return prev;
        return [
          {
            id: `member-${Date.now()}-1`,
            fullName: applicant.fullName || '',
            roleType: 'partner',
            designation: 'Partner 1',
            pan: applicant.pan || '',
            aadhaar: applicant.aadhaar || '',
            mobile: applicant.mobile || '',
            email: applicant.email || '',
            address: applicant.address || '',
            capitalContribution: 50000,
            profitSharingPercent: 50,
          },
          {
            id: `member-${Date.now()}-2`,
            fullName: '',
            roleType: 'partner',
            designation: 'Partner 2',
            pan: '',
            aadhaar: '',
            mobile: '',
            email: '',
            address: '',
            capitalContribution: 50000,
            profitSharingPercent: 50,
          }
        ];
      } else if (selectedType.id === 'proprietorship') {
        return [
          {
            id: `member-${Date.now()}-1`,
            fullName: applicant.fullName || '',
            roleType: 'proprietor',
            designation: 'Sole Proprietor',
            pan: applicant.pan || '',
            aadhaar: applicant.aadhaar || '',
            mobile: applicant.mobile || '',
            email: applicant.email || '',
            address: applicant.address || '',
            shareholdingPercent: 100,
          }
        ];
      }
      return prev;
    });
  }, [selectedType.id, applicant.fullName, applicant.pan, applicant.mobile, applicant.email, applicant.aadhaar, applicant.address]);

  // Keep authorized signatory synchronized with applicant name if empty
  useEffect(() => {
    if (!authorizedSignatory && applicant.fullName) {
      setAuthorizedSignatory(applicant.fullName);
    }
  }, [applicant.fullName, authorizedSignatory]);

  // Required documents for currently selected business & office type
  const requiredDocDefs = getRequiredDocumentsForFlow(selectedType.id, office.officeType);
  const mandatoryDocDefs = requiredDocDefs.filter(d => d.required);
  const uploadedMandatoryCount = mandatoryDocDefs.filter(def => 
    documents.some(d => d.docDefId === def.id && d.fileName)
  ).length;

  // Handle Document Upload simulation/real file
  const handleFileUpload = (docDefId: string, file: File) => {
    const docDef = requiredDocDefs.find(d => d.id === docDefId);
    if (!docDef) return;

    const formattedSize = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    const newDoc: UploadedDocument = {
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      docDefId: docDef.id,
      title: docDef.title,
      fileName: file.name,
      fileSizeFormatted: formattedSize,
      uploadDate: new Date().toISOString(),
      fileType: file.type || 'application/pdf',
      status: 'uploaded',
      required: docDef.required,
    };

    setDocuments(prev => [...prev.filter(d => d.docDefId !== docDefId), newDoc]);
    // clear field error for this doc
    setFieldErrors(prev => {
      const copy = { ...prev };
      delete copy[`doc_${docDefId}`];
      return copy;
    });
  };

  const handleRemoveDoc = (docDefId: string) => {
    setDocuments(prev => prev.filter(d => d.docDefId !== docDefId));
  };

  // Helper to attach realistic sample files for swift client testing
  const handleAttachAllSampleDocs = () => {
    const sampleDocs: UploadedDocument[] = requiredDocDefs.map((def, idx) => ({
      id: `sample-doc-${Date.now()}-${idx}`,
      docDefId: def.id,
      title: def.title,
      fileName: `${def.id.toUpperCase()}_Verified_${applicant.fullName ? applicant.fullName.replace(/\s+/g, '_') : 'Applicant'}.pdf`,
      fileSizeFormatted: `${(1.2 + idx * 0.4).toFixed(1)} MB`,
      uploadDate: new Date().toISOString(),
      fileType: 'application/pdf',
      status: 'uploaded',
      required: def.required,
    }));
    setDocuments(sampleDocs);
    setFieldErrors(prev => {
      const copy = { ...prev };
      requiredDocDefs.forEach(d => delete copy[`doc_${d.id}`]);
      return copy;
    });
  };

  // Pre-fill complete demo data for 1-click end-to-end evaluation
  const handlePrefillDemoData = () => {
    const isOPC = selectedType.id === 'opc';
    const isPvt = selectedType.id === 'pvt_ltd';

    setApplicant({
      fullName: 'Vikram Aditya Sharma',
      parentName: 'Rameshwar Sharma',
      dob: '1989-08-14',
      gender: 'Male',
      mobile: '9845012345',
      email: 'vikram.aditya@example.com',
      alternateNumber: '9845098765',
      pan: 'ABCDE1234F',
      aadhaar: '542189763214',
      address: 'Flat 402, Prestige Silicon Residency, 14th Main Road, HSR Layout Sector 2',
      city: 'Bangalore',
      district: 'Bangalore Urban',
      state: 'Karnataka',
      pincode: '560102',
    });

    setBusiness({
      proposedName1: isOPC ? 'ZENITH NEOTECH (OPC) PRIVATE LIMITED' : isPvt ? 'ZENITH NEOTECH SOLUTIONS PRIVATE LIMITED' : `${selectedType.name.toUpperCase()} ENTERPRISES`,
      proposedName2: 'ZENITH LOGIC SYSTEMS PRIVATE LIMITED',
      proposedName3: 'ZENITH AI INFRASTRUCTURE PRIVATE LIMITED',
      mainActivity: 'Development of SaaS enterprise platforms, cloud integrations, and technological consulting.',
      businessDescription: 'Providing full-stack artificial intelligence and cloud-native software development services to global B2B clients, incorporating secure automation systems.',
      natureOfBusiness: 'Technology',
      otherNatureText: '',
      nicCode: '62011',
      nonProfitObjective: selectedType.id === 'section_8' ? 'Advancement of digital education and technological literacy among underserved youth.' : '',
    });

    setCapital({
      authorisedCapital: 100000,
      paidUpCapital: 100000,
      numberOfShares: 10000,
      faceValuePerShare: 10,
    });

    if (isOPC) {
      setMembers([
        {
          id: `member-demo-1`,
          fullName: 'Vikram Aditya Sharma',
          roleType: 'director',
          designation: 'Sole Director & Promoter',
          pan: 'ABCDE1234F',
          aadhaar: '542189763214',
          mobile: '9845012345',
          email: 'vikram.aditya@example.com',
          address: 'Flat 402, Prestige Silicon Residency, HSR Layout Sector 2, Bangalore',
          shareholdingPercent: 100,
        },
        {
          id: `member-demo-2`,
          fullName: 'Ananya Vikram Sharma',
          roleType: 'nominee',
          designation: 'Statutory Nominee (INC-3)',
          pan: 'FGHIJ5678K',
          aadhaar: '987654321098',
          mobile: '9876543210',
          email: 'ananya.sharma@example.com',
          address: 'Flat 402, Prestige Silicon Residency, HSR Layout Sector 2, Bangalore',
          relationshipWithPromoter: 'Spouse',
          nomineeConsentGiven: true,
        }
      ]);
    } else {
      setMembers([
        {
          id: `member-demo-1`,
          fullName: 'Vikram Aditya Sharma',
          roleType: 'director',
          designation: 'Managing Director',
          pan: 'ABCDE1234F',
          aadhaar: '542189763214',
          mobile: '9845012345',
          email: 'vikram.aditya@example.com',
          address: 'Flat 402, Prestige Silicon Residency, HSR Layout Sector 2, Bangalore',
          shareholdingPercent: 50,
          capitalContribution: 50000,
          profitSharingPercent: 50,
        },
        {
          id: `member-demo-2`,
          fullName: 'Rohan Mehta',
          roleType: 'director',
          designation: 'Director',
          pan: 'PQRSK9876Z',
          aadhaar: '876543210987',
          mobile: '9845055443',
          email: 'rohan.mehta@example.com',
          address: 'No. 88, 3rd Cross, Indiranagar 1st Stage, Bangalore',
          shareholdingPercent: 50,
          capitalContribution: 50000,
          profitSharingPercent: 50,
        }
      ]);
    }

    setOffice({
      officeType: 'rental',
      doorNo: 'Suite 204, Tower B',
      street: 'Outer Ring Road, Bellandur',
      area: 'EcoWorld Tech Park',
      city: 'Bangalore',
      district: 'Bangalore Urban',
      state: 'Karnataka',
      pincode: '560103',
      ownerName: 'Suresh Babu Realty Ventures LLP',
      ownerMobile: '9844011223',
    });

    handleAttachAllSampleDocs();

    setDeclarationConfirmed1(true);
    setDeclarationConfirmed2(true);
    setDeclarationConfirmed3(true);
    setAuthorizedSignatory('Vikram Aditya Sharma');
    setDeclarationCity('Bangalore');
    setFieldErrors({});
    setSubmitError(null);
  };

  // Save Draft to LocalStorage
  const handleSaveDraft = () => {
    try {
      const draftData = {
        selectedTypeId: selectedType.id,
        applicant,
        business,
        capital,
        members,
        office,
        documents,
        additionalServices,
        authorizedSignatory,
        declarationCity,
      };
      localStorage.setItem('nagu_registration_draft_v1', JSON.stringify(draftData));
      setDraftSavedToast(true);
      setTimeout(() => setDraftSavedToast(false), 3000);
    } catch {
      alert('Could not save draft to local browser storage.');
    }
  };

  // Reset Form
  const handleResetForm = () => {
    if (confirm('Are you sure you want to reset all form entries?')) {
      setApplicant({
        fullName: '',
        parentName: '',
        dob: '',
        gender: 'Male',
        mobile: '',
        email: '',
        alternateNumber: '',
        pan: '',
        aadhaar: '',
        address: '',
        city: '',
        district: '',
        state: 'Karnataka',
        pincode: '',
      });
      setBusiness({
        proposedName1: '',
        proposedName2: '',
        proposedName3: '',
        mainActivity: '',
        businessDescription: '',
        natureOfBusiness: 'Technology',
        otherNatureText: '',
        nicCode: '',
        nonProfitObjective: '',
      });
      setOffice({
        officeType: 'rental',
        doorNo: '',
        street: '',
        area: '',
        city: '',
        district: '',
        state: 'Karnataka',
        pincode: '',
        ownerName: '',
        ownerMobile: '',
      });
      setDocuments([]);
      setDeclarationConfirmed1(false);
      setDeclarationConfirmed2(false);
      setDeclarationConfirmed3(false);
      setAuthorizedSignatory('');
      setDeclarationCity('');
      setFieldErrors({});
      setSubmitError(null);
    }
  };

  // Add another director / partner
  const handleAddMember = () => {
    const isLLP = selectedType.id === 'llp';
    const isPartnership = selectedType.id === 'partnership_firm';
    const newIdx = members.length + 1;

    const newMember: DirectorOrMember = {
      id: `member-${Date.now()}-${newIdx}`,
      fullName: '',
      roleType: isLLP ? 'designated_partner' : isPartnership ? 'partner' : 'director',
      designation: isLLP ? `Designated Partner ${newIdx}` : isPartnership ? `Partner ${newIdx}` : `Director ${newIdx}`,
      pan: '',
      aadhaar: '',
      mobile: '',
      email: '',
      address: '',
      shareholdingPercent: 0,
      capitalContribution: 0,
      profitSharingPercent: 0,
    };
    setMembers(prev => [...prev, newMember]);
  };

  const handleRemoveMember = (memberId: string) => {
    if (members.length <= 1) {
      alert('At least one member/director record must be maintained.');
      return;
    }
    setMembers(prev => prev.filter(m => m.id !== memberId));
  };

  const handleMemberChange = (id: string, updates: Partial<DirectorOrMember>) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  // Primary Submission Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setFieldErrors({});

    // Client-side quick checks
    const localErrors: Record<string, string> = {};

    if (!applicant.fullName.trim()) localErrors.fullName = 'Full Name is required';
    if (!applicant.parentName.trim()) localErrors.parentName = "Father's / Mother's Name is required";
    if (!applicant.dob) localErrors.dob = 'Date of birth is required';
    if (!applicant.mobile || applicant.mobile.replace(/\D/g, '').length < 10) {
      localErrors.mobile = 'Enter a valid 10-digit mobile number';
    }
    if (!applicant.email || !/^\S+@\S+\.\S+$/.test(applicant.email)) {
      localErrors.email = 'Valid email is required (e.g. name@domain.com)';
    }
    if (!applicant.pan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(applicant.pan.trim())) {
      localErrors.pan = 'Enter valid 10-character PAN (e.g. ABCDE1234F)';
    }
    if (!applicant.aadhaar || applicant.aadhaar.replace(/\D/g, '').length !== 12) {
      localErrors.aadhaar = 'Enter valid 12-digit Aadhaar number';
    }
    if (!applicant.address.trim()) localErrors.address = 'Residential street address is required';
    if (!applicant.city.trim()) localErrors.city = 'City is required';
    if (!applicant.district.trim()) localErrors.district = 'District is required';
    if (!applicant.pincode || applicant.pincode.replace(/\D/g, '').length !== 6) {
      localErrors.pincode = 'Valid 6-digit postal PIN code is required';
    }

    if (!business.proposedName1.trim()) localErrors.proposedName1 = 'Primary proposed business name is required';
    if (!business.mainActivity.trim()) localErrors.mainActivity = 'Main business activity summary is required';
    if (!business.businessDescription || business.businessDescription.trim().length < 20) {
      localErrors.businessDescription = 'Detailed business description must be at least 20 characters';
    }
    if (selectedType.id === 'section_8' && !business.nonProfitObjective?.trim()) {
      localErrors.nonProfitObjective = 'Section 8 charitable / non-profit objective is required';
    }

    // Members verification
    if (selectedType.id === 'opc') {
      const nominee = members.find(m => m.roleType === 'nominee');
      if (!nominee || !nominee.fullName.trim()) localErrors.nomineeName = 'Nominee full name is required for OPC (INC-3)';
      if (!nominee || !nominee.pan.trim() || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(nominee.pan.trim())) {
        localErrors.nomineePan = 'Valid PAN is required for Nominee';
      }
      if (!nominee || !nominee.mobile.trim() || nominee.mobile.replace(/\D/g, '').length < 10) {
        localErrors.nomineeMobile = 'Valid 10-digit mobile is required for Nominee';
      }
    } else if (selectedType.id === 'pvt_ltd' && members.length < 2) {
      localErrors.members = 'Private Limited requires at least 2 directors';
    } else if (selectedType.id === 'llp' && members.length < 2) {
      localErrors.members = 'LLP requires at least 2 designated partners';
    }

    // Office verification
    if (!office.doorNo.trim()) localErrors.doorNo = 'Door / premise number is required';
    if (!office.street.trim()) localErrors.street = 'Street / road is required';
    if (!office.area.trim()) localErrors.area = 'Area / locality is required';
    if (!office.city.trim()) localErrors.officeCity = 'Registered office city is required';
    if (!office.pincode || office.pincode.replace(/\D/g, '').length !== 6) {
      localErrors.officePincode = 'Valid 6-digit office PIN code is required';
    }
    if (!office.ownerName.trim()) localErrors.ownerName = 'Property owner name is required';
    if (!office.ownerMobile || office.ownerMobile.replace(/\D/g, '').length < 10) {
      localErrors.ownerMobile = 'Valid 10-digit owner mobile is required';
    }

    // Mandatory documents validation based on business entity
    const missingMandatoryDocs = mandatoryDocDefs.filter(docDef => {
      const uploaded = documents.find(d => d.docDefId === docDef.id);
      return !uploaded || !uploaded.fileName;
    });

    if (missingMandatoryDocs.length > 0) {
      missingMandatoryDocs.forEach(docDef => {
        localErrors[`doc_${docDef.id}`] = `Mandatory document required for ${selectedType.name}: ${docDef.title}`;
      });
    }

    // Declaration checkboxes
    if (!declarationConfirmed1 || !declarationConfirmed2 || !declarationConfirmed3) {
      localErrors.declaration = 'All 3 statutory declaration checkboxes must be accepted';
    }
    if (!authorizedSignatory.trim()) {
      localErrors.authorizedSignatory = 'Name of authorized signatory is required';
    }

    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      if (missingMandatoryDocs.length > 0) {
        setSubmitError(`Document Validation Notice: Please upload all ${missingMandatoryDocs.length} mandatory document(s) required for ${selectedType.name} in Section 7 before submitting.`);
        const docSection = document.getElementById('section-documents');
        if (docSection) {
          docSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      } else {
        setSubmitError(`Please review and resolve the ${Object.keys(localErrors).length} required field(s) highlighted in red.`);
      }
      // Scroll to the first error
      window.scrollTo({ top: 380, behavior: 'smooth' });
      return;
    }

    // Payload submission
    setIsSubmitting(true);
    try {
      const res = await submitApplication({
        selectedType,
        applicant,
        members,
        business,
        office,
        documents,
        capital,
        additionalServices,
        declarationConfirmed: true,
        declarationDetails: {
          confirmTrue: declarationConfirmed1,
          authorizeNagu: declarationConfirmed3,
          clientName: applicant.fullName,
          date: declarationDate,
          signatureName: authorizedSignatory,
        }
      });

      if (res.success && res.application) {
        // Automatically provision or link client account for Customer Portal
        try {
          await createOrLinkCustomerAccount({
            fullName: applicant.fullName,
            email: applicant.email,
            mobile: applicant.mobile,
          });
        } catch (authErr) {
          console.warn('Customer account linking notice:', authErr);
        }

        // Clear draft
        localStorage.removeItem('nagu_registration_draft_v1');
        setSubmittedApp(res.application);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setSubmitError(res.error || 'Submission could not be completed. Please review required fields.');
        if (res.validationErrors) {
          const map: Record<string, string> = {};
          res.validationErrors.forEach((item: ValidationErrorItem) => {
            map[item.field] = item.message;
          });
          setFieldErrors(map);
        }
      }
    } catch (err: any) {
      setSubmitError(err?.message || 'A network or persistence error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If submitted successfully, render standard Confirmation Screen
  if (submittedApp) {
    return (
      <SubmissionSuccess
        application={submittedApp}
        onViewStatus={onViewStatus}
        onContactSupport={onContactSupport}
      />
    );
  }

  // Estimated fee calculation
  const getFeeEstimate = () => {
    switch (selectedType.id) {
      case 'pvt_ltd': return '₹14,999';
      case 'opc': return '₹11,999';
      case 'llp': return '₹9,999';
      case 'public_ltd': return '₹24,999';
      case 'section_8': return '₹19,999';
      case 'partnership_firm': return '₹7,999';
      case 'proprietorship': return '₹5,999';
      default: return '₹9,999';
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* ===================================================================
          1. NAGU ENTERPRISES OFFICIAL FORM HEADER
          =================================================================== */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-md overflow-hidden">
        {/* Top bar accent */}
        <div className="h-2.5 bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600" />
        
        <div className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
            
            {/* Left Brand Area */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden shadow-md ring-1 ring-blue-900/10 shrink-0 bg-white flex items-center justify-center">
                <img
                  src={logoImage}
                  alt="Nagu Enterprises Official Logo"
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-display">
                    NAGU ENTERPRISES
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" /> ISO Certified Desk
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-700">
                  Business Registration & Compliance Services
                </p>
                <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-600 pt-1 font-medium">
                  <span>Company Registration</span>
                  <span className="text-slate-300">|</span>
                  <span>LLP Registration</span>
                  <span className="text-slate-300">|</span>
                  <span>GST</span>
                  <span className="text-slate-300">|</span>
                  <span>DSC</span>
                  <span className="text-slate-300">|</span>
                  <span>MSME</span>
                  <span className="text-slate-300">|</span>
                  <span>Trademark</span>
                  <span className="text-slate-300">|</span>
                  <span>Advisory</span>
                </div>
              </div>
            </div>

            {/* Right Contact Area */}
            <div className="flex flex-col sm:items-end justify-center text-xs text-slate-600 space-y-1.5 shrink-0 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 font-medium text-slate-800">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>+91 98450 12345 / +91 80 4123 5678</span>
              </div>
              <div className="flex items-center gap-2 font-medium text-slate-800">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>naguenterprises84@gmail.com</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Bangalore, Karnataka, India</span>
              </div>
              <div className="text-[10px] font-mono text-slate-600 pt-1">
                ONLINE APPLICATION INTAKE FORM
              </div>
            </div>

          </div>

          {/* Quick Helper Ribbon with Demo prefill button */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Official Client Onboarding Portal • Secure SSL Encrypted Transmission</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrefillDemoData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors shadow-xs"
                title="Fill all required fields with realistic sample data to test instantly"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Pre-fill Demo Data (1-Click Test)
              </button>
              <button
                type="button"
                onClick={handleResetForm}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Reset all inputs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Draft Saved Banner Notification */}
      {draftSavedToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-medium flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Application draft saved to browser storage successfully. You can return anytime.</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-mono">Auto-saved locally</span>
        </div>
      )}

      {/* Top Error Alert if any */}
      {submitError && (
        <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl text-red-900 text-sm flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">{submitError}</p>
            <p className="text-xs text-red-700">
              Please scroll through the sections below. Required fields or missing documents are outlined in red.
            </p>
          </div>
        </div>
      )}

      {/* ===================================================================
          2. TOP BUSINESS TYPE SELECTION
          =================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 text-xs font-extrabold flex items-center justify-center">
                ★
              </span>
              SELECT REGISTRATION TYPE
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose your entity structure. The form fields, statutory promoters, and document checklist adapt dynamically.
            </p>
          </div>
          <div className="text-xs text-slate-600 font-medium bg-slate-100 px-3 py-1.5 rounded-lg self-start sm:self-auto">
            Configuring: <strong className="text-blue-700">{selectedType.name}</strong>
          </div>
        </div>

        {/* 8 Business Types Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {BUSINESS_TYPES.map((bt) => {
            const isSelected = selectedType.id === bt.id;
            return (
              <div
                key={bt.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSelectedType(bt);
                  setSubmitError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedType(bt);
                    setSubmitError(null);
                  }
                }}
                className={`cursor-pointer text-left p-3.5 rounded-xl border-2 transition-all relative flex flex-col justify-between ${
                  isSelected 
                    ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20' 
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/60'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
                <div className="space-y-1.5 pr-6">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {bt.id === 'pvt_ltd' && <Building2 className="w-4 h-4" />}
                      {bt.id === 'opc' && <UserCheck className="w-4 h-4" />}
                      {bt.id === 'llp' && <Users className="w-4 h-4" />}
                      {bt.id === 'public_ltd' && <Landmark className="w-4 h-4" />}
                      {bt.id === 'section_8' && <HeartHandshake className="w-4 h-4" />}
                      {bt.id === 'partnership_firm' && <Briefcase className="w-4 h-4" />}
                      {bt.id === 'proprietorship' && <User className="w-4 h-4" />}
                      {bt.id === 'other_business' && <Layers className="w-4 h-4" />}
                    </div>
                    <span className="text-xs font-bold text-slate-900 leading-tight">
                      {bt.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {bt.shortDescription}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  <span>{bt.estimatedDays}</span>
                  <span className={isSelected ? 'text-blue-700 font-bold' : 'text-slate-400'}>
                    {isSelected ? 'Selected' : 'Select'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===================================================================
          3. RESPONSIVE TWO-COLUMN LAYOUT
          LEFT: Form Details | RIGHT: Sidebar (Checklist, Add-ons, Summary)
          =================================================================== */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ===============================================================
            MAIN / LEFT AREA: Numbered Sections 1 to 8 (lg:col-span-8)
            =============================================================== */}
        <div className="lg:col-span-8 space-y-6">

          {/* -------------------------------------------------------------
              SECTION 1: CLIENT / APPLICANT DETAILS
              ------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  1
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    SECTION 1 – CLIENT / APPLICANT DETAILS
                  </h3>
                  <p className="text-xs text-slate-500">
                    Primary contact person & promoter initiating this registration
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                Primary Applicant
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div className="space-y-1">
                  <label htmlFor={`${formUid}-fullName`} className="block text-xs font-bold text-slate-700">
                    Client / Applicant Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`${formUid}-fullName`}
                    type="text"
                    required
                    placeholder="e.g. Vikram Aditya Sharma"
                    value={applicant.fullName}
                    onChange={(e) => setApplicant({ ...applicant, fullName: e.target.value })}
                    className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                      fieldErrors.fullName ? 'border-red-400 ring-2 ring-red-200 bg-red-50/20' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {fieldErrors.fullName && <p className="text-[11px] text-red-600">{fieldErrors.fullName}</p>}
                </div>

                {/* Father / Mother Name */}
                <div className="space-y-1">
                  <label htmlFor={`${formUid}-parentName`} className="block text-xs font-bold text-slate-700">
                    Father's / Mother's Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`${formUid}-parentName`}
                    type="text"
                    required
                    placeholder="e.g. Rameshwar Sharma"
                    value={applicant.parentName}
                    onChange={(e) => setApplicant({ ...applicant, parentName: e.target.value })}
                    className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                      fieldErrors.parentName ? 'border-red-400 ring-2 ring-red-200 bg-red-50/20' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {fieldErrors.parentName && <p className="text-[11px] text-red-600">{fieldErrors.parentName}</p>}
                </div>

                {/* Contact Number */}
                <div className="space-y-1">
                  <label htmlFor={`${formUid}-mobile`} className="block text-xs font-bold text-slate-700">
                    Contact Number (Mobile) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-medium">+91</span>
                    <input
                      id={`${formUid}-mobile`}
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="9845012345"
                      value={applicant.mobile}
                      onChange={(e) => setApplicant({ ...applicant, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      className={`w-full text-xs sm:text-sm pl-11 pr-3.5 py-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                        fieldErrors.mobile ? 'border-red-400 ring-2 ring-red-200 bg-red-50/20' : 'border-slate-300 focus:ring-blue-500'
                      }`}
                    />
                  </div>
                  {fieldErrors.mobile && <p className="text-[11px] text-red-600">{fieldErrors.mobile}</p>}
                </div>

                {/* Email ID */}
                <div className="space-y-1">
                  <label htmlFor={`${formUid}-email`} className="block text-xs font-bold text-slate-700">
                    Email ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`${formUid}-email`}
                    type="email"
                    required
                    placeholder="client@company.com"
                    value={applicant.email}
                    onChange={(e) => setApplicant({ ...applicant, email: e.target.value })}
                    className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                      fieldErrors.email ? 'border-red-400 ring-2 ring-red-200 bg-red-50/20' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {fieldErrors.email && <p className="text-[11px] text-red-600">{fieldErrors.email}</p>}
                </div>

                {/* Alternate Number */}
                <div className="space-y-1">
                  <label htmlFor={`${formUid}-alternateNumber`} className="block text-xs font-bold text-slate-700">
                    Alternate Number (Optional)
                  </label>
                  <input
                    id={`${formUid}-alternateNumber`}
                    type="tel"
                    maxLength={10}
                    placeholder="9845098765"
                    value={applicant.alternateNumber || ''}
                    onChange={(e) => setApplicant({ ...applicant, alternateNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* DOB & Gender */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label htmlFor={`${formUid}-dob`} className="block text-xs font-bold text-slate-700">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`${formUid}-dob`}
                      type="date"
                      required
                      value={applicant.dob}
                      onChange={(e) => setApplicant({ ...applicant, dob: e.target.value })}
                      className={`w-full text-xs px-2.5 py-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                        fieldErrors.dob ? 'border-red-400 ring-2 ring-red-200' : 'border-slate-300 focus:ring-blue-500'
                      }`}
                    />
                    {fieldErrors.dob && <p className="text-[11px] text-red-600">{fieldErrors.dob}</p>}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor={`${formUid}-gender`} className="block text-xs font-bold text-slate-700">
                      Gender
                    </label>
                    <select
                      id={`${formUid}-gender`}
                      value={applicant.gender}
                      onChange={(e) => setApplicant({ ...applicant, gender: e.target.value as any })}
                      className="w-full text-xs px-2.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* PAN Number */}
                <div className="space-y-1">
                  <label htmlFor={`${formUid}-pan`} className="block text-xs font-bold text-slate-700">
                    PAN Card Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`${formUid}-pan`}
                    type="text"
                    required
                    maxLength={10}
                    placeholder="ABCDE1234F"
                    value={applicant.pan}
                    onChange={(e) => setApplicant({ ...applicant, pan: e.target.value.toUpperCase().slice(0, 10) })}
                    className={`w-full font-mono text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                      fieldErrors.pan ? 'border-red-400 ring-2 ring-red-200 bg-red-50/20' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {fieldErrors.pan && <p className="text-[11px] text-red-600">{fieldErrors.pan}</p>}
                </div>

                {/* Aadhaar Number */}
                <div className="space-y-1">
                  <label htmlFor={`${formUid}-aadhaar`} className="block text-xs font-bold text-slate-700">
                    Aadhaar Number (12 Digits) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`${formUid}-aadhaar`}
                    type="text"
                    required
                    maxLength={12}
                    placeholder="1234 5678 9012"
                    value={applicant.aadhaar}
                    onChange={(e) => setApplicant({ ...applicant, aadhaar: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                    className={`w-full font-mono text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                      fieldErrors.aadhaar ? 'border-red-400 ring-2 ring-red-200 bg-red-50/20' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {fieldErrors.aadhaar && <p className="text-[11px] text-red-600">{fieldErrors.aadhaar}</p>}
                </div>

              </div>

              {/* Residential Street Address */}
              <div className="space-y-1 pt-2">
                <label htmlFor={`${formUid}-address`} className="block text-xs font-bold text-slate-700">
                  Residential Address (Flat/House No., Street, Area) <span className="text-red-500">*</span>
                </label>
                <textarea
                  id={`${formUid}-address`}
                  required
                  rows={2}
                  placeholder="e.g. Flat 402, Prestige Silicon Residency, 14th Main Road, HSR Layout Sector 2"
                  value={applicant.address}
                  onChange={(e) => setApplicant({ ...applicant, address: e.target.value })}
                  className={`w-full text-xs sm:text-sm px-3.5 py-2 rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                    fieldErrors.address ? 'border-red-400 ring-2 ring-red-200' : 'border-slate-300 focus:ring-blue-500'
                  }`}
                />
                {fieldErrors.address && <p className="text-[11px] text-red-600">{fieldErrors.address}</p>}
              </div>

              {/* City, District, State, PIN */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label htmlFor={`${formUid}-city`} className="block text-xs font-bold text-slate-700">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`${formUid}-city`}
                    type="text"
                    required
                    placeholder="Bangalore"
                    value={applicant.city}
                    onChange={(e) => setApplicant({ ...applicant, city: e.target.value })}
                    className={`w-full text-xs px-3 py-2 rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                      fieldErrors.city ? 'border-red-400 ring-2 ring-red-200' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {fieldErrors.city && <p className="text-[11px] text-red-600">{fieldErrors.city}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor={`${formUid}-district`} className="block text-xs font-bold text-slate-700">
                    District <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`${formUid}-district`}
                    type="text"
                    required
                    placeholder="Bangalore Urban"
                    value={applicant.district}
                    onChange={(e) => setApplicant({ ...applicant, district: e.target.value })}
                    className={`w-full text-xs px-3 py-2 rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                      fieldErrors.district ? 'border-red-400 ring-2 ring-red-200' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {fieldErrors.district && <p className="text-[11px] text-red-600">{fieldErrors.district}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor={`${formUid}-state`} className="block text-xs font-bold text-slate-700">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    id={`${formUid}-state`}
                    value={applicant.state}
                    onChange={(e) => setApplicant({ ...applicant, state: e.target.value })}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor={`${formUid}-pincode`} className="block text-xs font-bold text-slate-700">
                    PIN Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`${formUid}-pincode`}
                    type="text"
                    required
                    maxLength={6}
                    placeholder="560102"
                    value={applicant.pincode}
                    onChange={(e) => setApplicant({ ...applicant, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    className={`w-full text-xs px-3 py-2 rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                      fieldErrors.pincode ? 'border-red-400 ring-2 ring-red-200' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {fieldErrors.pincode && <p className="text-[11px] text-red-600">{fieldErrors.pincode}</p>}
                </div>
              </div>

            </div>
          </div>

          {/* -------------------------------------------------------------
              SECTION 2: PROPOSED BUSINESS / COMPANY NAME
              ------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  2
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    SECTION 2 – PROPOSED BUSINESS / COMPANY NAME
                  </h3>
                  <p className="text-xs text-slate-500">
                    Provide 2 to 3 preferred choices in order of priority for MCA / Registrar approval
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                RUN / SPICe+ Part A
              </span>
            </div>

            <div className="p-6 space-y-4">
              
              {/* Guidelines Box */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-blue-800">
                  <Info className="w-4 h-4 text-blue-600" />
                  Statutory Name Selection Guidelines:
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-blue-800/90 text-[11px] pl-1">
                  <li>Provide 2–3 preferred names in order of priority.</li>
                  <li>Name must be unique and descriptive of the main business object.</li>
                  <li>Avoid existing registered trademarks or identical active MCA registered companies.</li>
                  <li>Legal suffix (e.g. PRIVATE LIMITED, OPC PVT LTD, LLP) will be appended automatically.</li>
                </ul>
              </div>

              <div className="space-y-3">
                {/* Proposed Name 1 */}
                <div className="space-y-1">
                  <label htmlFor={`${formUid}-proposedName1`} className="block text-xs font-bold text-slate-700">
                    Proposed Business Name 1 (Primary Preference) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`${formUid}-proposedName1`}
                    type="text"
                    required
                    placeholder="e.g. ZENITH NEOTECH SOLUTIONS"
                    value={business.proposedName1}
                    onChange={(e) => setBusiness({ ...business, proposedName1: e.target.value.toUpperCase() })}
                    className={`w-full text-xs sm:text-sm font-semibold tracking-wide uppercase px-3.5 py-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                      fieldErrors.proposedName1 ? 'border-red-400 ring-2 ring-red-200 bg-red-50/20' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {fieldErrors.proposedName1 && <p className="text-[11px] text-red-600">{fieldErrors.proposedName1}</p>}
                </div>

                {/* Proposed Name 2 */}
                <div className="space-y-1">
                  <label htmlFor={`${formUid}-proposedName2`} className="block text-xs font-bold text-slate-700">
                    Proposed Business Name 2 (Alternative Preference)
                  </label>
                  <input
                    id={`${formUid}-proposedName2`}
                    type="text"
                    placeholder="e.g. ZENITH LOGIC SYSTEMS"
                    value={business.proposedName2 || ''}
                    onChange={(e) => setBusiness({ ...business, proposedName2: e.target.value.toUpperCase() })}
                    className="w-full text-xs sm:text-sm font-semibold tracking-wide uppercase px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Proposed Name 3 */}
                <div className="space-y-1">
                  <label htmlFor={`${formUid}-proposedName3`} className="block text-xs font-bold text-slate-700">
                    Proposed Business Name 3 (Backup Preference)
                  </label>
                  <input
                    id={`${formUid}-proposedName3`}
                    type="text"
                    placeholder="e.g. ZENITH AI INFRASTRUCTURE"
                    value={business.proposedName3 || ''}
                    onChange={(e) => setBusiness({ ...business, proposedName3: e.target.value.toUpperCase() })}
                    className="w-full text-xs sm:text-sm font-semibold tracking-wide uppercase px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* -------------------------------------------------------------
              SECTION 3: BUSINESS & OBJECT DETAILS
              ------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  3
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    SECTION 3 – BUSINESS / OBJECT DETAILS
                  </h3>
                  <p className="text-xs text-slate-500">
                    Summary of commercial activities for the Memorandum of Association (MoA) / Agreement
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Nature of Business */}
                <div className="space-y-1">
                  <label htmlFor={`${formUid}-natureOfBusiness`} className="block text-xs font-bold text-slate-700">
                    Industry / Nature of Business <span className="text-red-500">*</span>
                  </label>
                  <select
                    id={`${formUid}-natureOfBusiness`}
                    value={business.natureOfBusiness}
                    onChange={(e) => setBusiness({ ...business, natureOfBusiness: e.target.value as any })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Technology">Technology / Software / IT</option>
                    <option value="Services">Professional Services & Consulting</option>
                    <option value="Manufacturing">Manufacturing & Industrial</option>
                    <option value="Trading">Trading / Wholesale & Retail</option>
                    <option value="Consulting">Consulting / Financial / Legal</option>
                    <option value="Solar / Renewable Energy">Solar / Renewable Energy</option>
                    <option value="Construction">Construction & Real Estate</option>
                    <option value="Transport">Logistics & Transportation</option>
                    <option value="Education">Education & EdTech</option>
                    <option value="Food">Food & Beverage / Hospitality</option>
                    <option value="Other">Other Industry</option>
                  </select>
                </div>

                {/* NIC Code (Optional) */}
                <div className="space-y-1">
                  <label htmlFor={`${formUid}-nicCode`} className="block text-xs font-bold text-slate-700">
                    National Industrial Classification (NIC) Code (Optional)
                  </label>
                  <input
                    id={`${formUid}-nicCode`}
                    type="text"
                    placeholder="e.g. 62011 (Writing of software)"
                    value={business.nicCode || ''}
                    onChange={(e) => setBusiness({ ...business, nicCode: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

              </div>

              {business.natureOfBusiness === 'Other' && (
                <div className="space-y-1">
                  <label htmlFor={`${formUid}-otherNatureText`} className="block text-xs font-bold text-slate-700">
                    Specify Nature of Business <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`${formUid}-otherNatureText`}
                    type="text"
                    required
                    placeholder="e.g. Biotechnology research, Aerospace components"
                    value={business.otherNatureText || ''}
                    onChange={(e) => setBusiness({ ...business, otherNatureText: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Main Business Activity */}
              <div className="space-y-1">
                <label htmlFor={`${formUid}-mainActivity`} className="block text-xs font-bold text-slate-700">
                  Main Business Activity (1-2 sentences) <span className="text-red-500">*</span>
                </label>
                <input
                  id={`${formUid}-mainActivity`}
                  type="text"
                  required
                  placeholder="e.g. Providing cloud SaaS applications, IT consulting, and enterprise software engineering"
                  value={business.mainActivity}
                  onChange={(e) => setBusiness({ ...business, mainActivity: e.target.value })}
                  className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                    fieldErrors.mainActivity ? 'border-red-400 ring-2 ring-red-200 bg-red-50/20' : 'border-slate-300 focus:ring-blue-500'
                  }`}
                />
                {fieldErrors.mainActivity && <p className="text-[11px] text-red-600">{fieldErrors.mainActivity}</p>}
              </div>

              {/* Detailed Business Description */}
              <div className="space-y-1">
                <label htmlFor={`${formUid}-businessDescription`} className="block text-xs font-bold text-slate-700">
                  Detailed Scope of Operations & Target Market <span className="text-red-500">*</span>
                </label>
                <textarea
                  id={`${formUid}-businessDescription`}
                  required
                  rows={3}
                  placeholder="Describe your planned business operations, customer segment, and products or services in detail (minimum 20 characters)..."
                  value={business.businessDescription}
                  onChange={(e) => setBusiness({ ...business, businessDescription: e.target.value })}
                  className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                    fieldErrors.businessDescription ? 'border-red-400 ring-2 ring-red-200 bg-red-50/20' : 'border-slate-300 focus:ring-blue-500'
                  }`}
                />
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>Minimum 20 characters required</span>
                  <span>{business.businessDescription.length} characters</span>
                </div>
                {fieldErrors.businessDescription && <p className="text-[11px] text-red-600">{fieldErrors.businessDescription}</p>}
              </div>

              {/* Section 8 specific non-profit objectives */}
              {selectedType.id === 'section_8' && (
                <div className="space-y-1 pt-2 border-t border-slate-200">
                  <label htmlFor={`${formUid}-nonProfitObjective`} className="block text-xs font-bold text-blue-900">
                    Section 8 Non-Profit & Charitable Objectives <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id={`${formUid}-nonProfitObjective`}
                    required
                    rows={2}
                    placeholder="Specify the promotion of commerce, art, science, education, charity, social welfare, religion, or environmental protection..."
                    value={business.nonProfitObjective || ''}
                    onChange={(e) => setBusiness({ ...business, nonProfitObjective: e.target.value })}
                    className={`w-full text-xs px-3.5 py-2 rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                      fieldErrors.nonProfitObjective ? 'border-red-400 ring-2 ring-red-200' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {fieldErrors.nonProfitObjective && <p className="text-[11px] text-red-600">{fieldErrors.nonProfitObjective}</p>}
                </div>
              )}

            </div>
          </div>

          {/* -------------------------------------------------------------
              SECTION 4: CAPITAL & SHARE STRUCTURE
              ------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  4
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    SECTION 4 – CAPITAL DETAILS & STRUCTURE
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedType.category === 'company' 
                      ? 'Authorised and paid-up equity share capital configuration' 
                      : 'Capital contribution and partner equity participation'}
                  </p>
                </div>
              </div>
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-semibold">
                No Minimum Statutory Capital (Companies Act 2013)
              </span>
            </div>

            <div className="p-6">
              {selectedType.category === 'company' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label htmlFor={`${formUid}-authorisedCapital`} className="block text-xs font-bold text-slate-700">
                      Authorised Capital (₹)
                    </label>
                    <input
                      id={`${formUid}-authorisedCapital`}
                      type="number"
                      step={10000}
                      value={capital.authorisedCapital}
                      onChange={(e) => setCapital({ ...capital, authorisedCapital: Number(e.target.value) })}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white font-mono focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[10px] text-slate-400">Default: ₹1,00,000</p>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor={`${formUid}-paidUpCapital`} className="block text-xs font-bold text-slate-700">
                      Paid-Up Capital (₹)
                    </label>
                    <input
                      id={`${formUid}-paidUpCapital`}
                      type="number"
                      step={10000}
                      value={capital.paidUpCapital}
                      onChange={(e) => setCapital({ ...capital, paidUpCapital: Number(e.target.value) })}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white font-mono focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[10px] text-slate-400">Initial deposit</p>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor={`${formUid}-numberOfShares`} className="block text-xs font-bold text-slate-700">
                      Total Equity Shares
                    </label>
                    <input
                      id={`${formUid}-numberOfShares`}
                      type="number"
                      value={capital.numberOfShares}
                      onChange={(e) => setCapital({ ...capital, numberOfShares: Number(e.target.value) })}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white font-mono focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[10px] text-slate-400">e.g. 10,000 shares</p>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor={`${formUid}-faceValuePerShare`} className="block text-xs font-bold text-slate-700">
                      Nominal Face Value (₹)
                    </label>
                    <select
                      id={`${formUid}-faceValuePerShare`}
                      value={capital.faceValuePerShare}
                      onChange={(e) => setCapital({ ...capital, faceValuePerShare: Number(e.target.value) })}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white font-mono focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={10}>₹10 per share</option>
                      <option value={100}>₹100 per share</option>
                      <option value={1}>₹1 per share</option>
                    </select>
                    <p className="text-[10px] text-slate-400">Statutory standard: ₹10</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor={`${formUid}-initialCapitalContribution`} className="block text-xs font-bold text-slate-700">
                      Initial Capital Contribution in INR (₹)
                    </label>
                    <input
                      id={`${formUid}-initialCapitalContribution`}
                      type="number"
                      step={10000}
                      value={capital.authorisedCapital}
                      onChange={(e) => setCapital({ ...capital, authorisedCapital: Number(e.target.value), paidUpCapital: Number(e.target.value) })}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white font-mono focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[10px] text-slate-400">Contributed by partners / proprietor</p>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor={`${formUid}-profitSharingTerms`} className="block text-xs font-bold text-slate-700">
                      Profit Sharing Terms
                    </label>
                    <input
                      id={`${formUid}-profitSharingTerms`}
                      type="text"
                      placeholder="e.g. Equal sharing 50:50, or proportional to capital"
                      defaultValue="Equal sharing between partners as per agreement"
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* -------------------------------------------------------------
              SECTION 5: DIRECTORS / PARTNERS / NOMINEE DETAILS (DYNAMIC)
              ------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  5
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    SECTION 5 – {selectedType.id === 'opc' 
                      ? 'SOLE DIRECTOR & NOMINEE DETAILS' 
                      : selectedType.id === 'proprietorship'
                      ? 'SOLE PROPRIETOR DETAILS'
                      : selectedType.id === 'llp'
                      ? 'DESIGNATED PARTNERS & PARTNERS'
                      : 'DIRECTORS & SHAREHOLDERS'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedType.id === 'opc'
                      ? 'Mandatory 1 Sole Director + 1 Statutory Nominee (INC-3 Consent Form)'
                      : `Minimum ${selectedType.minMembers} promoters required for ${selectedType.name}`}
                  </p>
                </div>
              </div>

              {selectedType.id !== 'opc' && selectedType.id !== 'proprietorship' && (
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Another Member
                </button>
              )}
            </div>

            <div className="p-6 space-y-6">
              
              {/* Special Note for OPC Nominee requirement */}
              {selectedType.id === 'opc' && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Statutory OPC Requirement (Companies Act 2013, Section 3(1)):</span>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      An OPC requires one natural person as Sole Member and one statutory Nominee who will assume control in the event of the member's death or incapacity. Written consent in Form INC-3 is mandatory.
                    </p>
                  </div>
                </div>
              )}

              {/* Members List */}
              <div className="space-y-6">
                {members.map((member, idx) => {
                  const isNominee = member.roleType === 'nominee';
                  
                  return (
                    <div 
                      key={member.id} 
                      className={`p-4 sm:p-5 rounded-xl border-2 transition-all ${
                        isNominee 
                          ? 'border-indigo-200 bg-indigo-50/30' 
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                            isNominee 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {isNominee ? 'STATUTORY NOMINEE (INC-3)' : `${member.designation || `Promoter #${idx + 1}`}`}
                          </span>
                          {!isNominee && idx === 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                handleMemberChange(member.id, {
                                  fullName: applicant.fullName,
                                  pan: applicant.pan,
                                  aadhaar: applicant.aadhaar,
                                  mobile: applicant.mobile,
                                  email: applicant.email,
                                  address: applicant.address,
                                });
                              }}
                              className="text-[11px] text-blue-600 hover:text-blue-800 underline font-medium"
                            >
                              Copy from Applicant
                            </button>
                          )}
                        </div>

                        {/* Remove button if expandable and > minMembers */}
                        {!isNominee && members.length > selectedType.minMembers && selectedType.id !== 'opc' && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        
                        {/* Member Full Name */}
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700">
                            {isNominee ? 'Nominee Full Name' : 'Full Legal Name'} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={isNominee ? 'e.g. Ananya Sharma' : 'e.g. Vikram Aditya Sharma'}
                            value={member.fullName}
                            onChange={(e) => handleMemberChange(member.id, { fullName: e.target.value })}
                            className={`w-full text-xs px-3 py-2 rounded-lg border bg-white focus:ring-2 focus:ring-blue-500 ${
                              isNominee && fieldErrors.nomineeName ? 'border-red-400 ring-2 ring-red-200' : 'border-slate-300'
                            }`}
                          />
                          {isNominee && fieldErrors.nomineeName && (
                            <p className="text-[10px] text-red-600">{fieldErrors.nomineeName}</p>
                          )}
                        </div>

                        {/* Member PAN */}
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700">
                            PAN Card Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={10}
                            placeholder="ABCDE1234F"
                            value={member.pan}
                            onChange={(e) => handleMemberChange(member.id, { pan: e.target.value.toUpperCase() })}
                            className={`w-full font-mono text-xs px-3 py-2 rounded-lg border bg-white focus:ring-2 focus:ring-blue-500 ${
                              isNominee && fieldErrors.nomineePan ? 'border-red-400 ring-2 ring-red-200' : 'border-slate-300'
                            }`}
                          />
                          {isNominee && fieldErrors.nomineePan && (
                            <p className="text-[10px] text-red-600">{fieldErrors.nomineePan}</p>
                          )}
                        </div>

                        {/* Member Aadhaar */}
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700">
                            Aadhaar Number (12 Digits) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={12}
                            placeholder="12-digit Aadhaar"
                            value={member.aadhaar}
                            onChange={(e) => handleMemberChange(member.id, { aadhaar: e.target.value.replace(/\D/g, '') })}
                            className="w-full font-mono text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Mobile */}
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700">
                            Mobile Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            placeholder="10-digit mobile"
                            value={member.mobile}
                            onChange={(e) => handleMemberChange(member.id, { mobile: e.target.value.replace(/\D/g, '') })}
                            className={`w-full text-xs px-3 py-2 rounded-lg border bg-white focus:ring-2 focus:ring-blue-500 ${
                              isNominee && fieldErrors.nomineeMobile ? 'border-red-400 ring-2 ring-red-200' : 'border-slate-300'
                            }`}
                          />
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700">
                            Email ID <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="member@email.com"
                            value={member.email}
                            onChange={(e) => handleMemberChange(member.id, { email: e.target.value })}
                            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Specific field: DIN / Relationship / Share % */}
                        {isNominee ? (
                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-indigo-900">
                              Relationship with Member <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={member.relationshipWithPromoter || 'Spouse'}
                              onChange={(e) => handleMemberChange(member.id, { relationshipWithPromoter: e.target.value })}
                              className="w-full text-xs px-3 py-2 rounded-lg border border-indigo-300 bg-white focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="Spouse">Spouse</option>
                              <option value="Father">Father</option>
                              <option value="Mother">Mother</option>
                              <option value="Son">Son</option>
                              <option value="Daughter">Daughter</option>
                              <option value="Brother">Brother</option>
                              <option value="Sister">Sister</option>
                              <option value="Business Associate">Business Associate / Other</option>
                            </select>
                          </div>
                        ) : selectedType.category === 'company' ? (
                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">
                              Equity Shareholding (%)
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={member.shareholdingPercent || 0}
                              onChange={(e) => handleMemberChange(member.id, { shareholdingPercent: Number(e.target.value) })}
                              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700">
                              Profit Sharing Ratio (%)
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={member.profitSharingPercent || 50}
                              onChange={(e) => handleMemberChange(member.id, { profitSharingPercent: Number(e.target.value) })}
                              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        )}

                      </div>

                      {/* Member Address */}
                      <div className="mt-3 space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700">
                          {isNominee ? 'Nominee Residential Address' : 'Residential Address'}
                        </label>
                        <input
                          type="text"
                          placeholder="Complete address with City and PIN Code"
                          value={member.address}
                          onChange={(e) => handleMemberChange(member.id, { address: e.target.value })}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Nominee Consent Checkbox */}
                      {isNominee && (
                        <div className="mt-3 pt-3 border-t border-indigo-200">
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-indigo-950 font-medium">
                            <input
                              type="checkbox"
                              checked={member.nomineeConsentGiven ?? true}
                              onChange={(e) => handleMemberChange(member.id, { nomineeConsentGiven: e.target.checked })}
                              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                            />
                            <span>
                              I confirm that written statutory consent in Form INC-3 has been signed by the nominee.
                            </span>
                          </label>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

            </div>
          </div>

          {/* -------------------------------------------------------------
              SECTION 6: REGISTERED OFFICE DETAILS
              ------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  6
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    SECTION 6 – REGISTERED OFFICE DETAILS
                  </h3>
                  <p className="text-xs text-slate-500">
                    Official address for RoC statutory notices and tax jurisdictions (SPICe+ Part B / Form INC-22)
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              
              {/* Office Ownership Type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Premises Ownership Category <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'rental', label: 'Rented / Leased Property', desc: 'Requires Rent Agreement + Owner NOC + Utility Bill' },
                    { id: 'own', label: 'Owned by Director / Promoter', desc: 'Requires Tax Paid Receipt / Deed + Utility Bill' },
                    { id: 'consent', label: 'Shared / Family Consent Property', desc: 'Requires Signed Consent Letter + Utility Bill' },
                  ].map((ot) => (
                    <label
                      key={ot.id}
                      className={`cursor-pointer p-3 rounded-xl border-2 flex flex-col justify-between transition-all ${
                        office.officeType === ot.id 
                          ? 'border-blue-600 bg-blue-50/50 text-blue-950 font-bold' 
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="officeType"
                          value={ot.id}
                          checked={office.officeType === ot.id}
                          onChange={() => setOffice({ ...office, officeType: ot.id as OfficeType })}
                          className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                        />
                        <span className="text-xs font-bold">{ot.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 pl-6">
                        {ot.desc}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Address Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                <div className="space-y-1">
                  <label htmlFor={`${formUid}-doorNo`} className="block text-xs font-bold text-slate-700">
                    Door / Suite / Flat No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`${formUid}-doorNo`}
                    type="text"
                    required
                    placeholder="e.g. Suite 204, Tower B"
                    value={office.doorNo}
                    onChange={(e) => setOffice({ ...office, doorNo: e.target.value })}
                    className={`w-full text-xs px-3 py-2 rounded-lg border bg-white focus:ring-2 focus:ring-blue-500 ${
                      fieldErrors.doorNo ? 'border-red-400 ring-2 ring-red-200' : 'border-slate-300'
                    }`}
                  />
                  {fieldErrors.doorNo && <p className="text-[10px] text-red-600">{fieldErrors.doorNo}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor={`${formUid}-street`} className="block text-xs font-bold text-slate-700">
                    Street / Road Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`${formUid}-street`}
                    type="text"
                    required
                    placeholder="e.g. Outer Ring Road"
                    value={office.street}
                    onChange={(e) => setOffice({ ...office, street: e.target.value })}
                    className={`w-full text-xs px-3 py-2 rounded-lg border bg-white focus:ring-2 focus:ring-blue-500 ${
                      fieldErrors.street ? 'border-red-400 ring-2 ring-red-200' : 'border-slate-300'
                    }`}
                  />
                  {fieldErrors.street && <p className="text-[10px] text-red-600">{fieldErrors.street}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor={`${formUid}-area`} className="block text-xs font-bold text-slate-700">
                    Area / Locality / Landmark <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`${formUid}-area`}
                    type="text"
                    required
                    placeholder="e.g. Bellandur / Near EcoWorld"
                    value={office.area}
                    onChange={(e) => setOffice({ ...office, area: e.target.value })}
                    className={`w-full text-xs px-3 py-2 rounded-lg border bg-white focus:ring-2 focus:ring-blue-500 ${
                      fieldErrors.area ? 'border-red-400 ring-2 ring-red-200' : 'border-slate-300'
                    }`}
                  />
                  {fieldErrors.area && <p className="text-[10px] text-red-600">{fieldErrors.area}</p>}
                </div>
              </div>

              {/* City, State, PIN */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <label htmlFor={`${formUid}-officeCity`} className="block text-xs font-bold text-slate-700">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`${formUid}-officeCity`}
                    type="text"
                    required
                    placeholder="Bangalore"
                    value={office.city}
                    onChange={(e) => setOffice({ ...office, city: e.target.value })}
                    className={`w-full text-xs px-3 py-2 rounded-lg border bg-white focus:ring-2 focus:ring-blue-500 ${
                      fieldErrors.officeCity ? 'border-red-400 ring-2 ring-red-200' : 'border-slate-300'
                    }`}
                  />
                  {fieldErrors.officeCity && <p className="text-[10px] text-red-600">{fieldErrors.officeCity}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor={`${formUid}-officeState`} className="block text-xs font-bold text-slate-700">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    id={`${formUid}-officeState`}
                    value={office.state}
                    onChange={(e) => setOffice({ ...office, state: e.target.value })}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor={`${formUid}-officePincode`} className="block text-xs font-bold text-slate-700">
                    Office PIN Code (6 Digits) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`${formUid}-officePincode`}
                    type="text"
                    required
                    maxLength={6}
                    placeholder="560103"
                    value={office.pincode}
                    onChange={(e) => setOffice({ ...office, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    className={`w-full text-xs px-3 py-2 rounded-lg border bg-white focus:ring-2 focus:ring-blue-500 ${
                      fieldErrors.officePincode ? 'border-red-400 ring-2 ring-red-200' : 'border-slate-300'
                    }`}
                  />
                  {fieldErrors.officePincode && <p className="text-[10px] text-red-600">{fieldErrors.officePincode}</p>}
                </div>
              </div>

              {/* Owner details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label htmlFor={`${formUid}-ownerName`} className="block text-xs font-bold text-slate-700">
                    Property Owner / Lessor Legal Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`${formUid}-ownerName`}
                    type="text"
                    required
                    placeholder="e.g. Suresh Babu Realty Ventures"
                    value={office.ownerName}
                    onChange={(e) => setOffice({ ...office, ownerName: e.target.value })}
                    className={`w-full text-xs px-3 py-2 rounded-lg border bg-white focus:ring-2 focus:ring-blue-500 ${
                      fieldErrors.ownerName ? 'border-red-400 ring-2 ring-red-200' : 'border-slate-300'
                    }`}
                  />
                  {fieldErrors.ownerName && <p className="text-[10px] text-red-600">{fieldErrors.ownerName}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor={`${formUid}-ownerMobile`} className="block text-xs font-bold text-slate-700">
                    Owner Contact Number (Mobile) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`${formUid}-ownerMobile`}
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9844011223"
                    value={office.ownerMobile}
                    onChange={(e) => setOffice({ ...office, ownerMobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className={`w-full text-xs px-3 py-2 rounded-lg border bg-white focus:ring-2 focus:ring-blue-500 ${
                      fieldErrors.ownerMobile ? 'border-red-400 ring-2 ring-red-200' : 'border-slate-300'
                    }`}
                  />
                  {fieldErrors.ownerMobile && <p className="text-[10px] text-red-600">{fieldErrors.ownerMobile}</p>}
                </div>
              </div>

            </div>
          </div>

          {/* -------------------------------------------------------------
              SECTION 7: DOCUMENT UPLOADS & ATTACHMENTS (DYNAMIC CHECKLIST)
              ------------------------------------------------------------- */}
          <div id="section-documents" className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden scroll-mt-24">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  7
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    SECTION 7 – DOCUMENT UPLOADS & ATTACHMENTS
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upload self-attested PDF or image copies for statutory verification
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAttachAllSampleDocs}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 transition-colors shadow-xs self-start sm:self-auto"
                title="Attach sample mock files for all required items to quickly test form submission"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                Auto-Attach Sample KYC Docs
              </button>
            </div>

            <div className="p-6 space-y-4">
              
              {/* Mandatory document verification banner based on selected entity */}
              {mandatoryDocDefs.length > 0 && (
                <div className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
                  uploadedMandatoryCount === mandatoryDocDefs.length
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  {uploadedMandatoryCount === mandatoryDocDefs.length ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs space-y-1">
                    <div className="font-bold flex items-center gap-2">
                      <span>
                        {uploadedMandatoryCount === mandatoryDocDefs.length
                          ? `Mandatory Documents Verified for ${selectedType.name}`
                          : `Mandatory Document Verification: ${selectedType.name}`}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        uploadedMandatoryCount === mandatoryDocDefs.length
                          ? 'bg-emerald-200 text-emerald-800'
                          : 'bg-amber-200 text-amber-800'
                      }`}>
                        {uploadedMandatoryCount}/{mandatoryDocDefs.length} Uploaded
                      </span>
                    </div>
                    <p className={uploadedMandatoryCount === mandatoryDocDefs.length ? 'text-emerald-700' : 'text-amber-800'}>
                      {uploadedMandatoryCount === mandatoryDocDefs.length
                        ? 'All statutory document requirements are satisfied. You may proceed to submit your application.'
                        : `Client validation requirement: Please upload the remaining mandatory document(s) before submission: ${mandatoryDocDefs
                            .filter(d => !documents.some(doc => doc.docDefId === d.id && doc.fileName))
                            .map(d => d.title)
                            .join(', ')}.`}
                    </p>
                  </div>
                </div>
              )}

              <div className="text-xs text-slate-600 flex items-center justify-between pb-2 border-b border-slate-100">
                <span>
                  Checklist based on <strong>{selectedType.name}</strong> ({office.officeType.toUpperCase()} Office):
                </span>
                <span className="font-semibold text-blue-700">
                  {uploadedMandatoryCount} of {mandatoryDocDefs.length} Required Uploaded
                </span>
              </div>

              {/* Document upload items */}
              <div className="space-y-3">
                {requiredDocDefs.map((def) => {
                  const uploaded = documents.find(d => d.docDefId === def.id);
                  const isMissing = def.required && !uploaded;
                  const hasError = !!fieldErrors[`doc_${def.id}`];

                  return (
                    <div 
                      key={def.id}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        uploaded 
                          ? 'border-emerald-200 bg-emerald-50/30' 
                          : hasError 
                          ? 'border-red-300 bg-red-50/30 ring-1 ring-red-200' 
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="space-y-1 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">
                            {def.title}
                          </span>
                          {def.required ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                              Mandatory *
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              Optional
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {def.description}
                        </p>
                        {uploaded && (
                          <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-mono pt-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{uploaded.fileName}</span>
                            <span className="text-slate-400">({uploaded.fileSizeFormatted})</span>
                          </div>
                        )}
                        {hasError && (
                          <p className="text-[11px] text-red-600 font-medium">
                            {fieldErrors[`doc_${def.id}`]}
                          </p>
                        )}
                      </div>

                      {/* Upload / Replace Action */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {uploaded ? (
                          <>
                            <label className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs">
                              Replace
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handleFileUpload(def.id, e.target.files[0]);
                                  }
                                }}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => handleRemoveDoc(def.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Remove file"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <label className={`cursor-pointer px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                            hasError 
                              ? 'bg-red-600 text-white hover:bg-red-700' 
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}>
                            <UploadCloud className="w-4 h-4" />
                            <span>Upload File</span>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleFileUpload(def.id, e.target.files[0]);
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

          {/* -------------------------------------------------------------
              SECTION 8: STATUTORY DECLARATION & AUTHORIZATION
              ------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  8
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    SECTION 8 – STATUTORY DECLARATION & AUTHORIZATION
                  </h3>
                  <p className="text-xs text-slate-500">
                    Legal declaration and authorization for professional representation
                  </p>
                </div>
              </div>
              <Shield className="w-5 h-5 text-blue-600" />
            </div>

            <div className="p-6 space-y-4">
              
              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                {/* Checkbox 1 */}
                <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-800 leading-relaxed">
                  <input
                    type="checkbox"
                    checked={declarationConfirmed1}
                    onChange={(e) => setDeclarationConfirmed1(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span>
                    <strong>Statutory Truthfulness:</strong> I / We hereby declare that the particulars, disclosures, proposed names, and promoter details furnished in this application are true, accurate, and correct to the best of my knowledge and belief.
                  </span>
                </label>

                {/* Checkbox 2 */}
                <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-800 leading-relaxed">
                  <input
                    type="checkbox"
                    checked={declarationConfirmed2}
                    onChange={(e) => setDeclarationConfirmed2(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span>
                    <strong>Document Authenticity:</strong> I / We certify that all attached PAN, Aadhaar, identity proofs, utility bills, and agreements are genuine government-issued documents or legally executed contracts.
                  </span>
                </label>

                {/* Checkbox 3 */}
                <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-800 leading-relaxed">
                  <input
                    type="checkbox"
                    checked={declarationConfirmed3}
                    onChange={(e) => setDeclarationConfirmed3(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span>
                    <strong>Professional Representation Authorization:</strong> I / We hereby authorize <strong>Nagu Enterprises</strong> and its designated Company Secretaries (ACS/FCS), Chartered Accountants (FCA), and advocates to draft, certify, execute digital signatures, and submit statutory incorporation forms before the Ministry of Corporate Affairs (MCA), Registrar of Companies (RoC), and commercial tax authorities on our behalf.
                  </span>
                </label>

                {fieldErrors.declaration && (
                  <p className="text-xs text-red-600 font-bold pt-1">{fieldErrors.declaration}</p>
                )}
              </div>

              {/* Signatory Name & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                <div className="space-y-1">
                  <label htmlFor={`${formUid}-authorizedSignatory`} className="block text-xs font-bold text-slate-700">
                    Authorized Signatory Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`${formUid}-authorizedSignatory`}
                    type="text"
                    required
                    placeholder="e.g. Vikram Aditya Sharma"
                    value={authorizedSignatory}
                    onChange={(e) => setAuthorizedSignatory(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500"
                  />
                  {fieldErrors.authorizedSignatory && (
                    <p className="text-[11px] text-red-600">{fieldErrors.authorizedSignatory}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor={`${formUid}-declarationCity`} className="block text-xs font-bold text-slate-700">
                    Place / City
                  </label>
                  <input
                    id={`${formUid}-declarationCity`}
                    type="text"
                    placeholder="e.g. Bangalore"
                    value={declarationCity}
                    onChange={(e) => setDeclarationCity(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor={`${formUid}-declarationDate`} className="block text-xs font-bold text-slate-700">
                    Date of Submission
                  </label>
                  <input
                    id={`${formUid}-declarationDate`}
                    type="date"
                    readOnly
                    value={declarationDate}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-600 font-mono"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Primary Submit Section for convenience */}
          <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white font-display">
                Ready to file your {selectedType.name}?
              </h4>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-300">
                  All data will be securely stored with permanent reference ID generation.
                </span>
                {uploadedMandatoryCount < mandatoryDocDefs.length ? (
                  <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded font-medium">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    {mandatoryDocDefs.length - uploadedMandatoryCount} mandatory doc(s) required in Section 7
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    All mandatory documents verified
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                <Save className="w-4 h-4" /> Save Draft
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    SUBMIT REGISTRATION APPLICATION
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* ===============================================================
            RIGHT / SIDEBAR: Document Checklist, Add-ons, Summary (lg:col-span-4)
            =============================================================== */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          
          {/* SIDEBAR CARD 1: DOCUMENT CHECKLIST */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Document Checklist
                </h3>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                uploadedMandatoryCount === mandatoryDocDefs.length
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {uploadedMandatoryCount}/{mandatoryDocDefs.length} Uploaded
              </span>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    uploadedMandatoryCount === mandatoryDocDefs.length ? 'bg-emerald-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${(uploadedMandatoryCount / Math.max(mandatoryDocDefs.length, 1)) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                <span>Progress: {Math.round((uploadedMandatoryCount / Math.max(mandatoryDocDefs.length, 1)) * 100)}%</span>
                <span>{mandatoryDocDefs.length - uploadedMandatoryCount} Pending</span>
              </div>
            </div>

            {/* Itemized Quick Checklist */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
              {requiredDocDefs.map((def) => {
                const uploaded = documents.some(d => d.docDefId === def.id && d.fileName);
                return (
                  <div key={def.id} className="flex items-start gap-2 py-1 border-b border-slate-100 last:border-0">
                    {uploaded ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0 mt-0.5" />
                    )}
                    <div className="leading-tight">
                      <span className={`text-[11px] ${uploaded ? 'text-slate-800 font-semibold' : 'text-slate-500'}`}>
                        {def.title}
                      </span>
                      {def.required && !uploaded && (
                        <span className="text-[10px] text-amber-600 block">Required</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SIDEBAR CARD 2: ADDITIONAL SERVICES / COMPLIANCE ADD-ONS */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Additional Services & Add-Ons
                </h3>
                <p className="text-[11px] text-slate-500">
                  Select bundled registrations needed for your venture
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-800">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={additionalServices.needDSC}
                  onChange={(e) => setAdditionalServices({ ...additionalServices, needDSC: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>Digital Signature Certificate (DSC - Class 3)</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={additionalServices.needPanTan}
                  onChange={(e) => setAdditionalServices({ ...additionalServices, needPanTan: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>PAN & TAN Allotment (Included)</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={additionalServices.needBankAccount}
                  onChange={(e) => setAdditionalServices({ ...additionalServices, needBankAccount: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>Corporate Current Bank Account Assistance</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={additionalServices.needGST}
                  onChange={(e) => setAdditionalServices({ ...additionalServices, needGST: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>GST Registration Certificate</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={additionalServices.needMSME}
                  onChange={(e) => setAdditionalServices({ ...additionalServices, needMSME: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>MSME / Udyam Registration (Subsidies)</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={additionalServices.needTrademark}
                  onChange={(e) => setAdditionalServices({ ...additionalServices, needTrademark: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>Trademark Search & Filing (Brand Protection)</span>
              </label>
            </div>
          </div>

          {/* SIDEBAR CARD 3: APPLICATION SUMMARY & SUBMIT */}
          <div className="bg-white rounded-2xl border-2 border-blue-600 shadow-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                Application Summary
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                {selectedType.id.toUpperCase()}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Entity:</span>
                <span className="font-bold text-slate-900">{selectedType.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Estimated Filing:</span>
                <span className="font-semibold text-slate-700">{selectedType.estimatedDays}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Promoters / Members:</span>
                <span className="font-semibold text-slate-700">{members.length} member(s)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Estimated Fee:</span>
                <span className="font-extrabold text-blue-700 text-sm">{getFeeEstimate()}</span>
              </div>
              <p className="text-[10px] text-slate-400 italic">
                * Fee covers standard government ROC duties, DSC token, PAN, TAN & professional drafting.
              </p>
            </div>

            {/* Submit Action Button */}
            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    SUBMIT APPLICATION
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSaveDraft}
                className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" /> Save Application Draft
              </button>
            </div>

            {/* Helpline */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                Need Filing Assistance?
              </div>
              <p className="text-slate-500">
                Call our corporate compliance desk at <strong>+91 98450 12345</strong> or email <strong>naguenterprises84@gmail.com</strong>
              </p>
            </div>

          </div>

        </div>

      </form>

    </div>
  );
};
