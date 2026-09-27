import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useInvoiceApi } from '../api';
import Layout from '../components/Layout';
import {
  ArrowLeft,
  Printer,
  Edit,
  CheckCircle,
  Loader2,
  AlertTriangle
} from 'lucide-react';

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useInvoiceApi();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadInvoice = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getInvoice(id);
      if (res.success && res.data) {
        setInvoice(res.data);
      } else {
        setError(res.message || 'Invoice not found.');
      }
    } catch (err) {
      setError(err.message || 'Server error loading invoice details.');
    } finally {
      setLoading(false);
    }
  }, [api, id]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        loadInvoice();
      }
    });
    return () => {
      active = false;
    };
  }, [loadInvoice]);

  const handleMarkPaid = async () => {
    if (!invoice) return;
    try {
      setUpdating(true);
      const updatedData = { ...invoice, status: 'paid' };
      delete updatedData._id;
      delete updatedData.createdAt;
      delete updatedData.updatedAt;
      delete updatedData.__v;

      const res = await api.updateInvoice(id, updatedData);
      if (res.success) {
        loadInvoice();
      } else {
        alert(res.message || 'Failed to update invoice status.');
      }
    } catch (err) {
      alert(err.message || 'Error updating status.');
    } finally {
      setUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-success/10 text-brand-success">
            Paid
          </span>
        );
      case 'unpaid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-pending/10 text-brand-pending">
            Unpaid
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-danger/10 text-brand-danger">
            Overdue
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-card-secondary dark:text-slate-300 border border-border-app">
            Draft
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-app text-text-primary flex flex-col no-print">
        <Layout>
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
            <p className="text-sm font-medium text-text-secondary">Loading invoice...</p>
          </div>
        </Layout>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-bg-app text-text-primary flex flex-col no-print">
        <Layout>
          <div className="flex-1 max-w-xl mx-auto px-4 py-20 text-center">
            <AlertTriangle className="h-12 w-12 text-brand-danger mx-auto mb-4" />
            <h2 className="text-xl font-bold">Error Loading Invoice</h2>
            <p className="text-text-secondary mt-2">{error || 'The invoice coordinates could not be loaded.'}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl font-bold shadow-md cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </Layout>
      </div>
    );
  }

  const subtotal = (invoice.items || invoice.item || []).reduce((sum, item) => sum + (Number(item.quantity || 1) * Number(item.unitPrice || 0)), 0);
  const taxAmount = (subtotal * Number(invoice.taxPercent || 0)) / 100;
  const totalAmount = subtotal + taxAmount;

  return (
    <Layout>
      {/* Control bar */}
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-4 no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-app bg-bg-app/50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2.5 rounded-xl border border-border-app bg-white dark:bg-card-app hover:bg-slate-100 active:scale-95 text-text-secondary transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-text-primary flex items-center gap-2">
              Invoice details <span className="text-sm font-normal text-text-secondary">({invoice.invoiceNumber})</span>
            </h1>
            <div className="mt-1 flex items-center gap-2">
              {getStatusBadge(invoice.status)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {invoice.status !== 'paid' && (
            <button
              onClick={handleMarkPaid}
              disabled={updating}
              className="flex items-center gap-1.5 px-4.5 py-2.5 border border-brand-success/20 bg-brand-success/10 text-brand-success font-bold text-sm rounded-xl hover:bg-brand-success/20 active:scale-95 transition-colors cursor-pointer disabled:opacity-50"
            >
              {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4.5 w-4.5" />} Mark Paid
            </button>
          )}
          <Link
            to={`/invoice/edit/${invoice._id}`}
            className="flex items-center gap-1.5 px-4.5 py-2.5 border border-border-app bg-white dark:bg-card-app text-text-secondary font-bold text-sm rounded-xl hover:bg-slate-50 active:scale-95 transition-colors cursor-pointer"
          >
            <Edit className="h-4.5 w-4.5" /> Edit
          </Link>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover hover:shadow-brand-primary/15 active:scale-95 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Printer className="h-4.5 w-4.5" /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* Invoice sheet view */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 print-area flex justify-center animate-fade-in">
        
        {/* Printable Card */}
        <div className="bg-white text-slate-900 p-8 sm:p-14 rounded-2xl shadow-sm border border-slate-200/80 font-sans aspect-[1/1.414] w-full max-w-3xl overflow-hidden text-xs print:p-0 print:border-none print:shadow-none print:rounded-none hover-lift">
          
          {/* Header Coordinates */}
          <div className="flex justify-between items-start border-b border-slate-100 pb-6 mb-8">
            <div>
              {invoice.logoDataUrl ? (
                <img
                  src={invoice.logoDataUrl}
                  alt="Company Logo"
                  className="max-h-16 max-w-37.5 object-contain mb-4"
                />
              ) : (
                <div className="text-xl font-extrabold tracking-tight text-brand-primary mb-2 uppercase">
                  {invoice.fromBusinessName || 'Company Name'}
                </div>
              )}
              
              <div className="space-y-0.5 text-[10px] text-slate-555 leading-relaxed max-w-60">
                <p className="whitespace-pre-line font-medium text-slate-650">{invoice.fromAddress || 'Company Address Coordinates'}</p>
                {invoice.fromPhone && <p className="flex items-center gap-1"><span className="text-slate-400">Ph:</span> {invoice.fromPhone}</p>}
                {invoice.fromEmail && <p className="flex items-center gap-1"><span className="text-slate-400">Email:</span> {invoice.fromEmail}</p>}
                {invoice.fromGst && <p className="mt-1 font-bold uppercase text-slate-700">GSTIN: {invoice.fromGst}</p>}
              </div>
            </div>

            <div className="text-right">
              <h2 className="text-2xl font-black text-slate-800 tracking-widest mb-3 uppercase">INVOICE</h2>
              <div className="space-y-1 text-[10px] text-slate-500">
                <div><span className="font-semibold text-slate-700">Invoice No:</span> <span className="font-mono text-slate-800 text-xs font-semibold">{invoice.invoiceNumber || 'INV-XXXX'}</span></div>
                <div><span className="font-semibold text-slate-700">Issued Date:</span> {invoice.issuedDate ? new Date(invoice.issuedDate).toLocaleDateString() : 'N/A'}</div>
                <div><span className="font-semibold text-slate-700">Due Date:</span> {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</div>
                <div className="pt-1">
                  <span className="font-semibold text-slate-700">Status:</span> 
                  <span className={`ml-2 px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                    invoice.status === 'paid'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Client Details Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            <div>
              <div className="font-bold text-slate-405 uppercase text-[8px] tracking-widest mb-1.5">Billed To</div>
              <div className="font-bold text-slate-800 text-sm">{invoice.client?.name || 'Client Name'}</div>
              
              <div className="space-y-0.5 text-[10px] text-slate-505 mt-2 leading-relaxed max-w-70">
                {invoice.client?.email && <p><span className="text-slate-405 font-medium">Email:</span> {invoice.client.email}</p>}
                {invoice.client?.phone && <p><span className="text-slate-405 font-medium">Phone:</span> {invoice.client.phone}</p>}
                {invoice.client?.address && <p className="mt-1 whitespace-pre-line font-medium text-slate-600">{invoice.client.address}</p>}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mb-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[8px] tracking-widest">
                  <th className="py-2.5">Description</th>
                  <th className="py-2.5 text-center w-16">Quantity</th>
                  <th className="py-2.5 text-right w-24">Unit Price</th>
                  <th className="py-2.5 text-right w-28">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[10px]">
                {(invoice.items || invoice.item || []).map((item, index) => (
                  <tr key={item.id || index}>
                    <td className="py-3 font-semibold text-slate-850 whitespace-pre-line leading-relaxed pr-4">
                      {item.description || 'Consulting Services'}
                    </td>
                    <td className="py-3 text-center text-slate-555 font-semibold">
                      {item.quantity ?? item.qty ?? 1}
                    </td>
                    <td className="py-3 text-right text-slate-505 font-medium">
                      {getCurrencySymbol(invoice.currency)}{Number(item.unitPrice ?? item.price ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-right font-bold text-slate-850">
                      {getCurrencySymbol(invoice.currency)}{Number((item.quantity ?? item.qty ?? 1) * (item.unitPrice ?? item.price ?? 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial summary */}
          <div className="flex justify-between items-start gap-8 border-t border-slate-150 pt-5">
            <div className="text-[10px] text-slate-505 w-[55%] leading-relaxed whitespace-pre-line italic font-medium">
              {invoice.notes ? `Notes / Payment coordinates:\n${invoice.notes}` : ''}
            </div>

            <div className="w-[35%] text-right space-y-2 text-[10px]">
              <div className="flex justify-between text-slate-555 font-medium">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-700">
                  {getCurrencySymbol(invoice.currency)}{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {Number(invoice.taxPercent) > 0 && (
                <div className="flex justify-between text-slate-555 font-medium">
                  <span>Tax ({invoice.taxPercent}%):</span>
                  <span className="font-semibold text-slate-700">
                    {getCurrencySymbol(invoice.currency)}{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-slate-850 border-t border-slate-250 pt-2 font-bold text-sm">
                <span>Total Amount:</span>
                <span className="text-brand-primary font-bold">
                  {getCurrencySymbol(invoice.currency)}{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Branding footer */}
          <div className="mt-8 flex justify-center">
            <div className="px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-[8px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Made with AIInvoice
            </div>
          </div>

          {/* Signatures & Stamp section */}
          {(invoice.signatureName || invoice.signatureDataUrl || invoice.stampDataUrl) && (
            <div className="flex justify-end items-end gap-8 mt-8">
              
              {invoice.stampDataUrl && (
                <div className="flex flex-col items-center">
                  <img
                    src={invoice.stampDataUrl}
                    alt="Company Stamp"
                    className="h-16 w-16 object-contain opacity-85"
                  />
                  <span className="text-[7px] text-slate-400 uppercase tracking-widest mt-1">Stamp</span>
                </div>
              )}

              <div className="text-center w-36 border-t border-slate-100 pt-3 animate-fade-in">
                {invoice.signatureDataUrl ? (
                  <img
                    src={invoice.signatureDataUrl}
                    alt="Authorized Signature"
                    className="h-12 w-28 object-contain mx-auto mb-1"
                  />
                ) : (
                  <div className="h-12"></div>
                )}
                <div className="font-bold text-slate-800 text-[10px]">{invoice.signatureName || 'Signatory Name'}</div>
                <div className="text-[7px] text-slate-400 uppercase tracking-wider">{invoice.signatureTitle || 'Authorized Signatory'}</div>
              </div>

            </div>
          )}

        </div>
      </div>
    </Layout>
  );
};

export default InvoiceDetails;
