import React, { useState, useEffect, useId } from 'react';
import { CONSULTANCY_CATEGORIES } from '../../data/consultancyServices';
import { 
  ConsultancyRecord, 
  ConsultancyDocument, 
  ConsultationPreference, 
  BusinessStage, 
  TurnoverRange 
} from '../../types/consultancy';
import { submitConsultancyRequest } from '../../services/consultancyService';
import { INDIAN_STATES } from '../wizard/ApplicantDetailsStep';
import logoImage from '../../assets/images/nagu_enterprises_logo_1791472953152.jpg';
import { 
  Building2, 
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
  Sparkles, 
  RotateCcw, 
  Clock, 
  ArrowRight, 
  Copy, 
  Download, 
  Check, 
  Calendar, 
  Video, 
  MessageSquare, 
  DollarSign, 
  TrendingUp, 
  Info 
} from 'lucide-react';

interface ConsultancyRequestFormProps {
  initialCategoryId?: string;
  initialSubServiceId?: string;
  onCancel: () => void;
  onViewStatus: (id: string) => void;
  onContactSupport: () => void;
}

export const ConsultancyRequestForm: React.FC<ConsultancyRequestFormProps> = ({
  initialCategoryId,
  initialSubServiceId,
  onCancel,
  onViewStatus,
  onContactSupport,
}) => {
  const formUid = useId();

  // 1. Client Details
  const [clientName, setClientName] = useState('');
  const [clientMobile, setClientMobile] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [clientState, setClientState] = useState('Karnataka');

  // 2. Business Details
  const [businessType, setBusinessType] = useState<'New Business' | 'Existing Business'>('New Business');
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('Technology & Software');
  const [businessActivity, setBusinessActivity] = useState('');
  const [businessStage, setBusinessStage] = useState<BusinessStage>('Early Stage');
  const [currentTurnover, setCurrentTurnover] = useState<TurnoverRange>('Pre-revenue');
  const [approximateInvestment, setApproximateInvestment] = useState<number>(1000000);

  // 3. Consultancy Requirement
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(() => {
    return initialCategoryId || CONSULTANCY_CATEGORIES[0].id;
  });
  const [selectedSubServiceId, setSelectedSubServiceId] = useState<string>(() => {
    if (initialSubServiceId) return initialSubServiceId;
    const cat = CONSULTANCY_CATEGORIES.find(c => c.id === (initialCategoryId || CONSULTANCY_CATEGORIES[0].id));
    return cat ? cat.subServices[0].id : CONSULTANCY_CATEGORIES[0].subServices[0].id;
  });
  const [description, setDescription] = useState('');
  const [mainBusinessGoal, setMainBusinessGoal] = useState('');
  const [fundingRequired, setFundingRequired] = useState(false);
  const [approximateFundingAmount, setApproximateFundingAmount] = useState<number>(2500000);
  const [expectedTimeline, setExpectedTimeline] = useState('1-2 Weeks');

  // 4. Document Uploads
  const [documents, setDocuments] = useState<ConsultancyDocument[]>([]);

  // 5. Consultation Preference
  const [preference, setPreference] = useState<ConsultationPreference>('Video Meeting');

  // 6. Additional Information
  const [additionalNotes, setAdditionalNotes] = useState('');

  // 7. Declaration
  const [declarationConfirmed, setDeclarationConfirmed] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const [declarationDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submittedRecord, setSubmittedRecord] = useState<ConsultancyRecord | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Active Category & Sub-services
  const activeCategory = CONSULTANCY_CATEGORIES.find(c => c.id === selectedCategoryId) || CONSULTANCY_CATEGORIES[0];
  const activeSubService = activeCategory.subServices.find(s => s.id === selectedSubServiceId) || activeCategory.subServices[0];

  // Update sub-service when category changes if needed
  useEffect(() => {
    const valid = activeCategory.subServices.some(s => s.id === selectedSubServiceId);
    if (!valid && activeCategory.subServices.length > 0) {
      setSelectedSubServiceId(activeCategory.subServices[0].id);
    }
  }, [selectedCategoryId, activeCategory, selectedSubServiceId]);

  // Sync signature name with client name
  useEffect(() => {
    if (!signatureName && clientName) {
      setSignatureName(clientName);
    }
  }, [clientName, signatureName]);

  // Document management
  const availableDocTypes = [
    'PAN Card',
    'Aadhaar Card',
    'Existing Registration Certificate',
    'GST Certificate',
    'Bank Statement',
    'Financial Statements',
    'Project Report / Pitch Deck',
    'Other Document',
  ];

  const handleFileUpload = (docType: string, file: File) => {
    const formattedSize = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    const newDoc: ConsultancyDocument = {
      id: `doc-con-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      docType,
      title: docType,
      fileName: file.name,
      fileSizeFormatted: formattedSize,
      uploadDate: new Date().toISOString().split('T')[0],
      fileType: file.type || 'application/pdf',
      status: 'uploaded',
    };

    setDocuments(prev => [...prev.filter(d => d.docType !== docType), newDoc]);
  };

  const handleRemoveDoc = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  // Helper to auto-attach sample documents for 1-click test
  const handleAutoAttachSampleDocs = () => {
    const sampleDocs: ConsultancyDocument[] = [
      {
        id: `sample-doc-1`,
        docType: 'PAN Card',
        title: 'Applicant PAN Card',
        fileName: `PAN_${clientName ? clientName.replace(/\s+/g, '_') : 'Applicant'}.pdf`,
        fileSizeFormatted: '1.1 MB',
        uploadDate: new Date().toISOString().split('T')[0],
        fileType: 'application/pdf',
        status: 'uploaded',
      },
      {
        id: `sample-doc-2`,
        docType: 'GST Certificate',
        title: 'GST Registration Certificate',
        fileName: `${businessName ? businessName.replace(/\s+/g, '_') : 'Enterprise'}_GST.pdf`,
        fileSizeFormatted: '1.4 MB',
        uploadDate: new Date().toISOString().split('T')[0],
        fileType: 'application/pdf',
        status: 'uploaded',
      },
      {
        id: `sample-doc-3`,
        docType: 'Project Report / Pitch Deck',
        title: 'Project DPR / Pitch Presentation',
        fileName: 'Project_Summary_Presentation.pdf',
        fileSizeFormatted: '3.2 MB',
        uploadDate: new Date().toISOString().split('T')[0],
        fileType: 'application/pdf',
        status: 'uploaded',
      },
    ];
    setDocuments(sampleDocs);
  };

  // Pre-fill demo data
  const handlePrefillDemoData = () => {
    setClientName('Rajiv Chandrasekhar Rao');
    setClientMobile('9845088990');
    setClientEmail('rajiv.rao@zenithagritech.com');
    setClientCity('Bangalore');
    setClientState('Karnataka');

    setBusinessType('New Business');
    setBusinessName('Zenith AgriTech Solutions Private Limited');
    setIndustry('Agriculture & Food Processing');
    setBusinessActivity('IoT-driven automated micro-irrigation systems and precision fertilizer dosing for commercial farms.');
    setBusinessStage('Early Stage');
    setCurrentTurnover('< ₹25 Lakhs');
    setApproximateInvestment(3000000);

    setSelectedCategoryId('funding_schemes');
    setSelectedSubServiceId('startup_india');
    setDescription('Seeking DPIIT Startup India certification, Section 80-IAC tax exemption vetting, and guidance on NABARD agri-tech innovation grant schemes.');
    setMainBusinessGoal('Secure DPIIT recognition to access venture capital tax exemptions and apply for state innovation seed fund grants.');
    setFundingRequired(true);
    setApproximateFundingAmount(5000000);
    setExpectedTimeline('1-2 Weeks');

    handleAutoAttachSampleDocs();

    setPreference('Video Meeting');
    setAdditionalNotes('Prefer initial strategy discussion over Google Meet with a senior agritech / DPIIT compliance advisor.');

    setDeclarationConfirmed(true);
    setSignatureName('Rajiv Chandrasekhar Rao');
    setFieldErrors({});
    setSubmitError(null);
  };

  // Reset form
  const handleReset = () => {
    if (confirm('Reset consultancy request form entries?')) {
      setClientName('');
      setClientMobile('');
      setClientEmail('');
      setClientCity('');
      setBusinessName('');
      setBusinessActivity('');
      setDescription('');
      setMainBusinessGoal('');
      setDocuments([]);
      setDeclarationConfirmed(false);
      setSignatureName('');
      setFieldErrors({});
      setSubmitError(null);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};

    if (!clientName.trim()) errors.clientName = 'Full Name is required';
    if (!clientMobile || clientMobile.replace(/\D/g, '').length < 10) {
      errors.clientMobile = 'Enter a valid 10-digit mobile number';
    }
    if (!clientEmail || !/^\S+@\S+\.\S+$/.test(clientEmail)) {
      errors.clientEmail = 'Enter a valid email address';
    }
    if (!clientCity.trim()) errors.clientCity = 'City is required';
    if (!businessName.trim()) errors.businessName = 'Business Name is required';
    if (!businessActivity.trim()) errors.businessActivity = 'Business Activity is required';
    if (!description.trim() || description.length < 20) {
      errors.description = 'Requirement description must be at least 20 characters';
    }
    if (!declarationConfirmed) {
      errors.declaration = 'You must confirm the statutory declaration';
    }
    if (!signatureName.trim()) {
      errors.signatureName = 'Digital / typed signature is required';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSubmitError(`Please complete all highlighted mandatory fields (${Object.keys(errors).length} issues).`);
      window.scrollTo({ top: 350, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitConsultancyRequest({
        client: {
          fullName: clientName,
          mobile: clientMobile.replace(/\D/g, '').slice(0, 10),
          email: clientEmail.trim(),
          city: clientCity.trim(),
          state: clientState,
        },
        business: {
          businessType,
          businessName: businessName.trim(),
          industry,
          businessActivity: businessActivity.trim(),
          businessStage,
          currentTurnover,
          approximateInvestment: Number(approximateInvestment),
        },
        requirement: {
          categoryId: activeCategory.id,
          categoryName: activeCategory.name,
          subServiceId: activeSubService.id,
          subServiceName: activeSubService.name,
          description: description.trim(),
          mainBusinessGoal: mainBusinessGoal.trim(),
          fundingRequired,
          approximateFundingAmount: fundingRequired ? Number(approximateFundingAmount) : undefined,
          expectedTimeline,
        },
        documents,
        preference,
        additionalNotes: additionalNotes.trim(),
        declaration: {
          confirmed: true,
          clientName,
          date: declarationDate,
          digitalSignature: signatureName.trim(),
        },
      });

      if (res.success && res.record) {
        setSubmittedRecord(res.record);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setSubmitError(res.error || 'Failed to submit consultancy request.');
      }
    } catch (err: any) {
      setSubmitError(err?.message || 'A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Download Receipt helper
  const handleDownloadReceipt = () => {
    if (!submittedRecord) return;
    const content = `=====================================================
NAGU ENTERPRISES – CONSULTANCY SERVICES DESK
CONSULTANCY REQUEST ACKNOWLEDGEMENT
=====================================================

Application ID:     ${submittedRecord.id}
Submission Date:    ${new Date(submittedRecord.createdAt).toLocaleString('en-IN')}
Status:             ${submittedRecord.status}
Service Category:   ${submittedRecord.requirement.categoryName}
Consultancy Offer:  ${submittedRecord.requirement.subServiceName}

CLIENT DETAILS:
-----------------------------------------------------
Client Full Name:   ${submittedRecord.client.fullName}
Contact Number:     +91 ${submittedRecord.client.mobile}
Email Address:      ${submittedRecord.client.email}
Location:           ${submittedRecord.client.city}, ${submittedRecord.client.state}

BUSINESS PROFILE:
-----------------------------------------------------
Business Name:      ${submittedRecord.business.businessName} (${submittedRecord.business.businessType})
Industry:           ${submittedRecord.business.industry}
Business Stage:     ${submittedRecord.business.businessStage}
Current Turnover:   ${submittedRecord.business.currentTurnover}
Core Activity:      ${submittedRecord.business.businessActivity}

CONSULTANCY REQUIREMENT:
-----------------------------------------------------
Main Objective:     ${submittedRecord.requirement.mainBusinessGoal}
Description:        ${submittedRecord.requirement.description}
Funding Required:   ${submittedRecord.requirement.fundingRequired ? `YES (Approx ₹${submittedRecord.requirement.approximateFundingAmount?.toLocaleString('en-IN')})` : 'NO'}
Expected Timeline:  ${submittedRecord.requirement.expectedTimeline}
Meeting Preference: ${submittedRecord.preference}

DOCUMENTS ATTACHED:
-----------------------------------------------------
${submittedRecord.documents.length === 0 ? 'No documents attached during intake.' : submittedRecord.documents.map((d, i) => `${i + 1}. ${d.docType} (${d.fileName} - ${d.fileSizeFormatted})`).join('\n')}

NEXT STEPS:
-----------------------------------------------------
1. Preliminary scope evaluation by Senior Advisory Desk.
2. Consultant allocation and formal fee quotation / proposal.
3. Strategy session via ${submittedRecord.preference}.

NAGU ENTERPRISES
Business Registration & Compliance Services
Helpline: +91 98450 12345 | naguenterprises84@gmail.com
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Nagu_Enterprises_${submittedRecord.id}_Consultancy_Receipt.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // If submitted successfully, render confirmation screen
  if (submittedRecord) {
    return (
      <div className="max-w-3xl mx-auto py-8 space-y-8 animate-in fade-in">
        
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Nagu Enterprises Advisory Desk
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              CONSULTANCY REQUEST SUBMITTED SUCCESSFULLY
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Your strategic advisory request has been logged. Our senior corporate consulting team is reviewing your requirements.
            </p>
          </div>

          {/* Application ID Highlight Card */}
          <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-blue-300 p-6 space-y-3 max-w-md mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Consultancy Application ID
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl sm:text-3xl font-mono font-black text-blue-700 tracking-wider">
                {submittedRecord.id}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(submittedRecord.id);
                  setCopiedId(true);
                  setTimeout(() => setCopiedId(false), 2000);
                }}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-xs"
                title="Copy Application ID"
              >
                {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <span>Status:</span>
              <span className="font-bold text-blue-700 px-2 py-0.5 rounded bg-blue-100">
                {submittedRecord.status}
              </span>
            </div>
          </div>

          {/* Key Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-xl mx-auto text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 block font-medium">Selected Service</span>
              <strong className="text-slate-800 text-[13px]">{submittedRecord.requirement.subServiceName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Submission Date</span>
              <strong className="text-slate-800 text-[13px]">{new Date(submittedRecord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Preference</span>
              <strong className="text-slate-800 text-[13px]">{submittedRecord.preference}</strong>
            </div>
          </div>

          {/* Next Steps */}
          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 text-left text-xs space-y-2 max-w-xl mx-auto">
            <h4 className="font-bold text-blue-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-700" />
              Next Steps for your Engagement:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-700 pl-1">
              <li>Our practice head will review your business profile and project scope.</li>
              <li>A dedicated consultant will be assigned and reach out via {submittedRecord.preference}.</li>
              <li>You will receive a formal quotation, scope document, and timeline roadmap.</li>
            </ol>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onViewStatus(submittedRecord.id)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Track in Client Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleDownloadReceipt}
              className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Download Acknowledgement Receipt</span>
            </button>
          </div>

          {/* Helpline Footer */}
          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
            Need urgent assistance? Contact Nagu Enterprises directly at{' '}
            <strong className="text-slate-800">+91 98450 12345</strong> or{' '}
            <strong className="text-slate-800">naguenterprises84@gmail.com</strong>
          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      
      {/* ===================================================================
          OFFICIAL FORM HEADER
          =================================================================== */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-md overflow-hidden">
        <div className="h-2.5 bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600" />
        
        <div className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
            
            {/* Left Brand Area */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-md shrink-0">
                <Building2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-display">
                    NAGU ENTERPRISES
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                    <ShieldCheck className="w-3.5 h-3.5" /> Corporate Advisory Desk
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-700">
                  Business Registration • Consultancy • Tax & Compliance Services
                </p>
                <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-600 pt-1 font-medium">
                  <span>Startup Consulting</span>
                  <span className="text-slate-300">|</span>
                  <span>Funding & DPIIT</span>
                  <span className="text-slate-300">|</span>
                  <span>DPR / Project Reports</span>
                  <span className="text-slate-300">|</span>
                  <span>ROC Compliance</span>
                  <span className="text-slate-300">|</span>
                  <span>Trademark & Legal</span>
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
                FORM NE-CON-2026 / ONLINE INTAKE
              </div>
            </div>

          </div>

          {/* Quick Helper Ribbon */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Official Strategic Intake Form • SSL Protected • Confidential Advisory</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrefillDemoData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors shadow-xs cursor-pointer"
                title="Fill with realistic sample data to test instantly"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Pre-fill Demo Data (1-Click Test)
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Top Error Alert */}
      {submitError && (
        <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl text-red-900 text-sm flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">{submitError}</p>
            <p className="text-xs text-red-700">
              Please scroll through the sections below and complete the highlighted mandatory fields.
            </p>
          </div>
        </div>
      )}

      {/* ===================================================================
          TWO-COLUMN RESPONSIVE LAYOUT
          LEFT: 7 Form Sections | RIGHT: Sticky Summary & Fast Submission
          =================================================================== */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main 7 Sections (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">

          {/* -------------------------------------------------------------
              SECTION 1: CLIENT DETAILS
              ------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  1
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    SECTION 1 – CLIENT DETAILS
                  </h3>
                  <p className="text-xs text-slate-500">
                    Contact information of the primary authorized representative
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div className="space-y-1">
                  <label htmlFor={`${formUid}-clientName`} className="block text-xs font-bold text-slate-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`${formUid}-clientName`}
                    type="text"
                    required
                    placeholder="e.g. Rajiv Chandrasekhar Rao"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                      fieldErrors.clientName ? 'border-red-400 ring-2 ring-red-200' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {fieldErrors.clientName && <p className="text-[11px] text-red-600">{fieldErrors.clientName}</p>}
                </div>

                {/* Mobile */}
                <div className="space-y-1">
                  <label htmlFor={`${formUid}-clientMobile`} className="block text-xs font-bold text-slate-700">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-medium">+91</span>
                    <input
                      id={`${formUid}-clientMobile`}
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="9845012345"
                      value={clientMobile}
                      onChange={(e) => setClientMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className={`w-full text-xs sm:text-sm pl-11 pr-3.5 py-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                        fieldErrors.clientMobile ? 'border-red-400 ring-2 ring-red-200' : 'border-slate-300 focus:ring-blue-500'
                      }`}
                    />
                  </div>
                  {fieldErrors.clientMobile && <p className="text-[11px] text-red-600">{fieldErrors.clientMobile}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label htmlFor={`${formUid}-clientEmail`} className="block text-xs font-bold text-slate-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`${formUid}-clientEmail`}
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                      fieldErrors.clientEmail ? 'border-red-400 ring-2 ring-red-200' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {fieldErrors.clientEmail && <p className="text-[11px] text-red-600">{fieldErrors.clientEmail}</p>}
                </div>

                {/* City & State */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label htmlFor={`${formUid}-clientCity`} className="block text-xs font-bold text-slate-700">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`${formUid}-clientCity`}
                      type="text"
                      required
                      placeholder="e.g. Bangalore"
                      value={clientCity}
                      onChange={(e) => setClientCity(e.target.value)}
                      className={`w-full text-xs px-3 py-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                        fieldErrors.clientCity ? 'border-red-400 ring-2 ring-red-200' : 'border-slate-300 focus:ring-blue-500'
                      }`}
                    />
                    {fieldErrors.clientCity && <p className="text-[11px] text-red-600">{fieldErrors.clientCity}</p>}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor={`${formUid}-clientState`} className="block text-xs font-bold text-slate-700">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      id={`${formUid}-clientState`}
                      value={clientState}
                      onChange={(e) => setClientState(e.target.value)}
                      className="w-full text-xs px-2 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------
              SECTION 2: BUSINESS DETAILS
              ------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  2
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    SECTION 2 – BUSINESS DETAILS
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enterprise classification, current operational phase, and financials
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              
              {/* New Business / Existing Business Toggle */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Business Status <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  {(['New Business', 'Existing Business'] as const).map((bt) => (
                    <label
                      key={bt}
                      className={`cursor-pointer p-3 rounded-xl border-2 flex items-center gap-2 transition-all ${
                        businessType === bt
                          ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="bizType"
                        value={bt}
                        checked={businessType === bt}
                        onChange={() => setBusinessType(bt)}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-xs font-bold">{bt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Business Name */}
                <div className="space-y-1">
                  <label htmlFor={`${formUid}-businessName`} className="block text-xs font-bold text-slate-700">
                    Business / Venture Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`${formUid}-businessName`}
                    type="text"
                    required
                    placeholder="e.g. Zenith AgriTech Solutions"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                      fieldErrors.businessName ? 'border-red-400 ring-2 ring-red-200' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {fieldErrors.businessName && <p className="text-[11px] text-red-600">{fieldErrors.businessName}</p>}
                </div>

                {/* Industry */}
                <div className="space-y-1">
                  <label htmlFor={`${formUid}-industry`} className="block text-xs font-bold text-slate-700">
                    Industry Sector <span className="text-red-500">*</span>
                  </label>
                  <select
                    id={`${formUid}-industry`}
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Technology & Software">Technology & Software / IT</option>
                    <option value="Agriculture & Food Processing">Agriculture & Food Processing</option>
                    <option value="Manufacturing & Heavy Engineering">Manufacturing & Heavy Engineering</option>
                    <option value="Healthcare, Pharma & Biotech">Healthcare, Pharma & Biotech</option>
                    <option value="Solar & Renewable Energy">Solar & Renewable Energy</option>
                    <option value="Retail, Trading & E-Commerce">Retail, Trading & E-Commerce</option>
                    <option value="Financial Services & FinTech">Financial Services & FinTech</option>
                    <option value="Education & EdTech">Education & EdTech</option>
                    <option value="Real Estate & Construction">Real Estate & Construction</option>
                    <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                    <option value="Other Industry">Other Industry</option>
                  </select>
                </div>

                {/* Business Stage */}
                <div className="space-y-1">
                  <label htmlFor={`${formUid}-businessStage`} className="block text-xs font-bold text-slate-700">
                    Current Business Stage <span className="text-red-500">*</span>
                  </label>
                  <select
                    id={`${formUid}-businessStage`}
                    value={businessStage}
                    onChange={(e) => setBusinessStage(e.target.value as BusinessStage)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Ideation / Concept">Ideation / Concept Stage</option>
                    <option value="Early Stage">Early Stage (Product Development)</option>
                    <option value="Operational">Operational / Generating Revenue</option>
                    <option value="Growth / Expansion">Growth / Scaling & Expansion</option>
                  </select>
                </div>

                {/* Current Turnover */}
                <div className="space-y-1">
                  <label htmlFor={`${formUid}-currentTurnover`} className="block text-xs font-bold text-slate-700">
                    Current Annual Turnover <span className="text-red-500">*</span>
                  </label>
                  <select
                    id={`${formUid}-currentTurnover`}
                    value={currentTurnover}
                    onChange={(e) => setCurrentTurnover(e.target.value as TurnoverRange)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Pre-revenue">Pre-revenue / Starting</option>
                    <option value="< ₹25 Lakhs">&lt; ₹25 Lakhs</option>
                    <option value="₹25 Lakhs - ₹1 Crore">₹25 Lakhs - ₹1 Crore</option>
                    <option value="₹1 Crore - ₹5 Crores">₹1 Crore - ₹5 Crores</option>
                    <option value="> ₹5 Crores">&gt; ₹5 Crores</option>
                  </select>
                </div>

              </div>

              {/* Core Business Activity */}
              <div className="space-y-1">
                <label htmlFor={`${formUid}-businessActivity`} className="block text-xs font-bold text-slate-700">
                  Business Activity Summary <span className="text-red-500">*</span>
                </label>
                <input
                  id={`${formUid}-businessActivity`}
                  type="text"
                  required
                  placeholder="e.g. Manufacturing automated micro-irrigation hardware and SaaS control systems"
                  value={businessActivity}
                  onChange={(e) => setBusinessActivity(e.target.value)}
                  className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                    fieldErrors.businessActivity ? 'border-red-400 ring-2 ring-red-200' : 'border-slate-300 focus:ring-blue-500'
                  }`}
                />
                {fieldErrors.businessActivity && <p className="text-[11px] text-red-600">{fieldErrors.businessActivity}</p>}
              </div>

              {/* Approximate Investment */}
              <div className="space-y-1 max-w-sm">
                <label htmlFor={`${formUid}-approximateInvestment`} className="block text-xs font-bold text-slate-700">
                  Approximate Investment Committed (₹)
                </label>
                <input
                  id={`${formUid}-approximateInvestment`}
                  type="number"
                  step={50000}
                  value={approximateInvestment}
                  onChange={(e) => setApproximateInvestment(Number(e.target.value))}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>
          </div>

          {/* -------------------------------------------------------------
              SECTION 3: CONSULTANCY REQUIREMENT
              ------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  3
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    SECTION 3 – CONSULTANCY REQUIREMENT
                  </h3>
                  <p className="text-xs text-slate-500">
                    Specify service category, deliverables, objectives, and funding criteria
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Select Consultancy Category */}
                <div className="space-y-1">
                  <label htmlFor={`${formUid}-selectedCategoryId`} className="block text-xs font-bold text-slate-700">
                    Select Consultancy Domain <span className="text-red-500">*</span>
                  </label>
                  <select
                    id={`${formUid}-selectedCategoryId`}
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CONSULTANCY_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Select Sub-Service */}
                <div className="space-y-1">
                  <label htmlFor={`${formUid}-selectedSubServiceId`} className="block text-xs font-bold text-slate-700">
                    Select Specific Sub-Service <span className="text-red-500">*</span>
                  </label>
                  <select
                    id={`${formUid}-selectedSubServiceId`}
                    value={selectedSubServiceId}
                    onChange={(e) => setSelectedSubServiceId(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {activeCategory.subServices.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Requirement Description */}
              <div className="space-y-1">
                <label htmlFor={`${formUid}-description`} className="block text-xs font-bold text-slate-700">
                  Detailed Requirement Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id={`${formUid}-description`}
                  required
                  rows={3}
                  placeholder="Elaborate on your expectations, challenges, target goals, or statutory deliverables required (minimum 20 characters)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                    fieldErrors.description ? 'border-red-400 ring-2 ring-red-200' : 'border-slate-300 focus:ring-blue-500'
                  }`}
                />
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>Minimum 20 characters required</span>
                  <span>{description.length} characters</span>
                </div>
                {fieldErrors.description && <p className="text-[11px] text-red-600">{fieldErrors.description}</p>}
              </div>

              {/* Main Business Goal */}
              <div className="space-y-1">
                <label htmlFor={`${formUid}-mainBusinessGoal`} className="block text-xs font-bold text-slate-700">
                  Primary Business Objective
                </label>
                <input
                  id={`${formUid}-mainBusinessGoal`}
                  type="text"
                  placeholder="e.g. Obtain DPIIT certificate and apply for government subsidy grants"
                  value={mainBusinessGoal}
                  onChange={(e) => setMainBusinessGoal(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Funding Required & Amount */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor={`${formUid}-fundingRequired`} className="text-xs font-bold text-slate-900 block cursor-pointer">
                      Is Bank Loan / Government Subsidy / Investor Funding Required?
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Our advisors prepare bankable DPR reports, CMA data, and pitch decks.
                    </span>
                  </div>
                  <input
                    id={`${formUid}-fundingRequired`}
                    type="checkbox"
                    checked={fundingRequired}
                    onChange={(e) => setFundingRequired(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                </div>

                {fundingRequired && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                    <div className="space-y-1">
                      <label htmlFor={`${formUid}-approximateFundingAmount`} className="block text-xs font-bold text-slate-700">
                        Approximate Funding Amount Required (₹)
                      </label>
                      <input
                        id={`${formUid}-approximateFundingAmount`}
                        type="number"
                        step={100000}
                        value={approximateFundingAmount}
                        onChange={(e) => setApproximateFundingAmount(Number(e.target.value))}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor={`${formUid}-expectedTimeline`} className="block text-xs font-bold text-slate-700">
                        Expected Execution Timeline
                      </label>
                      <select
                        id={`${formUid}-expectedTimeline`}
                        value={expectedTimeline}
                        onChange={(e) => setExpectedTimeline(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Immediate (< 7 Days)">Immediate (&lt; 7 Days)</option>
                        <option value="1-2 Weeks">1 - 2 Weeks</option>
                        <option value="1 Month">1 Month</option>
                        <option value="1-3 Months">1 - 3 Months</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* -------------------------------------------------------------
              SECTION 4: DOCUMENT UPLOAD
              ------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  4
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    SECTION 4 – DOCUMENT UPLOAD
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upload relevant identity, financial, or registration files (Optional at initial intake)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAutoAttachSampleDocs}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
                title="Attach sample files to quickly test request submission"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Auto-Attach Sample Docs
              </button>
            </div>

            <div className="p-6 space-y-4">
              
              <p className="text-xs text-slate-600">
                You may attach documents relevant to your consultation domain (PAN, Aadhaar, existing registration certificates, GST certificate, bank statements, or project pitch decks).
              </p>

              {/* Upload Pickers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableDocTypes.map((docType) => {
                  const uploaded = documents.find(d => d.docType === docType);

                  return (
                    <div
                      key={docType}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                        uploaded 
                          ? 'border-emerald-300 bg-emerald-50/40' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-0.5 overflow-hidden">
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {docType}
                        </span>
                        {uploaded ? (
                          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-mono">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{uploaded.fileName}</span>
                            <span className="text-slate-400 shrink-0">({uploaded.fileSizeFormatted})</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">PDF, JPG, PNG up to 10MB</span>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        {uploaded ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveDoc(uploaded.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Remove file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <label className="cursor-pointer px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center gap-1">
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleFileUpload(docType, e.target.files[0]);
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

              {documents.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                  <span><strong>{documents.length}</strong> document(s) attached to this consultancy docket.</span>
                  <button
                    type="button"
                    onClick={() => setDocuments([])}
                    className="text-red-600 hover:underline text-[11px]"
                  >
                    Clear all documents
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* -------------------------------------------------------------
              SECTION 5: CONSULTATION PREFERENCE
              ------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  5
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    SECTION 5 – CONSULTATION PREFERENCE
                  </h3>
                  <p className="text-xs text-slate-500">
                    Choose how you would like our advisory team to connect with you
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { id: 'Phone Call', icon: Phone, label: 'Phone Call', desc: 'Direct telephonic discussion' },
                  { id: 'WhatsApp', icon: MessageSquare, label: 'WhatsApp', desc: 'Chat & instant voice note update' },
                  { id: 'Video Meeting', icon: Video, label: 'Video Meeting', desc: 'Google Meet / Zoom screen share' },
                  { id: 'Direct Office Meeting', icon: Building2, label: 'Direct Office Meeting', desc: 'In-person at Bangalore HQ' },
                ].map((pref) => {
                  const Icon = pref.icon;
                  const isSelected = preference === pref.id;

                  return (
                    <label
                      key={pref.id}
                      className={`cursor-pointer p-3.5 rounded-xl border-2 flex flex-col justify-between transition-all ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold ring-2 ring-blue-500/20' 
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                          <input
                            type="radio"
                            name="pref"
                            value={pref.id}
                            checked={isSelected}
                            onChange={() => setPreference(pref.id as ConsultationPreference)}
                            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                          />
                        </div>
                        <span className="text-xs font-bold block pt-1">{pref.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-2 block">
                        {pref.desc}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------
              SECTION 6: ADDITIONAL INFORMATION
              ------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  6
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    SECTION 6 – ADDITIONAL INFORMATION
                  </h3>
                  <p className="text-xs text-slate-500">
                    Special notes, urgent deadlines, or specific consultant preferences
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <textarea
                rows={3}
                placeholder="Share any special instructions, convenient calling timings, or specific questions..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* -------------------------------------------------------------
              SECTION 7: DECLARATION
              ------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  7
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    SECTION 7 – DECLARATION & AUTHORIZATION
                  </h3>
                  <p className="text-xs text-slate-500">
                    Client confirmation and engagement authorization
                  </p>
                </div>
              </div>
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            </div>

            <div className="p-6 space-y-4">
              
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-800 leading-relaxed">
                  <input
                    type="checkbox"
                    checked={declarationConfirmed}
                    onChange={(e) => setDeclarationConfirmed(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span>
                    <strong>Statutory Confirmation:</strong> I hereby declare that the particulars provided in this request are true and accurate. I authorize <strong>Nagu Enterprises</strong> to review my business requirements, contact me regarding advisory services, and treat all project data with strict non-disclosure confidentiality.
                  </span>
                </label>
                {fieldErrors.declaration && (
                  <p className="text-xs text-red-600 font-bold pt-1">{fieldErrors.declaration}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                <div className="space-y-1">
                  <label htmlFor={`${formUid}-declarationClientName`} className="block text-xs font-bold text-slate-700">
                    Client Name
                  </label>
                  <input
                    id={`${formUid}-declarationClientName`}
                    type="text"
                    readOnly
                    value={clientName || 'Applicant Name'}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-600"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor={`${formUid}-signatureName`} className="block text-xs font-bold text-slate-700">
                    Digital / Typed Signature <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`${formUid}-signatureName`}
                    type="text"
                    required
                    placeholder="Type your full legal name"
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    className={`w-full text-xs sm:text-sm font-semibold px-3.5 py-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                      fieldErrors.signatureName ? 'border-red-400 ring-2 ring-red-200' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {fieldErrors.signatureName && <p className="text-[11px] text-red-600">{fieldErrors.signatureName}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor={`${formUid}-declarationDate`} className="block text-xs font-bold text-slate-700">
                    Date
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

          {/* Bottom Primary Submit Section */}
          <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white font-display">
                Ready to submit your consultancy docket?
              </h4>
              <p className="text-xs text-slate-300">
                A permanent reference ID in format <strong>NE-CON-YYYY-XXXX</strong> will be generated.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
              >
                Back to Services
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Consultancy Request
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Sidebar Summary (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          
          <div className="bg-white rounded-2xl border-2 border-blue-600 shadow-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                Consultancy Docket Summary
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {activeCategory.name}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Service:</span>
                <span className="font-bold text-slate-900 text-right">{activeSubService.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Enterprise:</span>
                <span className="font-medium text-slate-800 text-right">{businessName || 'To be specified'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Stage:</span>
                <span className="font-medium text-slate-800">{businessStage}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Mode:</span>
                <span className="font-semibold text-blue-700">{preference}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Documents Attached:</span>
                <span className="font-semibold text-slate-700">{documents.length} File(s)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Initial Status:</span>
                <span className="font-bold text-emerald-700">New (Review Queue)</span>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Consultancy Request
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrefillDemoData}
                className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Pre-fill Sample Data
              </button>
            </div>

            {/* Advisory Guarantee Box */}
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-[11px] text-blue-900 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                Nagu Enterprises Commitment
              </div>
              <p className="text-blue-800 text-[10.5px]">
                Transparent statutory quotation shared post scope analysis. Zero surprise charges.
              </p>
            </div>

          </div>

        </div>

      </form>

    </div>
  );
};
