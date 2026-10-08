import React, { useState, useEffect } from 'react';
import { ApplicationRecord, ApplicationStatus } from '../../types';
import { AuthUser } from '../../types/auth';
import { getAllStaffAccounts } from '../../services/authService';
import { STAFF_MEMBERS } from '../../data/staffMembers';
import { BUSINESS_TYPES } from '../../data/businessTypes';
import { getStoredApplications, saveApplications, formatDate, formatDateTime, maskPAN } from '../../utils/storage';
import { AdminApplicationModal } from './AdminApplicationModal';
import { ConsultancyManagement } from './ConsultancyManagement';
import { StaffManagement } from './StaffManagement';
import { COMPANY_CONTACT } from '../../data/companyInfo';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Users, 
  Building2, 
  Settings, 
  CreditCard, 
  Briefcase, 
  ArrowUpDown, 
  Plus, 
  RefreshCw,
  LogOut,
  Sliders,
  DollarSign,
  Sparkles,
  UserCheck
} from 'lucide-react';

interface AdminPortalProps {
  onExit: () => void;
  currentUser?: AuthUser | null;
  onSignOut?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onExit, currentUser, onSignOut }) => {
  const [applications, setApplications] = useState<ApplicationRecord[]>(getStoredApplications());
  const [selectedApp, setSelectedApp] = useState<ApplicationRecord | null>(null);

  // Active admin view tab
  const [adminSection, setAdminSection] = useState<'applications' | 'consultancy' | 'staff_management' | 'settings' | 'payments' | 'future_services'>('applications');
  const [pendingStaffCount, setPendingStaffCount] = useState<number>(0);

  useEffect(() => {
    getAllStaffAccounts().then(staff => {
      setPendingStaffCount(staff.filter(s => s.accountStatus === 'pending').length);
    }).catch(() => {});
  }, [adminSection]);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterStaff, setFilterStaff] = useState('ALL');
  const [filterDocIssuesOnly, setFilterDocIssuesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'id'>('date_desc');

  // Refresh data from storage
  const reloadData = () => {
    setApplications(getStoredApplications());
  };

  // Update a single application
  const handleUpdateApplication = (updated: ApplicationRecord) => {
    const list = applications.map(a => a.id === updated.id ? updated : a);
    setApplications(list);
    saveApplications(list);
    setSelectedApp(updated);
  };

  // Filter logic
  const filteredApps = applications.filter(app => {
    // Search term check
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchId = app.id.toLowerCase().includes(q);
      const matchClient = app.applicant.fullName.toLowerCase().includes(q);
      const matchMobile = app.applicant.mobile.includes(q);
      const matchEmail = app.applicant.email.toLowerCase().includes(q);
      const matchCompany = app.business.proposedName1.toLowerCase().includes(q);
      if (!matchId && !matchClient && !matchMobile && !matchEmail && !matchCompany) {
        return false;
      }
    }

    // Type filter
    if (filterType !== 'ALL' && app.businessTypeId !== filterType) {
      return false;
    }

    // Status filter
    if (filterStatus !== 'ALL' && app.status !== filterStatus) {
      return false;
    }

    // Staff filter
    if (filterStaff !== 'ALL' && app.assignedStaffId !== filterStaff) {
      return false;
    }

    // Document issues filter
    if (filterDocIssuesOnly) {
      const hasIssues = app.documents.some(d => d.status === 'reupload_required' || d.status === 'rejected');
      if (!hasIssues) return false;
    }

    return true;
  });

  // Sort logic
  const sortedApps = [...filteredApps].sort((a, b) => {
    if (sortBy === 'date_desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'date_asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === 'id') return b.id.localeCompare(a.id);
    return 0;
  });

  // Overview Metrics
  const totalCount = applications.length;
  const inScrutinyCount = applications.filter(a => a.status === 'Documents Under Verification' || a.status === 'New Application').length;
  const docIssuesCount = applications.filter(a => a.documents.some(d => d.status === 'reupload_required' || d.status === 'rejected')).length;
  const filingCount = applications.filter(a => a.status === 'MCA / Authority Filing' || a.status === 'Under Processing').length;
  const approvedCount = applications.filter(a => a.status === 'Approved' || a.status === 'Completed').length;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Admin Top Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">
              Internal Compliance Workspace
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display mt-1">
            Nagu Enterprises Admin Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Manage business registration intake, document verification, RoC filing status, and client communications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={reloadData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Data</span>
          </button>

          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-xs font-bold text-white transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Return to Client Portal</span>
          </button>
        </div>
      </div>

      {/* Admin Sub Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setAdminSection('applications')}
          className={`flex items-center gap-1.5 py-2 px-4 rounded-xl transition-colors ${
            adminSection === 'applications'
              ? 'bg-blue-700 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Applications Desk ({applications.length})</span>
        </button>

        <button
          onClick={() => setAdminSection('consultancy')}
          className={`flex items-center gap-1.5 py-2 px-4 rounded-xl transition-colors ${
            adminSection === 'consultancy'
              ? 'bg-blue-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Consultancy Requests</span>
        </button>

        {/* Staff Management Tab */}
        <button
          onClick={() => setAdminSection('staff_management')}
          className={`flex items-center gap-1.5 py-2 px-4 rounded-xl transition-colors relative ${
            adminSection === 'staff_management'
              ? 'bg-blue-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4 text-blue-300" />
          <span>Staff Management</span>
          {pendingStaffCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950">
              {pendingStaffCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminSection('payments')}
          className={`flex items-center gap-1.5 py-2 px-4 rounded-xl transition-colors ${
            adminSection === 'payments'
              ? 'bg-blue-700 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment Module (Future Ready)</span>
        </button>

        <button
          onClick={() => setAdminSection('future_services')}
          className={`flex items-center gap-1.5 py-2 px-4 rounded-xl transition-colors ${
            adminSection === 'future_services'
              ? 'bg-blue-700 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Future Expansion Modules</span>
        </button>

        <button
          onClick={() => setAdminSection('settings')}
          className={`flex items-center gap-1.5 py-2 px-4 rounded-xl transition-colors ${
            adminSection === 'settings'
              ? 'bg-blue-700 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Admin Settings & Staff</span>
        </button>
      </div>

      {/* SECTION: APPLICATIONS MANAGEMENT */}
      {adminSection === 'applications' && (
        <div className="space-y-6">
          
          {/* Dashboard Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block">Total Dossiers</span>
              <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 mt-1 block">
                {totalCount}
              </span>
              <span className="text-[11px] text-slate-400">All registered entities</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-blue-200 bg-blue-50/20 shadow-2xs">
              <span className="text-xs font-semibold text-blue-700 block">Under Scrutiny</span>
              <span className="text-2xl sm:text-3xl font-bold font-mono text-blue-800 mt-1 block">
                {inScrutinyCount}
              </span>
              <span className="text-[11px] text-blue-600">Verification in progress</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-amber-200 bg-amber-50/20 shadow-2xs">
              <span className="text-xs font-semibold text-amber-700 block">Action Required</span>
              <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-800 mt-1 block">
                {docIssuesCount}
              </span>
              <span className="text-[11px] text-amber-600">Re-upload pending</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-purple-200 bg-purple-50/20 shadow-2xs">
              <span className="text-xs font-semibold text-purple-700 block">MCA / CRC Filing</span>
              <span className="text-2xl sm:text-3xl font-bold font-mono text-purple-800 mt-1 block">
                {filingCount}
              </span>
              <span className="text-[11px] text-purple-600">Statutory review</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-emerald-200 bg-emerald-50/20 shadow-2xs col-span-2 lg:col-span-1">
              <span className="text-xs font-semibold text-emerald-700 block">Incorporated</span>
              <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-800 mt-1 block">
                {approvedCount}
              </span>
              <span className="text-[11px] text-emerald-600">COI & Certificate issued</span>
            </div>
          </div>

          {/* Search, Filter & Controls Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search Bar */}
              <div className="lg:col-span-2 relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by ID, client name, mobile, email, or proposed company..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-600"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>

              {/* Entity Type Filter */}
              <div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                >
                  <option value="ALL">All Entity Types</option>
                  {BUSINESS_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="New Application">New Application</option>
                  <option value="Documents Under Verification">Documents Under Verification</option>
                  <option value="Documents Verified">Documents Verified</option>
                  <option value="Additional Information Required">Additional Information Required</option>
                  <option value="Name Reservation">Name Reservation</option>
                  <option value="MCA / Authority Filing">MCA / Authority Filing</option>
                  <option value="Approved">Approved</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Second row filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                {/* Staff Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-medium">Assigned Officer:</span>
                  <select
                    value={filterStaff}
                    onChange={(e) => setFilterStaff(e.target.value)}
                    className="px-2 py-1 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white"
                  >
                    <option value="ALL">All Officers</option>
                    {STAFF_MEMBERS.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Doc Issues Only Toggle */}
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={filterDocIssuesOnly}
                    onChange={(e) => setFilterDocIssuesOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span>Show Only Pending/Rejected Documents</span>
                </label>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2 py-1 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white"
                >
                  <option value="date_desc">Newest First</option>
                  <option value="date_asc">Oldest First</option>
                  <option value="id">Application ID</option>
                </select>
              </div>
            </div>

          </div>

          {/* Applications Data Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-4">Application ID</th>
                    <th className="py-3.5 px-4">Client / Promoter</th>
                    <th className="py-3.5 px-4">Entity & Proposed Name</th>
                    <th className="py-3.5 px-4">Submitted Date</th>
                    <th className="py-3.5 px-4">Current Status</th>
                    <th className="py-3.5 px-4">Assigned Staff</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {sortedApps.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No applications matched your search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    sortedApps.map((app) => {
                      const hasDocIssues = app.documents.some(d => d.status === 'reupload_required' || d.status === 'rejected');

                      return (
                        <tr 
                          key={app.id} 
                          onClick={() => setSelectedApp(app)}
                          className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                        >
                          {/* ID */}
                          <td className="py-4 px-4 font-mono font-bold text-blue-700 group-hover:text-blue-900 whitespace-nowrap">
                            {app.id}
                          </td>

                          {/* Client */}
                          <td className="py-4 px-4">
                            <span className="font-semibold text-slate-900 block">{app.applicant.fullName}</span>
                            <span className="text-slate-500 text-xs block">{app.applicant.mobile}</span>
                          </td>

                          {/* Entity */}
                          <td className="py-4 px-4 max-w-xs">
                            <span className="font-semibold text-slate-800 text-xs block truncate">
                              {app.business.proposedName1}
                            </span>
                            <span className="text-[11px] text-slate-500 block truncate">
                              {app.businessTypeName}
                            </span>
                          </td>

                          {/* Submission Date */}
                          <td className="py-4 px-4 whitespace-nowrap text-slate-600 text-xs tabular-nums">
                            {formatDate(app.createdAt)}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                                app.status === 'Completed' || app.status === 'Approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : app.status === 'Additional Information Required'
                                  ? 'bg-amber-100 text-amber-800 font-bold'
                                  : app.status === 'MCA / Authority Filing'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-50 text-blue-800 border border-blue-200'
                              }`}>
                                {app.status}
                              </span>

                              {hasDocIssues && (
                                <span className="w-2 h-2 rounded-full bg-red-500" title="Action required on documents" />
                              )}
                            </div>
                          </td>

                          {/* Staff */}
                          <td className="py-4 px-4 text-xs whitespace-nowrap">
                            <span className="font-medium text-slate-800 block">
                              {app.assignedStaffName || 'Unassigned'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedApp(app);
                              }}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs transition-colors"
                            >
                              Open Dossier
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {sortedApps.length} of {applications.length} applications</span>
              <span>Click on any application row to inspect KYC & change filing status</span>
            </div>
          </div>

        </div>
      )}

      {/* SECTION: CONSULTANCY REQUESTS MANAGEMENT */}
      {adminSection === 'consultancy' && (
        <ConsultancyManagement />
      )}

      {/* SECTION: PAYMENT MODULE (FUTURE READY) */}
      {adminSection === 'payments' && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
                Section 23 Architecture
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display mt-0.5">
                Payment Module & Fee Schedule Architecture
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Structured tariff schedules prepared for gateway integration. Supports tiered split between Professional Consulting Fees and MCA / Government Statutory Challans.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Stage 1</span>
                <h3 className="font-bold text-slate-900 text-base">Consultation & Scrutiny Fee</h3>
                <p className="text-xs text-slate-600">
                  Initial intake, DIN / DPIN validation, eligibility check and preliminary trademark conflict assessment.
                </p>
                <span className="text-sm font-bold text-blue-800 block">₹1,499 (Advance Retainer)</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Stage 2</span>
                <h3 className="font-bold text-slate-900 text-base">Professional Drafting Fee</h3>
                <p className="text-xs text-slate-600">
                  MOA & AOA formulation, SPICe+ Part A/B drafting, Form INC-9/INC-3 and Company Secretary certification.
                </p>
                <span className="text-sm font-bold text-blue-800 block">₹4,500 - ₹8,500</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Stage 3</span>
                <h3 className="font-bold text-slate-900 text-base">Government & Stamp Challans</h3>
                <p className="text-xs text-slate-600">
                  MCA Central Registration Centre fees, state-specific electronic stamp duty, and PAN/TAN processing fees.
                </p>
                <span className="text-sm font-bold text-blue-800 block">At Actuals (Govt Receipted)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
              <strong>Future Integration Ready:</strong> API endpoints and webhook handlers for Razorpay / Cashfree / Stripe can be mounted directly into this module without altering the application data layer.
            </div>
          </div>
        </div>
      )}

      {/* SECTION: FUTURE EXPANSION MODULES */}
      {adminSection === 'future_services' && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
                Section 29 Architecture
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display mt-0.5">
                Ready-to-Deploy Nagu Enterprises Service Modules
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                The database schema and dynamic workflow engine are architected to seamlessly add these post-incorporation services:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {[
                { title: 'GST Registration', desc: 'Goods & Services Tax identification number for inter-state trading & e-commerce.' },
                { title: 'MSME / Udyam Registration', desc: 'Priority sector lending, subsidy eligibility, and collateral-free loans.' },
                { title: 'Trademark & IP Protection', desc: 'Class-wise brand name, logo, and wordmark filing with Controller General.' },
                { title: 'FSSAI Food License', desc: 'Basic, State and Central food safety compliance for restaurants & food processors.' },
                { title: 'Import Export Code (IEC)', desc: 'DGFT 10-digit code required for foreign trade, export remittances and customs.' },
                { title: 'Digital Signature Certificate (DSC)', desc: 'Class 3 encrypted USB tokens for authorized signatories and directors.' },
                { title: 'Annual MCA Compliance', desc: 'AOC-4 financial statements, MGT-7 annual return and director DIR-3 KYC.' },
                { title: 'Accounting & Bookkeeping', desc: 'Monthly reconciliations, TDS deductions, GST periodic return filing.' },
              ].map((s, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                  <h3 className="font-bold text-slate-900 text-sm">{s.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                  <span className="inline-block text-[11px] font-semibold text-blue-700">Module Schema Ready</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION: STAFF MANAGEMENT & APPROVALS */}
      {adminSection === 'staff_management' && (
        <StaffManagement />
      )}

      {/* SECTION: ADMIN SETTINGS & STAFF */}
      {adminSection === 'settings' && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Staff Directory & Role Assignments
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Authorized Nagu Enterprises Company Secretaries and CA partners handling client dossiers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {STAFF_MEMBERS.map(staff => (
                <div key={staff.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{staff.name}</h3>
                    <p className="text-xs text-blue-700 font-medium">{staff.role}</p>
                    <div className="text-xs text-slate-500 mt-2 space-y-0.5">
                      <div>Email: {staff.email}</div>
                      <div>Phone: {staff.phone}</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg">
                    {staff.activeCount} Active
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Official Nagu Enterprises Contact Configuration
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 block">Support Email:</span>
                  <span className="font-semibold text-slate-900">naguenterprises84@gmail.com</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 block">Corporate Advisory Desk:</span>
                  <span className="font-semibold text-slate-900 font-mono">{COMPANY_CONTACT.displayPhones}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application Detail Modal */}
      {selectedApp && (
        <AdminApplicationModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onUpdate={handleUpdateApplication}
        />
      )}

    </div>
  );
};
