
import React, { useState } from 'react';
import { Subscription, Currency, SubscriptionAttachment } from '../types';

interface ViewSubscriptionModalProps {
  theme: 'light' | 'dark';
  subscription: Subscription;
  currencies: Currency[];
  activeCurrency: Currency;
  onClose: () => void;
  onEdit: () => void;
  onDelete?: () => void;
  calculateAnnualizedUSD: () => number;
}

const ViewSubscriptionModal: React.FC<ViewSubscriptionModalProps> = ({ 
  theme, subscription, currencies, activeCurrency, onClose, onEdit, onDelete, calculateAnnualizedUSD 
}) => {
  const [showNativeCurrency, setShowNativeCurrency] = useState(false);
  const [previewFile, setPreviewFile] = useState<SubscriptionAttachment | null>(null);

  const nativeCurrencyObj = currencies.find(c => c.code === subscription.priceCurrency) || currencies[0];
  const displayCurrency = showNativeCurrency ? nativeCurrencyObj : activeCurrency;

  const convertFromUSD = (usdAmount: number, target: Currency) => {
    return usdAmount * target.rateToUSD;
  };

  const getPriceInDisplay = () => {
    if (showNativeCurrency) return subscription.regularPrice;
    const usdPrice = subscription.regularPrice / (nativeCurrencyObj.rateToUSD || 1);
    return convertFromUSD(usdPrice, activeCurrency);
  };

  const getAnnualInDisplay = () => {
    const annualUSD = calculateAnnualizedUSD();
    return convertFromUSD(annualUSD, displayCurrency);
  };

  const renderPreview = () => {
    if (!previewFile) return null;

    const isImage = previewFile.type.startsWith('image/');
    const isPDF = previewFile.type === 'application/pdf';

    return (
      <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-5xl h-full flex flex-col bg-white rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-4 border-b flex justify-between items-center bg-gray-50">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-800 truncate pr-8">{previewFile.name}</h3>
            <button 
              onClick={() => setPreviewFile(null)}
              className="w-10 h-10 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          <div className="flex-grow overflow-auto p-4 flex items-center justify-center bg-gray-100">
            {isImage && <img src={previewFile.data} alt={previewFile.name} className="max-w-full max-h-full object-contain rounded shadow-lg" />}
            {isPDF && <embed src={previewFile.data} type="application/pdf" className="w-full h-full border-0" />}
            {!isImage && !isPDF && (
              <div className="text-center p-20 space-y-6">
                <i className="fas fa-file-circle-exclamation text-8xl text-orange-400"></i>
                <div className="space-y-2">
                   <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Preview Unavailable</h3>
                   <p className="text-sm text-gray-500 font-bold max-w-xs mx-auto">This file format ({previewFile.type.split('/')[1]}) cannot be previewed directly in the dashboard.</p>
                </div>
                <a 
                  href={previewFile.data} 
                  download={previewFile.name}
                  className="inline-flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-700 active:scale-95 transition-all"
                >
                  <i className="fas fa-download"></i> Download to Local Device
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-[#091E42]/75 backdrop-blur-md flex items-center justify-center z-[200] p-4 overflow-y-auto">
      <div className={`rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.4)] max-w-2xl w-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 my-auto border ${theme === 'dark' ? 'bg-[#2C333A] text-[#DEE4EA] border-[#454F59]' : 'bg-[#F9FBFC] text-[#172B4D] border-white'}`}>
        
        {/* Header Section */}
        <div className={`p-10 border-b flex justify-between items-start ${theme === 'dark' ? 'bg-[#22272B] border-[#454F59]' : 'bg-[#F9FBFC] border-[#DFE1E6]'}`}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[2px] shadow-sm ${theme === 'dark' ? 'bg-[#1D2125] text-[#85B8FF]' : 'bg-[#DEEBFF] text-[#0747A6]'}`}>
                {subscription.category}
              </span>
              <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[2px] shadow-sm ${subscription.autoRenew ? 'bg-teal-50 text-teal-700' : 'bg-gray-100 text-gray-500'}`}>
                {subscription.autoRenew ? 'AUTO-RENEW ON' : 'AUTO-RENEW OFF'}
              </span>
            </div>
            <h2 className="text-5xl font-black tracking-tighter text-[#003569]">{subscription.name}</h2>
          </div>
          <button onClick={onClose} className="p-3 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
            <i className="fas fa-times text-2xl"></i>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-10 overflow-y-auto max-h-[60vh] space-y-12 custom-scrollbar">
          
          {/* Financials Summary */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-black uppercase tracking-[3px] text-gray-400">FINANCIAL BENCHMARKS</h4>
              <button 
                onClick={() => setShowNativeCurrency(!showNativeCurrency)}
                className="text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border bg-white border-gray-200 text-[#0052CC] flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
              >
                <i className="fas fa-sync-alt"></i>
                Show {showNativeCurrency ? `App Currency (${activeCurrency.code})` : `Contract Currency (${subscription.priceCurrency})`}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl border bg-white border-gray-100 flex flex-col items-center text-center shadow-sm">
                <span className="text-[9px] font-black uppercase text-gray-300 mb-3 tracking-[2px]">Unit Cost</span>
                <span className="text-2xl font-black text-gray-800">
                  {getPriceInDisplay().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  <span className="text-[10px] ml-1 opacity-50">{displayCurrency.code}</span>
                </span>
              </div>
              <div className="p-6 rounded-3xl border bg-white border-gray-100 flex flex-col items-center text-center shadow-sm">
                <span className="text-[9px] font-black uppercase text-gray-300 mb-3 tracking-[2px]">Cycle</span>
                <span className="text-2xl font-black text-[#003569] uppercase tracking-tighter">{subscription.billingCycle}</span>
              </div>
              <div className="p-6 rounded-3xl border bg-[#E9F2FF] border-[#B3D4FF] flex flex-col items-center text-center shadow-md">
                <span className="text-[9px] font-black uppercase text-[#0747A6] mb-3 tracking-[2px] opacity-60">Annual Burn</span>
                <span className="text-2xl font-black text-[#0052CC]">
                  {displayCurrency.symbol}{getAnnualInDisplay().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Core Info Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[3px] text-gray-400 border-b border-gray-100 pb-3">LEAD ADMINISTRATOR</h4>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#DEEBFF] to-[#B3D4FF] text-[#0747A6] flex items-center justify-center font-black text-lg border-4 border-white shadow-lg">
                  {subscription.subscriber.firstName[0]}{subscription.subscriber.lastName[0]}
                </div>
                <div className="space-y-0.5">
                  <div className="font-black text-gray-800 text-base">{subscription.subscriber.firstName} {subscription.subscriber.lastName}</div>
                  <div className="text-[10px] text-blue-600 font-black uppercase tracking-[2px]">{subscription.subscriber.designation}</div>
                </div>
              </div>
              <div className="text-xs space-y-3 mt-4">
                <p className="flex items-center gap-4 text-gray-500 font-bold"><i className="far fa-envelope text-gray-200 text-sm"></i> {subscription.subscriber.email}</p>
                <p className="flex items-center gap-4 text-gray-500 font-bold"><i className="fas fa-phone text-gray-200 text-sm"></i> {subscription.subscriber.mobile}</p>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[3px] text-gray-400 border-b border-gray-100 pb-3">PAYMENT & INFRASTRUCTURE</h4>
              <div className="flex items-center gap-5 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <i className={`fab ${subscription.payment.cardType.toLowerCase().includes('visa') ? 'fa-cc-visa text-[#1A1F71]' : 'fa-cc-mastercard text-[#EB001B]'} text-3xl`}></i>
                </div>
                <div className="space-y-0.5">
                  <div className="font-black text-gray-800 text-sm uppercase tracking-tighter">{subscription.payment.cardType} **** {subscription.payment.lastFour}</div>
                  <div className="text-[9px] text-gray-400 font-black uppercase tracking-[2px]">VALID UNTIL {subscription.payment.expiryDate}</div>
                </div>
              </div>
              <div className="mt-4">
                 <h5 className="text-[9px] font-black text-gray-300 uppercase mb-2 tracking-widest">Provider Portal</h5>
                 <a href={subscription.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-2 break-all">
                    <i className="fas fa-external-link-alt text-[10px]"></i>
                    {subscription.url}
                 </a>
              </div>
            </div>
          </div>

          {/* Timeline & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[3px] text-gray-400 border-b border-gray-100 pb-3">TIMELINE MILESTONES</h4>
              <div className="space-y-4 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-bold uppercase tracking-widest">Start Date</span>
                  <span className="font-black text-gray-700">{new Date(subscription.dateStarted).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-[#DE350B]">Next Renewal</span>
                  <span className="font-black text-[#DE350B]">{new Date(subscription.renewalDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-bold uppercase tracking-widest">Ownership</span>
                  <span className="font-black text-[#003569] uppercase">{subscription.department}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[3px] text-gray-400 border-b border-gray-100 pb-3">INTERNAL DOCUMENTATION</h4>
              <p className="text-xs text-gray-600 leading-relaxed font-bold italic opacity-80 mb-6">
                "{subscription.description || 'No descriptive context provided for this asset.'}"
              </p>
              
              <div className="grid grid-cols-1 gap-4">
                {subscription.attachments && subscription.attachments.length > 0 ? (
                  subscription.attachments.map((file, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setPreviewFile(file)}
                      className="p-4 border rounded-3xl bg-white flex items-center gap-4 shadow-sm border-blue-50 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 transition-colors group-hover:bg-blue-100">
                        <i className={`fas ${file.type.includes('pdf') ? 'fa-file-pdf text-red-500' : 'fa-file-image text-blue-500'} text-2xl`}></i>
                      </div>
                      <div className="overflow-hidden flex-grow">
                        <div className="text-[11px] font-black text-gray-800 truncate uppercase tracking-tighter">{file.name}</div>
                        <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest">CLICK TO VIEW REFERENCE</div>
                      </div>
                      <i className="fas fa-chevron-right text-gray-300 group-hover:text-blue-500 transition-colors pr-2"></i>
                    </div>
                  ))
                ) : (
                  <div className="p-8 border border-dashed rounded-3xl text-center">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">No attachments linked to record.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className={`p-10 border-t flex justify-between items-center ${theme === 'dark' ? 'bg-[#22272B] border-[#454F59]' : 'bg-[#F4F5F7] border-[#DFE1E6]'}`}>
          <button 
            onClick={() => {
              if (onDelete) onDelete();
            }}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[2px] text-pink-600 hover:text-pink-800 transition-colors"
          >
            <i className="fas fa-trash-alt"></i> DELETE RECORD
          </button>
          
          <div className="flex gap-6">
            <button onClick={onClose} className="px-6 py-3 font-black text-[10px] uppercase tracking-[3px] text-gray-400 hover:text-gray-700 transition-colors">
              CLOSE VIEW
            </button>
            <button onClick={onEdit} className="px-14 py-4 bg-[#0052CC] text-white rounded-2xl font-black text-[10px] uppercase tracking-[3px] shadow-[0_15px_40px_rgba(0,82,204,0.3)] hover:bg-[#0747A6] hover:-translate-y-1 transition-all active:scale-95">
              EDIT DETAILS
            </button>
          </div>
        </div>
      </div>
      
      {/* File Previewer */}
      {renderPreview()}
    </div>
  );
};

export default ViewSubscriptionModal;
