import { ConsultancyCategoryDef } from '../types/consultancy';

export const CONSULTANCY_CATEGORIES: ConsultancyCategoryDef[] = [
  // 1. BUSINESS & STARTUP CONSULTANCY
  {
    id: 'business_startup',
    name: 'Business & Startup Consultancy',
    shortDescription: 'From initial ideation and market validation to structural formulation and complete business plan execution.',
    iconName: 'Rocket',
    subServices: [
      {
        id: 'biz_idea',
        name: 'Business Idea Consultation',
        description: 'Comprehensive viability assessment, concept validation, and feasibility roadmap designed with seasoned advisors.',
        popular: true,
        estimatedTimeline: '2 - 3 Days',
      },
      {
        id: 'biz_structure',
        name: 'Business Structure Selection',
        description: 'Strategic analysis to choose between Pvt Ltd, LLP, OPC, or Partnership based on taxation, liability, and investment goals.',
        estimatedTimeline: '1 - 2 Days',
      },
      {
        id: 'biz_plan',
        name: 'Business Plan',
        description: 'Executive-ready operational, managerial, and expansion business blueprint tailored for partners and financial institutions.',
        popular: true,
        estimatedTimeline: '5 - 7 Days',
      },
      {
        id: 'dpr_project_report',
        name: 'Project Report / DPR',
        description: 'Detailed Project Report (DPR) adhering to bank lending criteria, technical parameters, and economic benchmarks.',
        popular: true,
        estimatedTimeline: '5 - 8 Days',
      },
      {
        id: 'startup_consulting',
        name: 'Startup Consulting',
        description: 'End-to-end strategic mentorship covering entity setup, operational infrastructure, equity vesting, and compliance hygiene.',
        estimatedTimeline: 'Ongoing / Advisory',
      },
      {
        id: 'biz_model',
        name: 'Business Model Development',
        description: 'Monetization frameworks, unit economics refinement, value proposition mapping, and scalable distribution architectures.',
        estimatedTimeline: '3 - 5 Days',
      },
      {
        id: 'market_research',
        name: 'Market Research',
        description: 'Competitive landscape profiling, customer segmentation, market sizing (TAM/SAM/SOM), and pricing elasticity analysis.',
        estimatedTimeline: '5 - 7 Days',
      },
      {
        id: 'financial_projection',
        name: 'Financial Projection',
        description: '3-to-5 year granular P&L, balance sheet, cash flow forecasting, break-even analysis, and sensitivity scenario modeling.',
        popular: true,
        estimatedTimeline: '4 - 6 Days',
      },
    ],
  },

  // 2. FUNDING & GOVERNMENT SCHEMES
  {
    id: 'funding_schemes',
    name: 'Funding & Government Schemes',
    shortDescription: 'Unlock central & state subsidies, Startup India recognitions, bank loan schemes, and investor-grade documentation.',
    iconName: 'Landmark',
    subServices: [
      {
        id: 'startup_india',
        name: 'Startup India / DPIIT',
        description: 'DPIIT statutory recognition, Section 80-IAC 3-year tax exemption eligibility, and self-certification compliance benefits.',
        popular: true,
        hasApplyNow: true,
        estimatedTimeline: '5 - 10 Days',
      },
      {
        id: 'msme_udyam',
        name: 'MSME / Udyam',
        description: 'Priority sector lending eligibility, collateral-free credit access, delayed payment protection, and statutory subsidies.',
        popular: true,
        hasApplyNow: true,
        estimatedTimeline: '1 - 2 Days',
      },
      {
        id: 'govt_schemes',
        name: 'Government Scheme Guidance',
        description: 'Navigating PMEGP, Stand-Up India, Mudra loans, state industrial policies, and capital investment subsidy schemes.',
        estimatedTimeline: '3 - 5 Days',
      },
      {
        id: 'subsidy_assistance',
        name: 'Subsidy Assistance',
        description: 'End-to-end documentation and submission support for interest subvention, electricity duty concessions, and capital subsidies.',
        estimatedTimeline: '7 - 14 Days',
      },
      {
        id: 'bank_loan_doc',
        name: 'Bank Loan Documentation',
        description: 'Preparation of CMA data reports, debt-service coverage ratio (DSCR) calculations, and collateral documentation for commercial banks.',
        popular: true,
        estimatedTimeline: '4 - 7 Days',
      },
      {
        id: 'project_funding',
        name: 'Project Funding Support',
        description: 'Advisory and documentation for machinery term loans, working capital limits (CC/OD), and infrastructure financing.',
        estimatedTimeline: '7 - 15 Days',
      },
      {
        id: 'investor_documentation',
        name: 'Investor / Funding Documentation',
        description: 'Term sheets, Shareholders Agreements (SHA), Share Subscription Agreements (SSA), and cap table management.',
        estimatedTimeline: '5 - 10 Days',
      },
      {
        id: 'pitch_deck',
        name: 'Pitch Deck Preparation',
        description: 'High-impact 12-15 slide investor decks presenting problem, solution, traction, market opportunity, and funding ask.',
        popular: true,
        estimatedTimeline: '4 - 6 Days',
      },
    ],
  },

  // 3. REGISTRATION & LICENSING
  {
    id: 'registration_licensing',
    name: 'Registration & Licensing',
    shortDescription: 'All-inclusive business registrations, statutory central approvals, import-export licenses, and food permits.',
    iconName: 'Building2',
    subServices: [
      {
        id: 'pvt_ltd_service',
        name: 'Private Limited Company',
        description: 'Corporate incorporation with MCA, SPICe+ filing, DIN, DSC, PAN, TAN, and Certificate of Incorporation.',
        popular: true,
        hasApplyNow: true,
        estimatedTimeline: '7 - 10 Days',
      },
      {
        id: 'opc_service',
        name: 'OPC (One Person Company)',
        description: 'Corporate identity for solo entrepreneurs with limited liability protection and statutory nominee documentation.',
        popular: true,
        hasApplyNow: true,
        estimatedTimeline: '7 - 10 Days',
      },
      {
        id: 'llp_service',
        name: 'LLP (Limited Liability Partnership)',
        description: 'Hybrid structure combining flexibility of partnership with limited liability of corporate entities.',
        popular: true,
        hasApplyNow: true,
        estimatedTimeline: '8 - 12 Days',
      },
      {
        id: 'partnership_firm_service',
        name: 'Partnership Firm',
        description: 'Drafting of formal Partnership Deed and registration with the Registrar of Firms (RoF).',
        hasApplyNow: true,
        estimatedTimeline: '5 - 8 Days',
      },
      {
        id: 'proprietorship_service',
        name: 'Proprietorship',
        description: 'Single-owner business setup with trade licenses, MSME, and commercial bank account documentation.',
        popular: true,
        hasApplyNow: true,
        estimatedTimeline: '3 - 5 Days',
      },
      {
        id: 'section_8_service',
        name: 'Section 8 Company',
        description: 'Incorporation of non-profit foundations, charitable trusts, and NGOs with central MCA license.',
        hasApplyNow: true,
        estimatedTimeline: '15 - 20 Days',
      },
      {
        id: 'gst_registration_service',
        name: 'GST Registration',
        description: 'New Goods & Services Tax (GST) registration certificate with HSN/SAC code classification and ARN tracking.',
        popular: true,
        hasApplyNow: true,
        estimatedTimeline: '3 - 7 Days',
      },
      {
        id: 'fssai_license',
        name: 'FSSAI Food License',
        description: 'Basic registration, State or Central FSSAI food safety licenses for food manufacturing, cloud kitchens, and traders.',
        popular: true,
        hasApplyNow: true,
        estimatedTimeline: '5 - 12 Days',
      },
      {
        id: 'iec_code',
        name: 'IEC (Import Export Code)',
        description: 'Mandatory 10-digit DGFT Import Export Code for cross-border international trade and customs clearance.',
        hasApplyNow: true,
        estimatedTimeline: '2 - 3 Days',
      },
      {
        id: 'msme_reg_service',
        name: 'MSME / Udyam Certificate',
        description: 'Official Ministry of MSME Udyam registration certificate generated with zero government fees.',
        popular: true,
        hasApplyNow: true,
        estimatedTimeline: '1 - 2 Days',
      },
      {
        id: 'dsc_token',
        name: 'DSC (Digital Signature Certificate)',
        description: 'Class 3 Digital Signature Certificate tokens with 2-year validity for MCA, Income Tax, and e-Tendering.',
        popular: true,
        hasApplyNow: true,
        estimatedTimeline: '1 Day',
      },
    ],
  },

  // 4. TAX & COMPLIANCE
  {
    id: 'tax_compliance',
    name: 'Tax & Compliance',
    shortDescription: 'Maintain impeccable compliance hygiene with ROC annual filings, GST returns, direct tax, and payroll maintenance.',
    iconName: 'Calculator',
    subServices: [
      {
        id: 'gst_reg_comp',
        name: 'GST Registration',
        description: 'Fresh GST registration, amendment of core/non-core fields, and additional place of business registration.',
        estimatedTimeline: '3 - 5 Days',
      },
      {
        id: 'gst_returns',
        name: 'GST Return Filing',
        description: 'Monthly/quarterly filing of GSTR-1, GSTR-3B, input tax credit (ITC) reconciliation, and annual GSTR-9 returns.',
        popular: true,
        estimatedTimeline: 'Monthly / Quarterly',
      },
      {
        id: 'itr_filing',
        name: 'Income Tax / ITR',
        description: 'Preparation and filing of corporate and individual Income Tax Returns (ITR-1 through ITR-6) with tax optimization.',
        popular: true,
        estimatedTimeline: '3 - 5 Days',
      },
      {
        id: 'tds_compliance',
        name: 'TDS (Tax Deducted at Source)',
        description: 'Quarterly TDS return filing (24Q, 26Q), Form 16/16A generation, and Challan 281 reconciliations.',
        estimatedTimeline: 'Quarterly',
      },
      {
        id: 'roc_compliance',
        name: 'ROC Compliance',
        description: 'Maintenance of statutory registers, minutes of board meetings, and filing of forms with the Registrar of Companies.',
        popular: true,
        estimatedTimeline: 'Ongoing / Annual',
      },
      {
        id: 'annual_filing',
        name: 'Annual Filing (AOC-4 & MGT-7)',
        description: 'Mandatory annual financial statement (AOC-4) and annual return (MGT-7/7A) filing with MCA to avoid hefty penalties.',
        popular: true,
        estimatedTimeline: '7 - 10 Days',
      },
      {
        id: 'pf_esi_registration',
        name: 'PF / ESI',
        description: 'Employees Provident Fund (EPFO) & ESIC employer registration, monthly return filings, and wage code advisory.',
        estimatedTimeline: '3 - 5 Days',
      },
      {
        id: 'accounting_bookkeeping',
        name: 'Accounting & Bookkeeping',
        description: 'Cloud accounting (Tally, Zoho, QuickBooks), bank reconciliation, monthly MIS reporting, and audit support.',
        popular: true,
        estimatedTimeline: 'Monthly Retainer',
      },
    ],
  },

  // 5. BRAND & LEGAL
  {
    id: 'brand_legal',
    name: 'Brand & Legal',
    shortDescription: 'Protect intellectual property assets, brand identity, and enforce bulletproof commercial agreements.',
    iconName: 'ShieldAlert',
    subServices: [
      {
        id: 'trademark_reg',
        name: 'Trademark Registration',
        description: 'Brand name, logo, and slogan search across Classes 1-45, trademark application filing, and receipt of TM number.',
        popular: true,
        hasApplyNow: true,
        estimatedTimeline: '1 - 2 Days for TM',
      },
      {
        id: 'copyright_reg',
        name: 'Copyright',
        description: 'Legal protection for software code, literary works, visual designs, music, and creative content with the Copyright Office.',
        estimatedTimeline: '15 - 30 Days',
      },
      {
        id: 'design_reg',
        name: 'Design Registration',
        description: 'Securing exclusive rights over industrial design, product aesthetics, shape, configuration, and ornamentation.',
        estimatedTimeline: '20 - 45 Days',
      },
      {
        id: 'agreement_drafting',
        name: 'Agreement Drafting',
        description: 'Tailor-made drafting of commercial terms, service level agreements (SLA), partnership deeds, and lease agreements.',
        popular: true,
        estimatedTimeline: '2 - 4 Days',
      },
      {
        id: 'nda_drafting',
        name: 'NDA (Non-Disclosure Agreement)',
        description: 'Mutual or unilateral non-disclosure and confidentiality covenants safeguarding proprietary trade secrets and IP.',
        popular: true,
        estimatedTimeline: '1 - 2 Days',
      },
      {
        id: 'business_contracts',
        name: 'Business Contracts',
        description: 'Vendor contracts, distribution agreements, employment contracts, consultancy retainers, and master service agreements (MSA).',
        popular: true,
        estimatedTimeline: '3 - 5 Days',
      },
      {
        id: 'legal_documentation',
        name: 'Legal Documentation',
        description: 'Notarized affidavits, power of attorney (PoA), board resolutions, and legal notices drafted by corporate advocates.',
        estimatedTimeline: '2 - 3 Days',
      },
    ],
  },
];

export const CONSULTANCY_TIMELINE_STAGES: {
  status: string;
  label: string;
  description: string;
}[] = [
  { status: 'New', label: 'Request Received', description: 'Consultancy request received and logged into intake queue.' },
  { status: 'Under Review', label: 'Under Review', description: 'Senior consultant reviewing project requirements and scope.' },
  { status: 'Consultant Assigned', label: 'Consultant Assigned', description: 'Dedicated domain specialist assigned to your engagement.' },
  { status: 'Documents Pending', label: 'Documents Pending', description: 'Awaiting primary client documents or clarifications.' },
  { status: 'Quotation Sent', label: 'Quotation Sent', description: 'Professional fee estimate and scope of work proposal shared.' },
  { status: 'Payment Pending', label: 'Payment Pending', description: 'Awaiting advance retainer / statutory fee confirmation.' },
  { status: 'In Progress', label: 'In Progress', description: 'Advisory drafting, report preparation, or statutory filing in active execution.' },
  { status: 'Client Review', label: 'Client Review', description: 'Deliverable or report shared with client for feedback and review.' },
  { status: 'Completed', label: 'Completed', description: 'Consultancy engagement executed and successfully closed.' },
];
