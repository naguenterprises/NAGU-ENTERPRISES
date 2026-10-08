import React, { useState, useEffect } from 'react';
import { AuthUser } from '../../types/auth';
import { getAllStaffAccounts, updateStaffAccountStatus, PRIMARY_ADMIN_EMAIL } from '../../services/authService';
import { formatDate, formatDateTime } from '../../utils/storage';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Mail, 
  Phone, 
  RefreshCw,
  Ban,
  Check,
  X,
  Briefcase,
  AlertCircle
} from 'lucide-react';

export const StaffManagement: React.FC = () => {
  const [staffList, setStaffList] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'pending' | 'approved' | 'rejected' | 'disabled'>('ALL');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const accounts = await getAllStaffAccounts();
      setStaffList(accounts);
    } catch (err: any) {
      setActionErrorMsg(err.message || 'Failed to load staff accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleUpdateStatus = async (
    staffId: string, 
    newStatus: 'approved' | 'rejected' | 'disabled',
    staffName: string,
    reason?: string
  ) => {
    try {
      setActionSuccessMsg(null);
      setActionErrorMsg(null);
      await updateStaffAccountStatus(staffId, newStatus, PRIMARY_ADMIN_EMAIL, reason);
      await loadStaff();

      let msg = '';
      if (newStatus === 'approved') {
        msg = `Staff member "${staffName}" has been APPROVED. Access granted to Staff Dashboard.`;
      } else if (newStatus === 'rejected') {
        msg = `Staff member "${staffName}" has been REJECTED. Access remains blocked.`;
      } else if (newStatus === 'disabled') {
        msg = `Staff member "${staffName}" has been DISABLED. Immediate portal access revoked.`;
      }
      setActionSuccessMsg(msg);
      setTimeout(() => setActionSuccessMsg(null), 6000);
    } catch (err: any) {
      setActionErrorMsg(err.message || 'Failed to update staff status');
    }
  };

  // Filter staff list
  const filteredStaff = staffList.filter(s => {
    if (statusFilter !== 'ALL' && s.accountStatus !== statusFilter) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = s.fullName.toLowerCase().includes(q);
      const matchEmail = s.email.toLowerCase().includes(q);
      const matchPhone = s.mobile.includes(q);
      const matchRole = (s.designation || '').toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone || matchRole;
    }
    return true;
  });

  // Metrics
  const totalStaff = staffList.length;
  const pendingStaff = staffList.filter(s => s.accountStatus === 'pending').length;
  const approvedStaff = staffList.filter(s => s.accountStatus === 'approved').length;
  const disabledStaff = staffList.filter(s => s.accountStatus === 'disabled').length;
  const rejectedStaff = staffList.filter(s => s.accountStatus === 'rejected').length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Access Control & Approval Center
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-900 mt-1">
            Staff Management & Approvals
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Review new internal staff registrations, grant verified access, or disable credentials in accordance with administrative security policy.
          </p>
        </div>

        <button
          onClick={loadStaff}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors self-start md:self-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Action Notification Messages */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-xs sm:text-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{actionSuccessMsg}</div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionErrorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs sm:text-sm animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{actionErrorMsg}</div>
          <button onClick={() => setActionErrorMsg(null)} className="text-rose-600 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Staff Accounts</span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 mt-1 block">
            {totalStaff}
          </span>
          <span className="text-[11px] text-slate-400">Registered staff profiles</span>
        </div>

        <div className={`p-4 rounded-2xl border shadow-2xs ${
          pendingStaff > 0 ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-200/50' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 block">Pending Approval</span>
            {pendingStaff > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-800 mt-1 block">
            {pendingStaff}
          </span>
          <span className="text-[11px] text-amber-600 font-medium">Awaiting Admin decision</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/30 border border-emerald-200 shadow-2xs">
          <span className="text-xs font-semibold text-emerald-700 block">Approved & Active</span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-800 mt-1 block">
            {approvedStaff}
          </span>
          <span className="text-[11px] text-emerald-600">Full Staff Portal access</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-600 block">Disabled Accounts</span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-700 mt-1 block">
            {disabledStaff}
          </span>
          <span className="text-[11px] text-slate-500">Access temporarily paused</span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/30 border border-rose-200 shadow-2xs col-span-2 lg:col-span-1">
          <span className="text-xs font-semibold text-rose-700 block">Rejected Accounts</span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-rose-800 mt-1 block">
            {rejectedStaff}
          </span>
          <span className="text-[11px] text-rose-600">Access permanently denied</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search staff by Name, Email, Mobile or Designation..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-slate-50/50"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold pb-1 md:pb-0">
          {(['ALL', 'pending', 'approved', 'disabled', 'rejected'] as const).map(statusKey => {
            const labelMap = {
              ALL: 'All Statuses',
              pending: `Pending (${pendingStaff})`,
              approved: `Approved (${approvedStaff})`,
              disabled: `Disabled (${disabledStaff})`,
              rejected: `Rejected (${rejectedStaff})`,
            };
            return (
              <button
                key={statusKey}
                onClick={() => setStatusFilter(statusKey)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  statusFilter === statusKey
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {labelMap[statusKey]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Staff Table / Cards List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            Loading staff accounts...
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">No staff members found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredStaff.map((staff) => {
              const isPending = staff.accountStatus === 'pending';
              const isApproved = staff.accountStatus === 'approved';
              const isRejected = staff.accountStatus === 'rejected';
              const isDisabled = staff.accountStatus === 'disabled';

              return (
                <div 
                  key={staff.id} 
                  className={`p-5 sm:p-6 transition-colors hover:bg-slate-50/70 flex flex-col lg:flex-row lg:items-center justify-between gap-5 ${
                    isPending ? 'bg-amber-50/30' : ''
                  }`}
                >
                  {/* Left Column: Staff Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-bold text-slate-900 text-base font-display">
                        {staff.fullName}
                      </h3>

                      {/* Status Badge */}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Clock className="w-3 h-3 text-amber-600" />
                          PENDING APPROVAL
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          APPROVED
                        </span>
                      )}
                      {isDisabled && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700 border border-slate-300">
                          <Ban className="w-3 h-3 text-slate-500" />
                          DISABLED
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          <UserX className="w-3 h-3 text-rose-600" />
                          REJECTED
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-blue-700 font-semibold flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                      <span>{staff.designation || 'Staff Consultant'}</span>
                      {staff.department && (
                        <span className="text-slate-400 font-normal">| {staff.department}</span>
                      )}
                    </div>

                    {/* Contact & Meta Row */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono">{staff.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono">+91 {staff.mobile}</span>
                      </div>
                      <div className="text-slate-400">
                        Registered: <span className="text-slate-600">{formatDate(staff.createdAt)}</span>
                      </div>
                    </div>

                    {/* Historical Notes */}
                    {staff.approvedAt && staff.approvedBy && (
                      <div className="text-[11px] text-emerald-700">
                        Approved on {formatDate(staff.approvedAt)} by <span className="font-semibold">{staff.approvedBy}</span>
                      </div>
                    )}
                    {staff.rejectionReason && (
                      <div className="text-[11px] text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
                        <strong>Reason:</strong> {staff.rejectionReason}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Admin Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    
                    {/* If PENDING: Show Approve or Reject */}
                    {isPending && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(staff.id, 'approved', staff.fullName)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                          title="Approve this staff account to grant Staff Portal access"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve Staff</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const reason = window.prompt(`Specify rejection reason for ${staff.fullName} (optional):`, 'Not meeting current verification standards');
                            handleUpdateStatus(staff.id, 'rejected', staff.fullName, reason || undefined);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors"
                          title="Reject this staff registration"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    {/* If APPROVED: Show Disable or Reject */}
                    {isApproved && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to DISABLE access for ${staff.fullName}? They will be immediately blocked from logging in.`)) {
                              handleUpdateStatus(staff.id, 'disabled', staff.fullName, 'Administrative suspension');
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold transition-colors"
                          title="Temporarily block access for this staff member"
                        >
                          <Ban className="w-3.5 h-3.5 text-amber-700" />
                          <span>Disable</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Reject and permanently revoke staff credentials for ${staff.fullName}?`)) {
                              handleUpdateStatus(staff.id, 'rejected', staff.fullName, 'Revoked by Administration');
                            }
                          }}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors"
                          title="Revoke access"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Revoke</span>
                        </button>
                      </>
                    )}

                    {/* If DISABLED: Show Reactivate */}
                    {isDisabled && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(staff.id, 'approved', staff.fullName)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors"
                        title="Reactivate this staff member's account"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Reactivate Account</span>
                      </button>
                    )}

                    {/* If REJECTED: Show Reactivate */}
                    {isRejected && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(staff.id, 'approved', staff.fullName)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold transition-colors"
                        title="Reconsider and grant access"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Re-evaluate & Approve</span>
                      </button>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Security Policies Notice Card */}
      <div className="p-6 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm text-blue-950">
          <ShieldAlert className="w-4 h-4 text-blue-700" />
          <span>Statutory Staff Compliance & Approval Architecture</span>
        </div>
        <p className="text-blue-800 leading-relaxed">
          In compliance with Nagu Enterprises Information Security Policy, all newly registered staff accounts default to <strong>PENDING</strong> status. An authorized Administrator must review and approve credentials before any access to client dossiers, statutory incorporation forms, or consultancy inquiries is authorized.
        </p>
        <p className="text-blue-700 text-[11px]">
          Disabling a staff member immediately invalidates any active authentication tokens and terminates the current user session across devices.
        </p>
      </div>

    </div>
  );
};
