import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, SignUpButton, useUser } from '@clerk/clerk-react';
import { useInvoiceApi } from '../api';
import Navbar from '../components/Navbar';
import Layout from '../components/Layout';
import {
  Search,
  Receipt,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  Trash2,
  Edit,
  Eye,
  Sparkles,
  Filter,
  Loader2,
  ArrowRight,
  TrendingUp,
  FolderOpen
} from 'lucide-react';

const Home = () => {
  const { user } = useUser();
  const api = useInvoiceApi();


  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [stats, setStats] = useState({
    totalCount: 0,
    totalBilled: 0,
    totalPaid: 0,
    totalPending: 0,
    overdueCount: 0,
  });

  const calculateStats = useCallback((items) => {
    let billed = 0;
    let paid = 0;
    let pending = 0;
    let overdue = 0;

    items.forEach((inv) => {
      const amt = Number(inv.total || 0);
      billed += amt;
      if (inv.status === 'paid') {
        paid += amt;
      } else if (inv.status === 'unpaid') {
        pending += amt;
      } else if (inv.status === 'overdue') {
        pending += amt;
        overdue += 1;
      } else if (inv.status === 'draft') {
        pending += amt;
      }
    });

    setStats({
      totalCount: items.length,
      totalBilled: billed,
      totalPaid: paid,
      totalPending: pending,
      overdueCount: overdue,
    });
  }, []);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getInvoices(searchTerm, statusFilter);
      if (res.success && Array.isArray(res.data)) {
        setInvoices(res.data);
        calculateStats(res.data);
      } else {
        setError(res.message || 'Failed to load invoices');
      }
    } catch (err) {
      setError(err.message || 'Server error loading invoices');
    } finally {
      setLoading(false);
    }
  }, [api, searchTerm, statusFilter, calculateStats]);

  useEffect(() => {
    let active = true;
    if (user) {
      Promise.resolve().then(() => {
        if (active) {
          fetchInvoices();
        }
      });
    }
    return () => {
      active = false;
    };
  }, [fetchInvoices, user]);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await api.getProfile();
        if (res.success && res.data && res.data.businessName) {
          setCompanyName(res.data.businessName);
        }
      } catch {
        // Fallback
      }
    };
    if (user) {
      fetchCompany();
    }
  }, [user, api]);


  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        const res = await api.deleteInvoice(id);
        if (res.success) {
          fetchInvoices();
        } else {
          alert(res.message || 'Failed to delete invoice');
        }
      } catch (err) {
        alert(err.message || 'Error deleting invoice');
      }
    }
  };

  const handleMarkPaid = async (inv) => {
    try {
      const updatedData = { ...inv, status: 'paid' };
      delete updatedData._id;
      delete updatedData.createdAt;
      delete updatedData.updatedAt;
      delete updatedData.__v;

      const res = await api.updateInvoice(inv._id, updatedData);
      if (res.success) {
        fetchInvoices();
      } else {
        alert(res.message || 'Failed to update invoice');
      }
    } catch (err) {
      alert(err.message || 'Error updating status');
    }
  };

  const getCurrencySymbol = (code) => {
    switch (code) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'INR':
      default: return '₹';
    }
  };

  const getStatusBadge = (status) => {
    const s = String(status).toLowerCase();
    switch (s) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-success/10 text-brand-success">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-success"></span>
            Paid
          </span>
        );
      case 'unpaid':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-pending/10 text-brand-pending">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-pending"></span>
            Unpaid
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-danger/10 text-brand-danger">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-danger animate-pulse"></span>
            Overdue
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-card-secondary text-text-secondary border border-border-app">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
            Draft
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-bg-app text-text-primary transition-colors duration-300">
      
      {/* SIGNED OUT LANDING PAGE */}
      <SignedOut>
        <Navbar />
        <div className="relative overflow-hidden py-24 px-6 sm:px-12 lg:px-24 bg-white dark:bg-bg-app">
          {/* Subtle Background Glows */}
          <div className="absolute top-1/4 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-primary/10 blur-3xl"></div>
          <div className="absolute bottom-10 left-1/3 -z-10 h-[500px] w-[500px] rounded-full bg-brand-highlight/5 blur-3xl"></div>

          <div className="max-w-5xl mx-auto text-center">
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-primary/15 bg-brand-primary/5 text-brand-primary text-sm font-semibold mb-6 animate-fade-in hover:scale-105 transition-transform cursor-default">
              <Sparkles className="h-4 w-4 text-brand-primary" /> Smart Invoicing Redefined
            </div>

            {/* Main Header */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none mb-6 text-text-primary">
              Create and Manage Invoices <br />
              <span className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-highlight bg-clip-text text-transparent">
                Supercharged by AI
              </span>
            </h1>

            {/* Sub description */}
            <p className="text-lg sm:text-xl text-text-secondary max-w-3xl mx-auto mb-12 leading-relaxed">
              Create client invoices in seconds with natural language prompts, track payment cycles dynamically, and build profiles with customizable logos, signatures, and stamps.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-20">
              <SignUpButton mode="modal">
                <button className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4.5 bg-brand-primary hover:bg-brand-primary-hover hover:shadow-brand-primary/20 active:scale-95 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer">
                  Start Invoicing Free <ArrowRight className="h-5 w-5" />
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="w-full sm:w-auto px-8 py-4.5 bg-white dark:bg-card-app hover:bg-slate-50 dark:hover:bg-card-secondary text-text-secondary font-bold rounded-2xl border border-border-app shadow-sm hover:shadow-md active:scale-95 transition-all cursor-pointer">
                  Sign In to Dashboard
                </button>
              </SignInButton>
            </div>

            {/* Mock Visual Frame */}
            <div className="relative rounded-3xl border border-border-app bg-white dark:bg-card-app p-3 shadow-2xl animate-fade-in max-w-4xl mx-auto hover:shadow-brand-primary/5 hover:border-brand-primary/40 transition-all duration-500">
              <div className="rounded-2xl overflow-hidden border border-border-app bg-slate-950 p-6 sm:p-12 text-left text-slate-400 font-mono text-xs sm:text-sm">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
                  <div className="text-white font-bold tracking-widest text-lg">AInvoice.ai</div>
                  <div className="text-brand-primary">Prompt Mode</div>
                </div>
                <div className="text-indigo-300 mb-2">// Generate invoice via AI Prompt</div>
                <div className="text-slate-305 mb-6 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  "Create an invoice for client <span className="text-brand-highlight">Google Inc</span> for <span className="text-brand-highlight">3 software development models</span> at <span className="text-brand-highlight">$15,000 each</span>. Tax is <span className="text-brand-highlight">18%</span>."
                </div>
                <div className="text-indigo-300 mb-2">// Extracted fields:</div>
                <div className="grid grid-cols-2 gap-2 text-slate-400 bg-slate-900/40 p-4 rounded-lg">
                  <div>Client: <span className="text-white">Google Inc</span></div>
                  <div>Invoice No: <span className="text-white">INV-8912-10</span></div>
                  <div>Items: <span className="text-white">3x Software Models</span></div>
                  <div>Unit Price: <span className="text-white">$15,000</span></div>
                  <div>Tax Rate: <span className="text-white">18%</span></div>
                  <div>Total Billed: <span className="text-brand-highlight font-bold">$53,100</span></div>
                </div>
              </div>
            </div>

            {/* Features list */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
              <div className="p-6 bg-slate-50 dark:bg-card-app rounded-2xl border border-border-app hover:border-brand-primary/30 text-left hover-lift cursor-default">
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-4 shadow-sm">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-lg mb-2 text-text-primary">AI Prompt Generation</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Type details naturally and watch the invoice dynamically build itself. No more typing into endless cells.
                </p>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-card-app rounded-2xl border border-border-app hover:border-brand-primary/30 text-left hover-lift cursor-default">
                <div className="w-12 h-12 rounded-xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary mb-4 shadow-sm">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-lg mb-2 text-text-primary">Live Dashboard & Stats</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Monitor payment status, billed amounts, and track overdue accounts visually to speed up collections.
                </p>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-card-app rounded-2xl border border-border-app hover:border-brand-primary/30 text-left hover-lift cursor-default">
                <div className="w-12 h-12 rounded-xl bg-brand-success/10 flex items-center justify-center text-brand-success mb-4 shadow-sm">
                  <Receipt className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-lg mb-2 text-text-primary">Print to PDF Layouts</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Generate print-ready A4 clean invoices with custom stamps, digital signatures, and logos with single click.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SignedOut>

      {/* SIGNED IN DASHBOARD PAGE */}
      <SignedIn>
        <Layout>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            
            {/* Welcome section */}
            <div className="mb-8 p-6 bg-card-app border border-border-app rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover-lift">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black text-text-primary">
                    Welcome Back 👋
                  </h1>
                  {companyName && (
                    <span className="px-2.5 py-1 rounded-lg bg-brand-primary/10 text-brand-primary text-xs font-bold uppercase tracking-wider">
                      {companyName}
                    </span>
                  )}
                </div>
                <p className="text-text-secondary text-sm mt-1.5 font-medium">
                  Manage your invoices and business from one place.
                </p>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                  Today's Date
                </span>
                <p className="text-sm font-extrabold text-text-primary mt-0.5">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              {/* Stat Item 1: Total Billed */}
              <div className="bg-card-app border border-border-app p-5 rounded-2xl shadow-sm flex items-center justify-between hover-lift cursor-default">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Total Billed</p>
                  <h3 className="text-xl sm:text-2xl font-black mt-1 tracking-tight text-text-primary">
                    {getCurrencySymbol('INR')}{stats.totalBilled.toLocaleString('en-IN')}
                  </h3>
                </div>
                <div className="p-3.5 rounded-xl bg-brand-primary/10 text-brand-primary shadow-sm flex items-center justify-center">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>

              {/* Stat Item 2: Received */}
              <div className="bg-card-app border border-border-app p-5 rounded-2xl shadow-sm flex items-center justify-between hover-lift cursor-default">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Received</p>
                  <h3 className="text-xl sm:text-2xl font-black mt-1 tracking-tight text-brand-success">
                    {getCurrencySymbol('INR')}{stats.totalPaid.toLocaleString('en-IN')}
                  </h3>
                </div>
                <div className="p-3.5 rounded-xl bg-brand-success/10 text-brand-success shadow-sm flex items-center justify-center">
                  <CheckCircle className="h-5 w-5" />
                </div>
              </div>

              {/* Stat Item 3: Pending */}
              <div className="bg-card-app border border-border-app p-5 rounded-2xl shadow-sm flex items-center justify-between hover-lift cursor-default">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Pending</p>
                  <h3 className="text-xl sm:text-2xl font-black mt-1 tracking-tight text-brand-pending">
                    {getCurrencySymbol('INR')}{stats.totalPending.toLocaleString('en-IN')}
                  </h3>
                </div>
                <div className="p-3.5 rounded-xl bg-brand-pending/10 text-brand-pending shadow-sm flex items-center justify-center">
                  <Clock className="h-5 w-5" />
                </div>
              </div>

              {/* Stat Item 4: Overdue */}
              <div className="bg-card-app border border-border-app p-5 rounded-2xl shadow-sm flex items-center justify-between hover-lift cursor-default">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Overdue</p>
                  <h3 className="text-xl sm:text-2xl font-black mt-1 tracking-tight text-brand-danger">
                    {stats.overdueCount}
                  </h3>
                </div>
                <div className="p-3.5 rounded-xl bg-brand-danger/10 text-brand-danger shadow-sm flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Search, Filters, and Table */}
            <div className="bg-card-app border border-border-app rounded-2xl shadow-sm overflow-hidden">
              {/* Filters Row */}
              <div className="p-5 border-b border-border-app flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-card-secondary/40">
                <div className="relative w-full sm:max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <input
                    type="text"
                    placeholder="Search invoices by client name, email, number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-app bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all hover-glow text-text-primary"
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Filter className="h-4 w-4 text-text-secondary shrink-0" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full sm:w-44 px-3 py-2.5 rounded-xl border border-border-app bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer hover-glow text-text-primary font-medium"
                  >
                    <option value="">All Statuses</option>
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="overdue">Overdue</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Invoices List Display */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-text-secondary gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
                  <p className="text-sm font-medium">Fetching invoices...</p>
                </div>
              ) : error ? (
                <div className="p-8 text-center text-brand-danger bg-brand-danger/5 border-b border-border-app">
                  {error}
                </div>
              ) : invoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                  <FolderOpen className="h-16 w-16 text-slate-300 dark:text-slate-700 mb-4" />
                  <h3 className="font-extrabold text-lg text-text-primary">No Invoices Found</h3>
                  <p className="text-text-secondary text-sm max-w-sm mt-1">
                    We couldn't find any invoices matching your search. Create one now to get started!
                  </p>
                  <div className="flex gap-3 mt-6">
                    <Link
                      to="/invoice/new"
                      className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      Create Manually
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-card-secondary/60 text-text-secondary font-semibold border-b border-border-app">
                        <th className="py-4 px-6">Invoice Number</th>
                        <th className="py-4 px-6">Client</th>
                        <th className="py-4 px-6">Issued Date</th>
                        <th className="py-4 px-6">Due Date</th>
                        <th className="py-4 px-6 text-right">Total</th>
                        <th className="py-4 px-6 text-center">Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {invoices.map((inv) => (
                        <tr
                          key={inv._id}
                          className="hover:bg-slate-50/30 dark:hover:bg-card-secondary/20 hover:shadow-[inset_4px_0_0_0_var(--color-brand-primary)] transition-all duration-205 cursor-default"
                        >
                          <td className="py-4 px-6 font-bold text-text-primary">
                            {inv.invoiceNumber}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-col">
                              <span className="font-bold text-text-primary">
                                {inv.client?.name || 'Unnamed Client'}
                              </span>
                              {inv.client?.email && (
                                <span className="text-xs text-text-secondary mt-0.5">
                                  {inv.client.email}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-text-secondary font-medium">
                            {inv.issuedDate ? new Date(inv.issuedDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-4 px-6 text-text-secondary font-medium">
                            {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-4 px-6 text-right font-black text-text-primary">
                            {getCurrencySymbol(inv.currency)}{Number(inv.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-6 text-center">
                            {getStatusBadge(inv.status)}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {inv.status !== 'paid' && (
                                <button
                                  onClick={() => handleMarkPaid(inv)}
                                  title="Mark as Paid"
                                  className="p-2 text-brand-success hover:bg-brand-success/15 rounded-lg active:scale-90 transition-all cursor-pointer"
                                >
                                  <CheckCircle className="h-4.5 w-4.5" />
                                </button>
                              )}
                              <Link
                                to={`/invoice/${inv._id}`}
                                title="View Invoice"
                                className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg active:scale-90 transition-all cursor-pointer"
                              >
                                <Eye className="h-4.5 w-4.5" />
                              </Link>
                              <Link
                                to={`/invoice/edit/${inv._id}`}
                                title="Edit Invoice"
                                className="p-2 text-text-secondary hover:bg-card-secondary rounded-lg active:scale-90 transition-all cursor-pointer"
                              >
                                <Edit className="h-4.5 w-4.5" />
                              </Link>
                              <button
                                onClick={() => handleDelete(inv._id)}
                                title="Delete Invoice"
                                className="p-2 text-brand-danger hover:bg-brand-danger/10 rounded-lg active:scale-90 transition-all cursor-pointer"
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </Layout>
      </SignedIn>
    </div>
  );
};

export default Home;
