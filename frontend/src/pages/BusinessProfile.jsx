import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoiceApi } from '../api';
import Layout from '../components/Layout';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Percent,
  User,
  ShieldAlert,
  Loader2,
  Save,
  Image,
  UploadCloud,
  FileCheck,
  CheckCircle2
} from 'lucide-react';

const BusinessProfile = () => {
  const api = useInvoiceApi();
  const navigate = useNavigate();

  const [profileId, setProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [gst, setGst] = useState('');
  const [signatureOwnerName, setSignatureOwnerName] = useState('');
  const [signatureOwnerTitle, setSignatureOwnerTitle] = useState('');
  const [defaultTaxPercent, setDefaultTaxPercent] = useState(18);

  // File states
  const [logoFile, setLogoFile] = useState(null);
  const [stampFile, setStampFile] = useState(null);
  const [sigFile, setSigFile] = useState(null);

  // Existing image urls
  const [logoUrl, setLogoUrl] = useState('');
  const [stampUrl, setStampUrl] = useState('');
  const [signatureUrl, setSignatureUrl] = useState('');

  // File preview states
  const [logoPreview, setLogoPreview] = useState('');
  const [stampPreview, setStampPreview] = useState('');
  const [sigPreview, setSigPreview] = useState('');

  // Refs for hidden inputs
  const logoInputRef = useRef();
  const stampInputRef = useRef();
  const sigInputRef = useRef();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.getProfile();
        
        if (res.success && res.data) {
          const p = res.data;
          setProfileId(p._id);
          setBusinessName(p.businessName || '');
          setEmail(p.email || '');
          setAddress(p.address || '');
          setPhone(p.phone || '');
          setGst(p.gst || '');
          setSignatureOwnerName(p.signatureOwnerName || '');
          setSignatureOwnerTitle(p.signatureOwnerTitle || '');
          setDefaultTaxPercent(p.defaultTaxPercent ?? 18);
          setLogoUrl(p.logoUrl || '');
          setStampUrl(p.stampUrl || '');
          setSignatureUrl(p.signatureUrl || '');
        }
      } catch (err) {
        if (err?.message && (err.message.includes('404') || err.message.toLowerCase().includes('not found'))) {
          console.log('No profile exists yet. Ready to create.');
        } else {
          setError('Error loading business profile. Make sure server is running.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [api]);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds the 5MB limit.');
      return;
    }

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setError('Business Name is required.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccessMsg('');

      const formData = new FormData();
      formData.append('businessName', businessName);
      formData.append('email', email);
      formData.append('address', address);
      formData.append('phone', phone);
      formData.append('gst', gst);
      formData.append('signatureOwnerName', signatureOwnerName);
      formData.append('signatureOwnerTitle', signatureOwnerTitle);
      formData.append('defaultTaxPercent', Number(defaultTaxPercent));

      if (logoFile) formData.append('logoName', logoFile);
      if (stampFile) formData.append('stampName', stampFile);
      
      if (sigFile) {
        formData.append('signature', sigFile);
        formData.append('signatureNameMeta', sigFile);
      }

      let res;
      if (profileId) {
        res = await api.updateProfile(profileId, formData);
      } else {
        res = await api.createProfile(formData);
      }

      if (res.success) {
        setSuccessMsg(res.message || 'Profile saved successfully!');
        if (res.data && res.data._id) {
          setProfileId(res.data._id);
          setLogoUrl(res.data.logoUrl || '');
          setStampUrl(res.data.stampUrl || '');
          setSignatureUrl(res.data.signatureUrl || '');
        }
        setLogoFile(null);
        setStampFile(null);
        setSigFile(null);
        setLogoPreview('');
        setStampPreview('');
        setSigPreview('');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setError(res.message || 'Failed to save profile');
      }
    } catch (err) {
      setError(err.message || 'Server error saving profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-app text-text-primary flex flex-col">
        <Layout>
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
            <p className="text-sm font-medium text-text-secondary">Loading business profile...</p>
          </div>
        </Layout>
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary flex items-center gap-2">
            <Building2 className="h-7 w-7 text-brand-primary" /> Business Profile
          </h1>
          <p className="text-text-secondary text-sm mt-1 font-medium">
            Set up details and defaults to populate instantly on your invoices.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-brand-danger/5 border border-brand-danger/20 text-brand-danger flex items-center gap-2 text-sm font-semibold">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-brand-success/5 border border-brand-success/20 text-brand-success flex items-center gap-2 text-sm animate-fade-in font-semibold">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-card-app border border-border-app rounded-2xl shadow-sm overflow-hidden hover-lift">
          <div className="p-6 sm:p-8 space-y-8">
            
            {/* Business info section */}
            <div>
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">Company Profile Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Business Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Business Name *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-text-secondary" />
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Acme Software Solutions"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border-app bg-white dark:bg-slate-950 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all font-semibold"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Business Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-text-secondary" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="billing@acme.com"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border-app bg-white dark:bg-slate-950 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all font-semibold"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-text-secondary" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border-app bg-white dark:bg-slate-950 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all font-semibold"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Registered Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 h-4.5 w-4.5 text-text-secondary" />
                    <textarea
                      rows="3"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Floor 4, Block B, Tech Hub, Mumbai, 400001"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border-app bg-white dark:bg-slate-950 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all font-semibold"
                    />
                  </div>
                </div>

                {/* GST / Tax Number */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">GSTIN / Tax ID</label>
                  <input
                    type="text"
                    value={gst}
                    onChange={(e) => setGst(e.target.value)}
                    placeholder="27AAAAA1111A1Z1"
                    className="w-full px-4 py-2.5 rounded-xl border border-border-app bg-white dark:bg-slate-950 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all font-mono uppercase font-semibold"
                  />
                </div>

                {/* Default Tax Rate */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Default Tax Rate (%)</label>
                  <div className="relative">
                    <Percent className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-text-secondary" />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={defaultTaxPercent}
                      onChange={(e) => setDefaultTaxPercent(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border-app bg-white dark:bg-slate-950 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all font-bold"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Signature Authority section */}
            <div>
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">Authorized Signature Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Signatory Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-text-secondary" />
                    <input
                      type="text"
                      value={signatureOwnerName}
                      onChange={(e) => setSignatureOwnerName(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border-app bg-white dark:bg-slate-950 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Signatory Title</label>
                  <input
                    type="text"
                    value={signatureOwnerTitle}
                    onChange={(e) => setSignatureOwnerTitle(e.target.value)}
                    placeholder="e.g. Managing Director"
                    className="w-full px-4 py-2.5 rounded-xl border border-border-app bg-white dark:bg-slate-950 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Image assets uploads */}
            <div>
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-6">Company Brand & Assets</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Logo Upload Card */}
                <div className="flex flex-col items-center p-5 border border-border-app rounded-2xl bg-slate-50/50 dark:bg-card-secondary/40 transition-all">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-4 text-center">Company Logo</label>
                  <div
                    onClick={() => logoInputRef.current.click()}
                    className="w-32 h-32 rounded-2xl border-2 border-dashed border-border-app flex items-center justify-center overflow-hidden cursor-pointer hover:border-brand-primary/50 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 active:scale-95 transition-all relative group"
                  >
                    {logoPreview || logoUrl ? (
                      <>
                        <img
                          src={logoPreview || logoUrl}
                          alt="Logo Preview"
                          className="w-full h-full object-contain p-2"
                        />
                        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <UploadCloud className="h-6 w-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-slate-400 text-center px-2">
                        <Image className="h-6 w-6 text-brand-primary/80" />
                        <span className="text-[10px] font-bold">Select Logo</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={logoInputRef}
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'logo')}
                    className="hidden"
                  />
                  {(logoPreview || logoUrl) && (
                    <span className="text-[10px] text-brand-success font-bold mt-3 flex items-center gap-1">
                      <FileCheck className="h-3.5 w-3.5 text-brand-success" /> Image Active
                    </span>
                  )}
                </div>

                {/* Stamp Upload Card */}
                <div className="flex flex-col items-center p-5 border border-border-app rounded-2xl bg-slate-50/50 dark:bg-card-secondary/40 transition-all">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-4 text-center">Company Stamp</label>
                  <div
                    onClick={() => stampInputRef.current.click()}
                    className="w-32 h-32 rounded-2xl border-2 border-dashed border-border-app flex items-center justify-center overflow-hidden cursor-pointer hover:border-brand-primary/50 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 active:scale-95 transition-all relative group"
                  >
                    {stampPreview || stampUrl ? (
                      <>
                        <img
                          src={stampPreview || stampUrl}
                          alt="Stamp Preview"
                          className="w-full h-full object-contain p-2"
                        />
                        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <UploadCloud className="h-6 w-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-slate-400 text-center px-2">
                        <Image className="h-6 w-6 text-brand-primary/80" />
                        <span className="text-[10px] font-bold">Select Stamp</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={stampInputRef}
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'stamp')}
                    className="hidden"
                  />
                  {(stampPreview || stampUrl) && (
                    <span className="text-[10px] text-brand-success font-bold mt-3 flex items-center gap-1">
                      <FileCheck className="h-3.5 w-3.5 text-brand-success" /> Image Active
                    </span>
                  )}
                </div>

                {/* Signature Upload Card */}
                <div className="flex flex-col items-center p-5 border border-border-app rounded-2xl bg-slate-50/50 dark:bg-card-secondary/40 transition-all">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-4 text-center">Authorized Signature</label>
                  <div
                    onClick={() => sigInputRef.current.click()}
                    className="w-32 h-32 rounded-2xl border-2 border-dashed border-border-app flex items-center justify-center overflow-hidden cursor-pointer hover:border-brand-primary/50 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 active:scale-95 transition-all relative group"
                  >
                    {sigPreview || signatureUrl ? (
                      <>
                        <img
                          src={sigPreview || signatureUrl}
                          alt="Signature Preview"
                          className="w-full h-full object-contain p-2"
                        />
                        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <UploadCloud className="h-6 w-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-slate-400 text-center px-2">
                        <Image className="h-6 w-6 text-brand-primary/80" />
                        <span className="text-[10px] font-bold">Select Signature</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={sigInputRef}
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'signature')}
                    className="hidden"
                  />
                  {(sigPreview || signatureUrl) && (
                    <span className="text-[10px] text-brand-success font-bold mt-3 flex items-center gap-1">
                      <FileCheck className="h-3.5 w-3.5 text-brand-success" /> Image Active
                    </span>
                  )}
                </div>

              </div>
            </div>

          </div>

          {/* Form Actions Footer */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-card-secondary/30 border-t border-border-app flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-5 py-2.5 rounded-xl border border-border-app hover:bg-slate-100 dark:hover:bg-slate-800 text-text-secondary font-bold text-sm transition-all active:scale-95 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-sm rounded-xl shadow-md shadow-brand-primary/10 hover:shadow-brand-primary/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default BusinessProfile;
