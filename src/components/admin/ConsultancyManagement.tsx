import React, { useState } from 'react';
import { ConsultancyRecord, ConsultancyStatus } from '../../types/consultancy';
import { CONSULTANCY_CATEGORIES } from '../../data/consultancyServices';
import { getStoredConsultancyRequests, saveConsultancyRequests } from '../../services/consultancyService';
import { AdminConsultancyModal } from './AdminConsultancyModal';
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  DollarSign, 
  Eye, 
  Calendar, 
  Building2, 
  User, 
  Sparkles, 
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';

export const ConsultancyManagement: React.FC = () => {
  const [requests, setRequests] = useState<ConsultancyRecord[]>(getStoredConsultancyRequests());
  const [selectedRecord, setSelectedRecord] = useState<ConsultancyRecord | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPayment, setFilterPayment] = useState('ALL');

  const reloadData = () => {
    setRequests(getStoredConsultancyRequests());
  };

  const handleUpdateRecord = (updated: ConsultancyRecord) => {
    const list = requests.map(r => r.id === updated.id ? updated : r);
    setRequests(list);
    saveConsultancyRequests(list);
    setSelectedRecord(updated);
  };

  // Filtered requests
  const filtered = requests.filter(r => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = r.id.toLowerCase().includes(q);
      const matchClient = r.client.fullName.toLowerCase().includes(q);
      const matchCompany = r.business.businessName.toLowerCase().includes(q);
      const matchPhone = r.client.mobile.includes(q);
      const matchEmail = r.client.email.toLowerCase().includes(q);
      if (!matchId && !matchClient && !matchCompany && !matchPhone && !matchEmail) {
        return false;
      }
    }

    if (filterCategory !== 'ALL' && r.requirement.categoryId !== filterCategory) {
      return false;
    }

    if (filterStatus !== 'ALL' && r.status !== filterStatus) {
      return false;
    }

    if (filterPayment !== 'ALL' && r.paymentStatus !== filterPayment) {
      return false;
    }

    return true;
  });

  // Metrics
  const totalCount = requests.length;
  const newCount = requests.filter(r => r.status === 'New').length;
  const inProgressCount = requests.filter(r => r.status === 'In Progress' || r.status === 'Consultant Assigned').length;
  const quotationSentCount = requests.filter(r => r.status === 'Quotation Sent' || r.status === 'Payment Pending').length;
  const completedCount = requests.filter(r => r.status === 'Completed').length;

  return (
    <div className="space-y-6">
      
      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-500 block">Total Requests</span>
          <span className="text-2xl font-black text-slate-900 font-display">{totalCount}</span>
        </div>
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-blue-700 block">New / Review</span>
          <span className="text-2xl font-black text-blue-700 font-display">{newCount}</span>
        </div>
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-amber-700 block">Quotations / Pay</span>
          <span className="text-2xl font-black text-amber-700 font-display">{quotationSentCount}</span>
        </div>
        <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-indigo-700 block">Active Advisory</span>
          <span className="text-2xl font-black text-indigo-700 font-display">{inProgressCount}</span>
        </div>
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-emerald-700 block">Completed</span>
          <span className="text-2xl font-black text-emerald-700 font-display">{completedCount}</span>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by ID (NE-CON-...), Client Name, Enterprise, Mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={reloadData}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              title="Refresh requests"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-slate-100">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Service Domain</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 bg-white"
            >
              <option value="ALL">All Service Domains</option>
              {CONSULTANCY_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="New">New</option>
              <option value="Under Review">Under Review</option>
              <option value="Consultant Assigned">Consultant Assigned</option>
              <option value="Documents Pending">Documents Pending</option>
              <option value="Quotation Sent">Quotation Sent</option>
              <option value="Payment Pending">Payment Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Client Review">Client Review</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Payment Status</label>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 bg-white"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Advance Paid">Advance Paid</option>
              <option value="Fully Paid">Fully Paid</option>
            </select>
          </div>
        </div>

      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Client & Mobile</th>
                <th className="py-3 px-4">Enterprise & Service</th>
                <th className="py-3 px-4">Consultant Assigned</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Fee / Payment</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((req) => (
                <tr
                  key={req.id}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  onClick={() => setSelectedRecord(req)}
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                    {req.id}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-bold text-slate-900">{req.client.fullName}</div>
                    <div className="text-[11px] text-slate-500">+91 {req.client.mobile}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800 truncate max-w-xs">{req.business.businessName}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-xs">{req.requirement.subServiceName}</div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                    {req.assignedConsultantName ? (
                      <span className="font-medium text-slate-800">{req.assignedConsultantName.split('(')[0]}</span>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      req.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'In Progress'
                        ? 'bg-indigo-100 text-indigo-800'
                        : req.status === 'Quotation Sent'
                        ? 'bg-purple-100 text-purple-800'
                        : req.status === 'New'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-mono font-semibold text-slate-900">
                      {req.quotationFeeINR ? `₹${req.quotationFeeINR.toLocaleString('en-IN')}` : '–'}
                    </div>
                    <div className={`text-[10px] font-bold ${
                      req.paymentStatus === 'Fully Paid' ? 'text-emerald-700' : req.paymentStatus === 'Advance Paid' ? 'text-blue-700' : 'text-slate-400'
                    }`}>
                      {req.paymentStatus}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                    {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRecord(req);
                      }}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No consultancy requests found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <AdminConsultancyModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onUpdate={handleUpdateRecord}
        />
      )}

    </div>
  );
};
