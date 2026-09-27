import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useInvoiceApi } from '../api';
import Layout from '../components/Layout';
import {
  Sparkles,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Loader2,
  Eye,
  Edit3,
  FileImage
} from 'lucide-react';

const InvoiceEditor = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const api = useInvoiceApi();

  const isEditMode = !!id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState(() =>
    searchParams.get('mode') === 'ai' ? 'Create an invoice for ...' : ''
  );
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(() =>
    searchParams.get('mode') === 'ai' ? 'edit' : 'edit'
  );

  // Invoice Form Fields
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issuedDate, setIssuedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14); 
    return d.toISOString().slice(0, 10);
  });
  const [currency, setCurrency] = useState('INR');
  const [status, setStatus] = useState('draft');
  const [taxPercent, setTaxPercent] = useState(18);
  const [notes, setNotes] = useState('');

  // From Business Coordinates
  const [fromBusinessName, setFromBusinessName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [fromAddress, setFromAddress] = useState('');
  const [fromPhone, setFromPhone] = useState('');
  const [fromGst, setFromGst] = useState('');

  // Client Coordinates
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  // Line items
  const [items, setItems] = useState([
    { id: '1', description: '', quantity: 1, unitPrice: 0 }
  ]);

  // Assets and Signature Overrides
  const [signatureName, setSignatureName] = useState('');
  const [signatureTitle, setSignatureTitle] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [stampFile, setStampFile] = useState(null);
  const [sigFile, setSigFile] = useState(null);

  // Existing image urls
  const [logoUrl, setLogoUrl] = useState('');
  const [stampUrl, setStampUrl] = useState('');
  const [signatureUrl, setSignatureUrl] = useState('');

  // File Preview urls
  const [logoPreview, setLogoPreview] = useState('');
  const [stampPreview, setStampPreview] = useState('');
  const [sigPreview, setSigPreview] = useState('');

  // Image input refs
  const logoInputRef = useRef();
  const stampInputRef = useRef();
  const sigInputRef = useRef();

  // Handle Query Param for AI parsing auto-focus

  // Load defaults and data
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        setError('');

        let profileDefaults = null;
        try {
          const profileRes = await api.getProfile();
          if (profileRes.success && profileRes.data) {
            profileDefaults = profileRes.data;
          }
        } catch {
          console.log('No default profile loaded or server connection issue.');
        }

        if (isEditMode) {
          const invoiceRes = await api.getInvoice(id);
          if (invoiceRes.success && invoiceRes.data) {
            const inv = invoiceRes.data;
            setInvoiceNumber(inv.invoiceNumber || '');
            if (inv.issuedDate) setIssuedDate(new Date(inv.issuedDate).toISOString().slice(0, 10));
            if (inv.dueDate) setDueDate(new Date(inv.dueDate).toISOString().slice(0, 10));
            setCurrency(inv.currency || 'INR');
            setStatus(inv.status || 'draft');
            setTaxPercent(inv.taxPercent ?? 18);
            setNotes(inv.notes || '');

            setFromBusinessName(inv.fromBusinessName || '');
            setFromEmail(inv.fromEmail || '');
            setFromAddress(inv.fromAddress || '');
            setFromPhone(inv.fromPhone || '');
            setFromGst(inv.fromGst || '');

            setClientName(inv.client?.name || '');
            setClientEmail(inv.client?.email || '');
            setClientPhone(inv.client?.phone || '');
            setClientAddress(inv.client?.address || '');

            const loadedItems = inv.items || inv.item || [];
            if (loadedItems.length > 0) {
              setItems(loadedItems.map((item, index) => ({
                id: item.id || String(index + 1),
                description: item.description || '',
                quantity: Number(item.quantity ?? item.qty ?? 1),
                unitPrice: Number(item.unitPrice ?? item.price ?? 0),
              })));
            } else {
              setItems([{ id: '1', description: '', quantity: 1, unitPrice: 0 }]);
            }

            setSignatureName(inv.signatureName || '');
            setSignatureTitle(inv.signatureTitle || '');
            setLogoUrl(inv.logoDataUrl || '');
            setStampUrl(inv.stampDataUrl || '');
            setSignatureUrl(inv.signatureDataUrl || '');
          } else {
            setError('Failed to load invoice coordinates.');
          }
        } else {
          if (profileDefaults) {
            setFromBusinessName(profileDefaults.businessName || '');
            setFromEmail(profileDefaults.email || '');
            setFromAddress(profileDefaults.address || '');
            setFromPhone(profileDefaults.phone || '');
            setFromGst(profileDefaults.gst || '');
            setTaxPercent(profileDefaults.defaultTaxPercent ?? 18);
            setSignatureName(profileDefaults.signatureOwnerName || '');
            setSignatureTitle(profileDefaults.signatureOwnerTitle || '');
            setLogoUrl(profileDefaults.logoUrl || '');
            setStampUrl(profileDefaults.stampUrl || '');
            setSignatureUrl(profileDefaults.signatureUrl || '');
          }

          const candidateNumber = `INV-${Date.now().toString().slice(-5)}-${Math.floor(1000 + Math.random() * 9000)}`;
          setInvoiceNumber(candidateNumber);
        }
      } catch (err) {
        setError('Error initializing invoice editor: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [api, id, isEditMode]);

  // Handle files overrides selection
  const handleFileOverride = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'logo') {
        setLogoFile(file);
        setLogoPreview(reader.result);
      } else if (type === 'stamp') {
        setStampFile(file);
        setStampPreview(reader.result);
      } else if (type === 'signature') {
        setSigFile(file);
        setSigPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // AI Prompt generation trigger
  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      alert('Please enter a details prompt first.');
      return;
    }

    try {
      setAiGenerating(true);
      setError('');
      const res = await api.generateInvoiceData(aiPrompt);

      if (res.success && res.data) {
        const d = res.data;
        if (d.invoiceNumber) setInvoiceNumber(d.invoiceNumber);
        if (d.issuedDate) setIssuedDate(new Date(d.issuedDate).toISOString().slice(0, 10));
        if (d.dueDate) setDueDate(new Date(d.dueDate).toISOString().slice(0, 10));
        if (d.taxPercent !== undefined) setTaxPercent(Number(d.taxPercent));
        if (d.notes) setNotes(d.notes);

        if (d.fromBusinessName) setFromBusinessName(d.fromBusinessName);
        if (d.fromEmail) setFromEmail(d.fromEmail);
        if (d.fromAddress) setFromAddress(d.fromAddress);
        if (d.fromPhone) setFromPhone(d.fromPhone);

        if (d.client) {
          if (d.client.name) setClientName(d.client.name);
          if (d.client.email) setClientEmail(d.client.email);
          if (d.client.phone) setClientPhone(d.client.phone);
          if (d.client.address) setClientAddress(d.client.address);
        }

        if (Array.isArray(d.items) && d.items.length > 0) {
          setItems(d.items.map((item, idx) => ({
            id: item.id || String(idx + 1),
            description: item.description || item.desc || '',
            quantity: Number(item.quantity ?? item.qty ?? 1),
            unitPrice: Number(item.unitPrice ?? item.price ?? 0),
          })));
        }
      } else {
        setError(res.message || 'AI failed to parse the prompt. Try again with more details.');
      }
    } catch (err) {
      setError('AI generation failed: ' + err.message);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleItemChange = (idx, field, value) => {
    const updated = [...items];
    if (field === 'quantity') {
      updated[idx].quantity = Number(value);
    } else if (field === 'unitPrice') {
      updated[idx].unitPrice = Number(value);
    } else {
      updated[idx][field] = value;
    }
    setItems(updated);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      { id: String(items.length + 1), description: '', quantity: 1, unitPrice: 0 }
    ]);
  };

  const removeItemRow = (idx) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxAmount = (subtotal * Number(taxPercent || 0)) / 100;
  const totalAmount = subtotal + taxAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!invoiceNumber.trim()) {
      alert('Invoice Number is required.');
      return;
    }
    if (!clientName.trim()) {
      alert('Client Name is required.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const formData = new FormData();
      formData.append('invoiceNumber', invoiceNumber.trim());
      formData.append('issuedDate', issuedDate);
      formData.append('dueDate', dueDate);
      formData.append('currency', currency);
      formData.append('status', status);
      formData.append('taxPercent', Number(taxPercent));
      formData.append('notes', notes);

      formData.append('fromBusinessName', fromBusinessName);
      formData.append('fromEmail', fromEmail);
      formData.append('fromAddress', fromAddress);
      formData.append('fromPhone', fromPhone);
      formData.append('fromGst', fromGst);

      formData.append('client[name]', clientName);
      formData.append('client[email]', clientEmail);
      formData.append('client[phone]', clientPhone);
      formData.append('client[address]', clientAddress);

      formData.append('items', JSON.stringify(items));

      formData.append('signatureName', signatureName);
      formData.append('signatureTitle', signatureTitle);

      if (logoFile) formData.append('logo', logoFile);
      if (stampFile) formData.append('stamp', stampFile);
      if (sigFile) formData.append('signature', sigFile);

      if (!logoFile && logoUrl) formData.append('logoDataUrl', logoUrl);
      if (!stampFile && stampUrl) formData.append('stampDataUrl', stampUrl);
      if (!sigFile && signatureUrl) formData.append('signatureDataUrl', signatureUrl);

      let res;
      if (isEditMode) {
        res = await api.updateInvoice(id, formData);
      } else {
        res = await api.createInvoice(formData);
      }

      if (res.success) {
        navigate('/');
      } else {
        setError(res.message || 'Failed to save invoice.');
      }
    } catch (err) {
      setError(err.message || 'Server error saving invoice.');
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-app text-text-primary flex flex-col">
        <Layout>
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
            <p className="text-sm font-medium text-text-secondary">Loading invoice coordinates...</p>
          </div>
        </Layout>
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
        
        {/* Header with back navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2.5 rounded-xl border border-border-app bg-white dark:bg-card-app hover:bg-slate-100 active:scale-95 text-text-secondary transition-all cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                {isEditMode ? 'Edit Invoice' : 'Create New Invoice'}
              </h1>
              <p className="text-text-secondary text-sm mt-0.5 font-medium">
                {isEditMode ? `Updating ${invoiceNumber}` : 'Draft invoice details or generate with AI.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex md:hidden border border-border-app rounded-xl bg-white dark:bg-card-app p-1">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'edit'
                    ? 'bg-brand-primary text-white shadow-md'
                    : 'text-text-secondary hover:bg-slate-500/10'
                }`}
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'preview'
                    ? 'bg-brand-primary text-white shadow-md'
                    : 'text-text-secondary hover:bg-slate-500/10'
                }`}
              >
                <Eye className="h-3.5 w-3.5" /> Live Preview
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-3 bg-brand-primary hover:bg-brand-primary-hover hover:shadow-brand-primary/15 active:scale-95 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Invoice
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-brand-danger/5 border border-brand-danger/20 text-brand-danger flex items-center gap-2 text-sm animate-fade-in font-semibold">
            {error}
          </div>
        )}

        {/* Outer Split panes */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* LEFT CONTAINER FORM */}
          <div className={`md:col-span-7 space-y-6 ${activeTab !== 'edit' ? 'hidden md:block' : ''}`}>
            
            {/* AI Prompter Box */}
            <div className="bg-gradient-to-br from-brand-primary/10 to-brand-secondary/5 border border-brand-primary/15 p-5 rounded-2xl shadow-sm hover-glow">
              <h3 className="text-sm font-bold text-brand-primary flex items-center gap-1.5 mb-3">
                <Sparkles className="h-4.5 w-4.5 text-brand-primary animate-pulse" /> Generate with AI Assistant
              </h3>
              <p className="text-xs text-text-secondary mb-3 leading-relaxed font-medium">
                Enter details like client coordinates, dates, items quantity, unit pricing, or discount rates. The AI will extract and structure them on your form automatically.
              </p>
              <div className="space-y-3">
                <textarea
                  rows="3"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Create an invoice to Microsoft for 5 custom websites at $1,200 each, plus 18% tax percent. Set dueDate to 20th August 2026."
                  className="w-full px-4 py-2.5 rounded-xl border border-border-app bg-white dark:bg-slate-950 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all placeholder-slate-400 font-medium"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAiGenerate}
                    disabled={aiGenerating || !aiPrompt.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {aiGenerating ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" /> Parse Invoice
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Standard Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Box 1: General Info */}
              <div className="bg-card-app border border-border-app p-5 rounded-2xl shadow-sm space-y-4 hover-lift">
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">Invoice Metadata</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Invoice Number *</label>
                    <input
                      type="text"
                      required
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border-app bg-white dark:bg-slate-950 text-text-primary text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border-app bg-white dark:bg-slate-950 text-text-primary text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none font-semibold cursor-pointer"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Issued Date</label>
                    <input
                      type="date"
                      value={issuedDate}
                      onChange={(e) => setIssuedDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border-app bg-white dark:bg-slate-950 text-text-primary text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border-app bg-white dark:bg-slate-950 text-text-primary text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none font-medium"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border-app bg-white dark:bg-slate-950 text-text-primary text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none font-semibold cursor-pointer"
                    >
                      <option value="draft">Draft</option>
                      <option value="unpaid">Unpaid</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Box 2: Sender Details */}
              <div className="bg-card-app border border-border-app p-5 rounded-2xl shadow-sm space-y-4 hover-lift">
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">From (Your Business details)</h3>
                
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      value={fromBusinessName}
                      onChange={(e) => setFromBusinessName(e.target.value)}
                      placeholder="Business Name"
                      className="w-full px-3 py-2 rounded-lg border border-border-app bg-white dark:bg-slate-950 text-text-primary text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none font-medium"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="email"
                      value={fromEmail}
                      onChange={(e) => setFromEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full px-3 py-2 rounded-lg border border-border-app bg-white dark:bg-slate-950 text-text-primary text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none font-medium"
                    />
                    <input
                      type="text"
                      value={fromPhone}
                      onChange={(e) => setFromPhone(e.target.value)}
                      placeholder="Phone Number"
                      className="w-full px-3 py-2 rounded-lg border border-border-app bg-white dark:bg-slate-950 text-text-primary text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none font-medium"
                    />
                  </div>

                  <textarea
                    rows="2"
                    value={fromAddress}
                    onChange={(e) => setFromAddress(e.target.value)}
                    placeholder="Address Coordinates"
                    className="w-full px-3 py-2 rounded-lg border border-border-app bg-white dark:bg-slate-950 text-text-primary text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none font-medium"
                  />

                  <input
                    type="text"
                    value={fromGst}
                    onChange={(e) => setFromGst(e.target.value)}
                    placeholder="GSTIN / Tax ID"
                    className="w-full px-3 py-2 rounded-lg border border-border-app bg-white dark:bg-slate-950 text-text-primary text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none uppercase font-mono font-semibold"
                  />
                </div>
              </div>

              {/* Box 3: Client Details */}
              <div className="bg-card-app border border-border-app p-5 rounded-2xl shadow-sm space-y-4 hover-lift">
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">Client (Bill To)</h3>
                
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Client Name *"
                      className="w-full px-3 py-2 rounded-lg border border-border-app bg-white dark:bg-slate-950 text-text-primary text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none font-bold"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="Client Email"
                      className="w-full px-3 py-2 rounded-lg border border-border-app bg-white dark:bg-slate-950 text-text-primary text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none font-medium"
                    />
                    <input
                      type="text"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="Client Phone"
                      className="w-full px-3 py-2 rounded-lg border border-border-app bg-white dark:bg-slate-950 text-text-primary text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none font-medium"
                    />
                  </div>

                  <textarea
                    rows="2"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="Client Address"
                    className="w-full px-3 py-2 rounded-lg border border-border-app bg-white dark:bg-slate-950 text-text-primary text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Box 4: Items Table */}
              <div className="bg-card-app border border-border-app p-5 rounded-2xl shadow-sm space-y-4 hover-lift">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">Line Items</h3>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-brand-primary/20 bg-brand-primary/5 text-brand-primary text-xs font-bold rounded-lg hover:bg-brand-primary/10 active:scale-95 transition-transform cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Row
                  </button>
                </div>
                
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={item.id} className="flex gap-2.5 items-start bg-slate-50/50 dark:bg-card-secondary/40 p-3 rounded-xl border border-border-app">
                      
                      <div className="flex-1">
                        <label className="block text-[10px] text-text-secondary mb-0.5 font-bold uppercase tracking-wider">Description</label>
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          placeholder="e.g. Website Consulting Services"
                          className="w-full px-2.5 py-1.5 rounded-md border border-border-app bg-white dark:bg-slate-950 text-text-primary text-xs focus:ring-1 focus:ring-brand-primary focus:outline-none font-medium"
                        />
                      </div>

                      <div className="w-16">
                        <label className="block text-[10px] text-text-secondary mb-0.5 font-bold uppercase tracking-wider">Qty</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-md border border-border-app bg-white dark:bg-slate-950 text-text-primary text-xs focus:ring-1 focus:ring-brand-primary focus:outline-none font-semibold text-center"
                        />
                      </div>

                      <div className="w-24">
                        <label className="block text-[10px] text-text-secondary mb-0.5 font-bold uppercase tracking-wider">Price</label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-md border border-border-app bg-white dark:bg-slate-950 text-text-primary text-xs focus:ring-1 focus:ring-brand-primary focus:outline-none font-semibold text-right"
                        />
                      </div>

                      <div className="self-end pb-0.5">
                        <button
                          type="button"
                          disabled={items.length === 1}
                          onClick={() => removeItemRow(idx)}
                          className="p-1.5 text-brand-danger hover:bg-brand-danger/10 rounded-md transition-all active:scale-90 disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-3 border-t border-border-app">
                  <div className="flex items-center gap-2 w-32">
                    <label className="text-[11px] font-bold text-text-secondary shrink-0 uppercase tracking-wider">Tax Rate (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={taxPercent}
                      onChange={(e) => setTaxPercent(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-md border border-border-app bg-white dark:bg-slate-950 text-text-primary text-xs focus:ring-1 focus:ring-brand-primary focus:outline-none text-right font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Box 5: Signatory Authority, Upload Overrides & Notes */}
              <div className="bg-card-app border border-border-app p-5 rounded-2xl shadow-sm space-y-5 hover-lift">
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">Stamp, Signature & Notes</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Signatory Name</label>
                    <input
                      type="text"
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-3 py-2 rounded-lg border border-border-app bg-white dark:bg-slate-950 text-text-primary text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Signatory Title</label>
                    <input
                      type="text"
                      value={signatureTitle}
                      onChange={(e) => setSignatureTitle(e.target.value)}
                      placeholder="Director"
                      className="w-full px-3 py-2 rounded-lg border border-border-app bg-white dark:bg-slate-950 text-text-primary text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  <div className="flex flex-col items-center p-3 border border-border-app rounded-xl bg-slate-50/50 dark:bg-card-secondary/40">
                    <span className="text-[9px] font-bold text-text-secondary mb-2 uppercase tracking-wider">Logo Override</span>
                    <button
                      type="button"
                      onClick={() => logoInputRef.current.click()}
                      className="p-2.5 border border-border-app bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-text-secondary transition-all active:scale-90 cursor-pointer"
                    >
                      <FileImage className="h-4.5 w-4.5 text-brand-primary" />
                    </button>
                    <input
                      type="file"
                      ref={logoInputRef}
                      accept="image/*"
                      onChange={(e) => handleFileOverride(e, 'logo')}
                      className="hidden"
                    />
                    {(logoPreview || logoUrl) && <span className="text-[8px] text-brand-success mt-1 font-bold">Active</span>}
                  </div>

                  <div className="flex flex-col items-center p-3 border border-border-app rounded-xl bg-slate-50/50 dark:bg-card-secondary/40">
                    <span className="text-[9px] font-bold text-text-secondary mb-2 uppercase tracking-wider">Stamp Override</span>
                    <button
                      type="button"
                      onClick={() => stampInputRef.current.click()}
                      className="p-2.5 border border-border-app bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-text-secondary transition-all active:scale-90 cursor-pointer"
                    >
                      <FileImage className="h-4.5 w-4.5 text-brand-primary" />
                    </button>
                    <input
                      type="file"
                      ref={stampInputRef}
                      accept="image/*"
                      onChange={(e) => handleFileOverride(e, 'stamp')}
                      className="hidden"
                    />
                    {(stampPreview || stampUrl) && <span className="text-[8px] text-brand-success mt-1 font-bold">Active</span>}
                  </div>

                  <div className="flex flex-col items-center p-3 border border-border-app rounded-xl bg-slate-50/50 dark:bg-card-secondary/40">
                    <span className="text-[9px] font-bold text-text-secondary mb-2 uppercase tracking-wider">Signature Override</span>
                    <button
                      type="button"
                      onClick={() => sigInputRef.current.click()}
                      className="p-2.5 border border-border-app bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-text-secondary transition-all active:scale-90 cursor-pointer"
                    >
                      <FileImage className="h-4.5 w-4.5 text-brand-primary" />
                    </button>
                    <input
                      type="file"
                      ref={sigInputRef}
                      accept="image/*"
                      onChange={(e) => handleFileOverride(e, 'signature')}
                      className="hidden"
                    />
                    {(sigPreview || signatureUrl) && <span className="text-[8px] text-brand-success mt-1 font-bold">Active</span>}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Notes & Payment Details</label>
                  <textarea
                    rows="3"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Bank Account: XYZ, IFSC: ABC1234, Notes: Thanks for your business!"
                    className="w-full px-3 py-2 rounded-lg border border-border-app bg-white dark:bg-slate-950 text-text-primary text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none font-medium"
                  />
                </div>
              </div>

            </form>
          </div>

          {/* RIGHT CONTAINER LIVE PREVIEW */}
          <div className={`md:col-span-5 ${activeTab !== 'preview' ? 'hidden md:block' : 'block'} sticky top-24`}>
            <div className="bg-slate-100 dark:bg-card-secondary/60 rounded-2xl p-2 border border-border-app shadow-inner hover:shadow-brand-primary/5 transition-all">
              
              <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200/80 font-sans aspect-[1/1.4] w-full max-w-full overflow-hidden text-xs">
                
                {/* Invoice Header */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-5">
                  <div>
                    {logoPreview || logoUrl ? (
                      <img
                        src={logoPreview || logoUrl}
                        alt="Company Logo"
                        className="max-h-12 max-w-[120px] object-contain mb-3"
                      />
                    ) : (
                      <div className="text-base font-extrabold tracking-tight text-brand-primary mb-1">
                        {fromBusinessName || 'Company Name'}
                      </div>
                    )}
                    <p className="text-[9px] text-slate-500 leading-normal max-w-[180px] whitespace-pre-line font-medium">
                      {fromAddress || 'Company coordinates address goes here'}
                    </p>
                    {fromPhone && <p className="text-[9px] text-slate-500 mt-0.5 font-medium">Ph: {fromPhone}</p>}
                    {fromEmail && <p className="text-[9px] text-slate-500 font-medium">Email: {fromEmail}</p>}
                    {fromGst && <p className="text-[9px] text-slate-500 uppercase font-bold">GSTIN: {fromGst}</p>}
                  </div>
                  
                  <div className="text-right">
                    <h2 className="text-lg font-bold text-slate-800 tracking-wider mb-2 uppercase">INVOICE</h2>
                    <div className="space-y-0.5 text-[9px] text-slate-500">
                      <div><span className="font-semibold text-slate-700">Invoice No:</span> <span className="font-mono font-semibold text-slate-800">{invoiceNumber || 'INV-XXXX'}</span></div>
                      <div><span className="font-semibold text-slate-700">Date:</span> {issuedDate ? new Date(issuedDate).toLocaleDateString() : 'N/A'}</div>
                      <div><span className="font-semibold text-slate-700">Due Date:</span> {dueDate ? new Date(dueDate).toLocaleDateString() : 'N/A'}</div>
                      <div>
                        <span className="font-semibold text-slate-700">Status:</span> 
                        <span className={`ml-1 font-bold uppercase ${status === 'paid' ? 'text-brand-success' : 'text-brand-pending'}`}>
                          {status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client Box */}
                <div className="mb-5 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                  <div className="font-semibold text-slate-400 uppercase text-[8px] tracking-wider mb-1">Billed To</div>
                  <div className="font-bold text-slate-800 text-[11px]">{clientName || 'Client Name'}</div>
                  {clientEmail && <div className="text-[9px] text-slate-500 mt-0.5">{clientEmail}</div>}
                  {clientPhone && <div className="text-[9px] text-slate-500">{clientPhone}</div>}
                  {clientAddress && (
                    <div className="text-[9px] text-slate-500 mt-1 leading-normal max-w-[260px] whitespace-pre-line font-medium">
                      {clientAddress}
                    </div>
                  )}
                </div>

                {/* Items preview table */}
                <table className="w-full text-left border-collapse mb-5">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[8px] tracking-wider">
                      <th className="py-2">Description</th>
                      <th className="py-2 text-center w-12">Qty</th>
                      <th className="py-2 text-right w-20">Unit Price</th>
                      <th className="py-2 text-right w-24">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[10px]">
                    {items.map((item, index) => (
                      <tr key={item.id || index}>
                        <td className="py-2 font-semibold text-slate-800 max-w-[150px] truncate">{item.description || 'Item description'}</td>
                        <td className="py-2 text-center text-slate-500 font-medium">{item.quantity}</td>
                        <td className="py-2 text-right text-slate-500 font-medium">
                          {getCurrencySymbol(currency)}{Number(item.unitPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 text-right font-bold text-slate-900">
                          {getCurrencySymbol(currency)}{Number(item.quantity * item.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Financial Summary */}
                <div className="flex justify-between items-start gap-4 border-t border-slate-100 pt-3">
                  <div className="text-[9px] text-slate-500 w-[55%] leading-normal italic whitespace-pre-line font-medium">
                    {notes ? `Notes:\n${notes}` : ''}
                  </div>

                  <div className="w-[40%] text-right space-y-1.5 text-[10px]">
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-slate-700">
                        {getCurrencySymbol(currency)}{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {Number(taxPercent) > 0 && (
                      <div className="flex justify-between text-slate-500 font-medium">
                        <span>Tax ({taxPercent}%):</span>
                        <span className="font-semibold text-slate-700">
                          {getCurrencySymbol(currency)}{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-800 border-t border-slate-100 pt-1.5 font-bold text-[11px]">
                      <span>Total Due:</span>
                      <span className="text-brand-primary font-bold">
                        {getCurrencySymbol(currency)}{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Signature Panel */}
                {(signatureName || sigPreview || signatureUrl || stampPreview || stampUrl) && (
                  <div className="flex justify-end items-end gap-6 mt-8">
                    {(stampPreview || stampUrl) && (
                      <div className="flex flex-col items-center">
                        <img
                          src={stampPreview || stampUrl}
                          alt="Company Stamp"
                          className="h-12 w-12 object-contain opacity-80"
                        />
                        <span className="text-[7px] text-slate-400 uppercase tracking-widest mt-1">Stamp</span>
                      </div>
                    )}

                    <div className="text-center w-28">
                      {sigPreview || signatureUrl ? (
                        <img
                          src={sigPreview || signatureUrl}
                          alt="Authorized Signature"
                          className="h-10 w-24 object-contain mx-auto mb-1 border-b border-slate-200 pb-1"
                        />
                      ) : (
                        <div className="h-8 border-b border-slate-200 mb-1"></div>
                      )}
                      <div className="font-bold text-slate-800 text-[9px]">{signatureName || 'Signatory Name'}</div>
                      <div className="text-[7px] text-slate-400 uppercase tracking-wider">{signatureTitle || 'Authorized Signatory'}</div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default InvoiceEditor;
