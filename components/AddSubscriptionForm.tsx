
import React, { useState, useEffect } from 'react';
import { Subscription, BillingCycle, Currency, SubscriberDetails, PaymentDetails, SubscriptionAttachment } from '../types';

interface AddSubscriptionFormProps {
  theme: 'light' | 'dark';
  onSubmit: (sub: Subscription) => void;
  initialData: Subscription | null;
  currencies: Currency[];
  departments: string[];
  categories: string[];
}

const PHILIPPINE_CARDS = ['Visa', 'Mastercard', 'American Express', 'JCB', 'GCash Card', 'Maya Card'];
const MAX_FILE_SIZE_MB = 5;
const MAX_FILES = 2;
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'image/jpeg',
  'image/png'
];

const AddSubscriptionForm: React.FC<AddSubscriptionFormProps> = ({ theme, onSubmit, initialData, currencies, departments, categories }) => {
  const [fileError, setFileError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    category: '',
    description: '',
    dateStarted: new Date().toISOString().split('T')[0],
    billingCycle: BillingCycle.MONTHLY,
    renewalDate: '',
    regularPrice: '',
    priceCurrency: 'PHP',
    autoRenew: true,
    url: '',
    subscriber: { firstName: '', lastName: '', email: '', designation: '', mobile: '' } as SubscriberDetails,
    payment: { cardType: PHILIPPINE_CARDS[0], cardholderName: '', lastFour: '', expiryDate: '' } as PaymentDetails,
    reminders: [30, 7, 1] as number[],
    attachments: [] as SubscriptionAttachment[]
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        regularPrice: initialData.regularPrice.toString(),
        reminders: initialData.reminders || [30, 7, 1],
        attachments: initialData.attachments || []
      });
    } else {
        setFormData(prev => ({
            ...prev,
            department: departments[0] || '',
            category: categories[0] || ''
        }));
    }
  }, [initialData, departments, categories]);

  const sectionClass = "p-4 rounded-2xl border border-gray-100 bg-gray-50/30 space-y-4";
  const headingClass = "text-[10px] font-black text-[#003569] uppercase tracking-[2px] border-b border-gray-100 pb-2 mb-3";
  const labelClass = "text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1.5 cursor-help";
  const inputClass = "w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-300 font-medium hover:border-blue-200";

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
    setFormData({
      ...formData,
      subscriber: { ...formData.subscriber, mobile: val }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setFileError(null);

    if (files && files.length > 0) {
      if (formData.attachments.length + files.length > MAX_FILES) {
        setFileError(`Maximum of ${MAX_FILES} attachments allowed.`);
        return;
      }

      // Explicitly typing file as 'File' to resolve 'unknown' type issues from Array.from(FileList)
      Array.from(files).forEach((file: File) => {
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
          setFileError(`Unsupported file type (${file.type.split('/')[1]}). Please upload PDF, DOCX, JPG, or PNG.`);
          return;
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          setFileError(`File "${file.name}" is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            attachments: [
              ...prev.attachments,
              {
                name: file.name,
                type: file.type,
                data: reader.result as string
              }
            ]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset input so same file can be selected again if removed
    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fileError) return;
    
    const sub: Subscription = {
      ...formData,
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      regularPrice: parseFloat(formData.regularPrice || '0'),
      trialPrice: 0,
      attachments: formData.attachments
    } as any;
    onSubmit(sub);
  };

  const updateReminder = (index: number, val: string) => {
    const newReminders = [...formData.reminders];
    newReminders[index] = parseInt(val) || 0;
    setFormData({ ...formData, reminders: newReminders });
  };

  const TooltipLabel = ({ label, tooltip }: { label: string, tooltip: string }) => (
    <label className={labelClass} title={tooltip}>
      {label}
      <i className="fas fa-info-circle text-[8px] opacity-30"></i>
    </label>
  );

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-6 bg-white">
      {/* SECTION 1: CORE SUBSCRIPTION IDENTITY */}
      <div className={sectionClass}>
        <h3 className={headingClass}>Subscription Identity</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <TooltipLabel label="Subscription Name" tooltip="The official brand name of the service (e.g., Dropbox, Zoom, AWS)" />
            <input 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              className={inputClass} 
              placeholder="e.g. GitHub Enterprise" 
              title="Enter the clear, recognizable name of the vendor or service lead."
              required 
            />
          </div>
          <div>
            <TooltipLabel label="Responsible Department" tooltip="The business unit or cost center that owns this subscription lead" />
            <div className="relative">
              <select 
                value={formData.department} 
                onChange={e => setFormData({...formData, department: e.target.value})} 
                className={`${inputClass} appearance-none pr-8`}
                title="Select the department primarily responsible for the utilization and cost of this service."
              >
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none text-[9px]"></i>
            </div>
          </div>
          <div>
            <TooltipLabel label="Domain Category" tooltip="Functional grouping for expenditure analysis and classification" />
            <div className="relative">
              <select 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})} 
                className={`${inputClass} appearance-none pr-8`}
                title="Choose a category that best describes the service's technical or business domain."
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none text-[9px]"></i>
            </div>
          </div>
          <div className="md:col-span-2">
            <TooltipLabel label="Service Portal URL" tooltip="Link to the login page or administrative dashboard of the provider" />
            <input 
              type="url" 
              value={formData.url} 
              onChange={e => setFormData({...formData, url: e.target.value})} 
              className={inputClass} 
              placeholder="https://app.service.com" 
              title="Provide the direct URL to access the subscription management portal."
            />
          </div>
        </div>
        <div>
          <TooltipLabel label="Internal Description" tooltip="Brief summary of the tool's purpose and specific usage within the team" />
          <textarea 
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
            className={`${inputClass} min-h-[70px] py-2 resize-none`} 
            placeholder="Describe how this tool is used..."
            title="Add notes about why we use this service, who uses it, or any specific contract conditions."
          />
        </div>
      </div>

      {/* SECTION 2: SUBSCRIBER DETAILS */}
      <div className={sectionClass}>
        <h3 className={headingClass}>Subscriber Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <TooltipLabel label="First Name" tooltip="Lead administrator's legal first name" />
            <input 
              type="text" 
              value={formData.subscriber.firstName} 
              onChange={e => setFormData({...formData, subscriber: {...formData.subscriber, firstName: e.target.value}})} 
              className={inputClass} 
              title="The first name of the primary account administrator or lead contact."
              required 
            />
          </div>
          <div>
            <TooltipLabel label="Last Name" tooltip="Lead administrator's legal last name" />
            <input 
              type="text" 
              value={formData.subscriber.lastName} 
              onChange={e => setFormData({...formData, subscriber: {...formData.subscriber, lastName: e.target.value}})} 
              className={inputClass} 
              title="The last name of the primary account administrator or lead contact."
              required 
            />
          </div>
          <div>
            <TooltipLabel label="Job Designation" tooltip="Official job title of the subscriber within COP" />
            <input 
              type="text" 
              value={formData.subscriber.designation} 
              onChange={e => setFormData({...formData, subscriber: {...formData.subscriber, designation: e.target.value}})} 
              className={inputClass} 
              title="The professional role of the lead administrator (e.g., IT Manager, Lead Developer)."
              required 
            />
          </div>
          <div>
            <TooltipLabel label="Mobile Contact" tooltip="PH format: 09XX XXX XXXX (Exactly 11 digits)" />
            <div className="flex gap-1.5 items-center">
              <div className="bg-gray-100 border border-gray-200 rounded-xl px-2 py-1.5 flex items-center gap-1 shrink-0">
                <span className="text-xs">🇵🇭</span>
                <span className="text-[9px] font-black text-gray-500">(+63)</span>
              </div>
              <input 
                type="tel" 
                value={formData.subscriber.mobile} 
                onChange={handleMobileChange} 
                className={inputClass} 
                placeholder="09XXXXXXXXX" 
                title="Enter the 11-digit Philippine mobile number for automated SMS notifications."
                required 
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <TooltipLabel label="Primary Contact Email" tooltip="The email address used for billing alerts and administrative access" />
            <input 
              type="email" 
              value={formData.subscriber.email} 
              onChange={e => setFormData({...formData, subscriber: {...formData.subscriber, email: e.target.value}})} 
              className={inputClass} 
              placeholder="john.doe@cop-tdi.com" 
              title="This email will receive all renewal notifications and cost alerts."
              required 
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: PAYMENT INFORMATION */}
      <div className={sectionClass}>
        <h3 className={headingClass}>Payment Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <TooltipLabel label="Funding Source" tooltip="Brand of the corporate credit card or e-wallet used for payment" />
            <select 
              value={formData.payment.cardType} 
              onChange={e => setFormData({...formData, payment: {...formData.payment, cardType: e.target.value}})} 
              className={inputClass}
              title="Select the specific payment method linked to this subscription."
            >
              {PHILIPPINE_CARDS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <TooltipLabel label="Name on Card" tooltip="Exact name as printed on the physical or virtual payment card" />
            <input 
              type="text" 
              value={formData.payment.cardholderName} 
              onChange={e => setFormData({...formData, payment: {...formData.payment, cardholderName: e.target.value}})} 
              className={inputClass} 
              title="Enter the full cardholder name for audit and reconciliation purposes."
              required 
            />
          </div>
          <div>
            <TooltipLabel label="Card Expiry" tooltip="Month and Year of card expiration (MM/YY)" />
            <input 
              type="text" 
              placeholder="MM/YY" 
              maxLength={5} 
              value={formData.payment.expiryDate} 
              onChange={e => setFormData({...formData, payment: {...formData.payment, expiryDate: e.target.value}})} 
              className={inputClass} 
              title="Tracking expiry helps prevent service interruption due to failed payments."
              required 
            />
          </div>
          <div>
            <TooltipLabel label="Card Reference (Last 4)" tooltip="The final four digits of the primary payment card number" />
            <input 
              type="text" 
              maxLength={4} 
              value={formData.payment.lastFour} 
              onChange={e => setFormData({...formData, payment: {...formData.payment, lastFour: e.target.value.replace(/\D/g,'')}})} 
              className={inputClass} 
              placeholder="4242" 
              title="Used for cross-referencing bank statements with subscription records."
              required 
            />
          </div>
          <div>
            <TooltipLabel label="Subscription Fee" tooltip="Standard charge amount per billing interval" />
            <div className="flex gap-1.5">
              <select 
                value={formData.priceCurrency} 
                onChange={setFormData.bind(null, (prev: any) => ({ ...prev })) /* placeholder for potential future complex update logic */}
                className={`${inputClass} w-20 shrink-0 appearance-none`}
                title="The currency code defined in the vendor contract."
                defaultValue={formData.priceCurrency}
                onChangeCapture={(e: any) => setFormData({...formData, priceCurrency: e.target.value})}
              >
                {currencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>
              <input 
                type="number" 
                step="0.01" 
                value={formData.regularPrice} 
                onChange={e => setFormData({...formData, regularPrice: e.target.value})} 
                className={inputClass} 
                placeholder="0.00" 
                title="Enter the gross cost before taxes or discounts."
                required 
              />
            </div>
          </div>
          <div>
            <TooltipLabel label="Billing Frequency" tooltip="The recurring period between automated charges" />
            <div className="relative">
              <select 
                value={formData.billingCycle} 
                onChange={e => setFormData({...formData, billingCycle: e.target.value as BillingCycle})} 
                className={`${inputClass} appearance-none pr-8`}
                title="How often the vendor invoices for this service."
              >
                {Object.values(BillingCycle).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none text-[9px]"></i>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: TIMELINE & ALERTS */}
      <div className={sectionClass}>
        <h3 className={headingClass}>Timeline & Alerts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <TooltipLabel label="Provision Date" tooltip="The initial date when the service was first activated" />
              <input 
                type="date" 
                value={formData.dateStarted} 
                onChange={e => setFormData({...formData, dateStarted: e.target.value})} 
                className={inputClass} 
                title="Used to calculate historical tenure and amortization."
              />
            </div>
            <div>
              <TooltipLabel label="Next Renewal Milestone" tooltip="The upcoming date for the next automated billing charge" />
              <input 
                type="date" 
                value={formData.renewalDate} 
                onChange={e => setFormData({...formData, renewalDate: e.target.value})} 
                className={inputClass} 
                title="CRITICAL: The system uses this date to trigger all reminder sequences."
                required 
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input 
                type="checkbox" 
                checked={formData.autoRenew} 
                onChange={e => setFormData({...formData, autoRenew: e.target.checked})} 
                className="w-4 h-4 rounded text-[#003569] cursor-pointer" 
                id="auto-renew-chk" 
                title="Deselect if you plan to manually cancel or renew this service each period."
              />
              <label htmlFor="auto-renew-chk" className="text-[11px] font-bold text-gray-600 cursor-pointer select-none">Automatic Renewal Status</label>
            </div>
          </div>

          <div className="p-4 bg-white border border-gray-100 rounded-3xl space-y-4 shadow-sm">
            <h4 className="text-[8px] font-black uppercase text-gray-400 tracking-[2px] border-b border-gray-50 pb-2">Notification Sequence (Days Prior)</h4>
            <div className="flex gap-2">
              {[0, 1, 2].map(idx => (
                <div key={idx} className="flex-1">
                  <TooltipLabel label={`Alert #${idx+1}`} tooltip={`Trigger notification exactly ${idx+1 === 1 ? 'X' : (idx+1 === 2 ? 'Y' : 'Z')} days before renewal`} />
                  <input 
                    type="number" 
                    value={formData.reminders[idx] || ''} 
                    onChange={e => updateReminder(idx, e.target.value)} 
                    className={`${inputClass} text-center`}
                    placeholder="0"
                    title={`Day count for alert trigger #${idx+1}. Set to 0 to disable.`}
                  />
                </div>
              ))}
            </div>
            <p className="text-[9px] text-gray-400 font-medium italic leading-tight">Configure up to 3 separate alerts to prevent unexpected service lapses.</p>
          </div>
        </div>
      </div>

      {/* SECTION 5: DOCUMENTATION */}
      <div className={sectionClass}>
        <h3 className={headingClass}>Documentation (Max 2 Files, 5MB Each)</h3>
        <div className="space-y-3">
          <TooltipLabel label="Proof of Contract / Invoice" tooltip="Upload contractual agreements or proof of payment (Max 5MB each, max 2 files)" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.attachments.map((file, idx) => (
              <div key={idx} className="p-3 bg-white border border-blue-100 rounded-xl flex items-center gap-3 shadow-sm group">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <i className={`fas ${file.type.includes('pdf') ? 'fa-file-pdf text-red-500' : 'fa-file-image text-blue-500'} text-lg`}></i>
                </div>
                <div className="flex-grow min-w-0">
                  <div className="text-[10px] font-black text-gray-700 truncate">{file.name}</div>
                  <div className="text-[8px] text-gray-400 font-bold uppercase">Ready for upload</div>
                </div>
                <button 
                  type="button" 
                  onClick={() => removeAttachment(idx)}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}

            {formData.attachments.length < MAX_FILES && (
              <label className={`relative block cursor-pointer border-2 border-dashed rounded-2xl p-4 transition-all flex flex-col items-center justify-center gap-2 ${fileError ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50/50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${fileError ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-400'}`}>
                  <i className={`fas ${fileError ? 'fa-exclamation-triangle' : 'fa-plus'} text-sm`}></i>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Add Attachment</span>
                <input 
                  type="file" 
                  accept=".pdf,.docx,.doc,.jpg,.png" 
                  multiple
                  onChange={handleFileChange} 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  title="Select up to 2 files to attach (Max 5MB each)."
                />
              </label>
            )}
          </div>
          
          {fileError && (
            <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
              <i className="fas fa-times-circle text-sm"></i>
              <span>{fileError}</span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 flex justify-end shrink-0">
        <button 
          type="submit" 
          disabled={!!fileError}
          className="px-12 py-3.5 bg-[#003569] text-white rounded-2xl font-black text-[10px] uppercase tracking-[2px] shadow-[0_15px_30px_rgba(0,53,105,0.15)] hover:bg-[#004182] hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Save all changes and update the central subscription repository."
        >
          {initialData ? 'Commit Record Update' : 'Submit'}
        </button>
      </div>
    </form>
  );
};

export default AddSubscriptionForm;
