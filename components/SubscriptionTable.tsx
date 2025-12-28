
import React, { useState, useRef, useEffect } from 'react';
import { Subscription, ColumnConfig } from '../types';

interface SubscriptionTableProps {
  theme: 'light' | 'dark';
  columns: ColumnConfig[];
  subscriptions: Subscription[];
  onDelete: (id: string) => void;
  onEdit: (sub: Subscription) => void;
  onView: (sub: Subscription) => void;
  calculateAnnualized: (sub: Subscription) => number;
  convertPrice: (price: number, currency: string) => number;
  currencySymbol: string;
}

const PaymentLogo: React.FC<{ type: string }> = ({ type }) => {
  const normalized = type.toLowerCase();
  
  if (normalized.includes('visa')) {
    return (
      <div title="Visa Payment Card" className="flex items-center justify-center w-10 h-6 bg-white border border-gray-100 rounded shadow-sm text-[10px] font-black italic text-[#1A1F71] tracking-tighter">
        VISA
      </div>
    );
  }
  if (normalized.includes('mastercard')) {
    return (
      <div title="Mastercard Payment Card" className="flex items-center gap-0.5 w-10 h-6 bg-white border border-gray-100 rounded shadow-sm px-1 overflow-hidden">
        <div className="w-3 h-3 rounded-full bg-[#EB001B]"></div>
        <div className="w-3 h-3 rounded-full bg-[#F79E1B] -ml-1.5 opacity-90"></div>
      </div>
    );
  }
  if (normalized.includes('gcash')) {
    return (
      <div title="GCash E-Wallet Card" className="flex items-center justify-center w-10 h-6 bg-[#007DFE] rounded shadow-sm text-[8px] font-black text-white italic">
        G
      </div>
    );
  }
  if (normalized.includes('maya')) {
    return (
      <div title="Maya E-Wallet Card" className="flex items-center justify-center w-10 h-6 bg-black rounded shadow-sm text-[8px] font-black text-[#85BB2F]">
        MAYA
      </div>
    );
  }
  
  return (
    <div title="Standard Credit Card" className="flex items-center justify-center w-10 h-6 bg-gray-50 border border-gray-100 rounded shadow-sm">
      <i className="fas fa-credit-card text-[10px] text-gray-400"></i>
    </div>
  );
};

const ActionMenu: React.FC<{ theme: 'light' | 'dark'; sub: Subscription; onEdit: () => void; onDelete: () => void }> = ({ theme, sub, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        title="Open record management menu"
        className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${isOpen ? 'bg-blue-100 text-[#003569]' : 'text-gray-400 hover:text-[#003569] hover:bg-blue-50'}`}
      >
        <i className="fas fa-ellipsis-v"></i>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border bg-white border-gray-100 z-[9999999] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <button 
            onClick={() => { onEdit(); setIsOpen(false); }} 
            title="Modify the details of this subscription record"
            className="flex items-center w-full px-4 py-2.5 text-xs font-bold hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <i className="fas fa-edit mr-3 w-4 text-blue-500"></i> Edit Details
          </button>
          <div className="h-px bg-gray-100 my-1"></div>
          <button 
            onClick={() => { onDelete(); setIsOpen(false); }} 
            title="Remove this subscription from the system permanently"
            className="flex items-center w-full px-4 py-2.5 text-xs font-bold hover:bg-pink-50 text-pink-600 transition-colors"
          >
            <i className="fas fa-trash-alt mr-3 w-4"></i> Delete Record
          </button>
        </div>
      )}
    </div>
  );
};

const SubscriptionTable: React.FC<SubscriptionTableProps> = ({ 
  columns, subscriptions, onDelete, onEdit, onView, calculateAnnualized, convertPrice, currencySymbol 
}) => {
  const visibleColumns = [...columns]
    .filter(c => c.visible)
    .sort((a, b) => a.order - b.order);

  const getDaysLeft = (renewalDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const renewal = new Date(renewalDate);
    return Math.ceil((renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getHeaderTooltip = (id: string) => {
    switch (id) {
      case 'sub': return 'Name and business domain category of the service.';
      case 'dept': return 'Internal team responsible for managing this lead.';
      case 'admin': return 'Assigned account owner and their job designation.';
      case 'pay': return 'Method of funding and card reference (last 4 digits).';
      case 'ren': return 'Upcoming billing milestone and automatic renewal status.';
      case 'stat': return 'Timeline status relative to the next renewal date.';
      case 'unit': return 'Cost per single billing cycle (Weekly, Monthly, etc.).';
      case 'ann': return 'Projected gross expenditure over a full 12-month period.';
      default: return '';
    }
  };

  const renderCell = (col: ColumnConfig, sub: Subscription) => {
    switch (col.id) {
      case 'sub':
        return (
          <div className="flex flex-col">
            <span className="font-bold text-[#003569] group-hover:text-blue-600 transition-colors">{sub.name}</span>
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-tight">{sub.category}</span>
          </div>
        );
      case 'dept':
        return <span className="px-3 py-1 rounded-full bg-blue-50 text-[#003569] font-black text-[9px] uppercase tracking-tighter">{sub.department}</span>;
      case 'admin':
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 text-[#003569] flex items-center justify-center text-[10px] font-black border border-blue-200 shadow-sm">
              {sub.subscriber.firstName[0]}{sub.subscriber.lastName[0]}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-800">{sub.subscriber.firstName}</span>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">{sub.subscriber.designation}</span>
            </div>
          </div>
        );
      case 'pay':
        return (
          <div className="flex items-center gap-3">
            <PaymentLogo type={sub.payment.cardType} />
            <span className="text-[10px] font-mono font-black text-gray-400">****{sub.payment.lastFour}</span>
          </div>
        );
      case 'ren':
        return (
          <div className="flex flex-col">
            <span className="text-xs text-gray-700 font-bold">{new Date(sub.renewalDate).toLocaleDateString()}</span>
            <span className={`text-[9px] font-black uppercase ${sub.autoRenew ? 'text-teal-600' : 'text-orange-500'}`}>
              {sub.autoRenew ? 'Auto-Renew' : 'Manual Renew'}
            </span>
          </div>
        );
      case 'stat':
        const days = getDaysLeft(sub.renewalDate);
        return (
          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm ${
            days < 0 ? 'bg-pink-100 text-pink-600' : days <= 7 ? 'bg-orange-100 text-orange-600' : 'bg-teal-100 text-teal-700'
          }`}>
            {days < 0 ? 'EXPIRED' : days === 0 ? 'DUE TODAY' : `${days}D REMAINING`}
          </span>
        );
      case 'unit':
        const cp = convertPrice(sub.regularPrice, sub.priceCurrency);
        return (
          <div className="flex flex-col text-right">
            <span className="text-xs font-black text-gray-800">{currencySymbol}{cp.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <span className="text-[9px] text-gray-400 uppercase font-black tracking-tighter">{sub.billingCycle}</span>
          </div>
        );
      case 'ann':
        return <span className="text-sm font-black text-[#0052CC]">{currencySymbol}{calculateAnnualized(sub).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>;
      default: return null;
    }
  };

  return (
    <div className="overflow-visible">
      <table className="w-full text-left border-collapse min-w-[1100px]">
        <thead>
          <tr className="bg-gray-50/80 border-b border-gray-100">
            {visibleColumns.map(col => (
              <th 
                key={col.id} 
                title={getHeaderTooltip(col.id)}
                className={`p-4 py-5 text-[10px] font-black uppercase tracking-[2px] text-gray-400 cursor-help ${['unit', 'ann'].includes(col.id) ? 'text-right' : ''}`}
              >
                {col.label}
              </th>
            ))}
            <th className="p-4 py-5 text-center text-[10px] font-black uppercase tracking-[2px] text-gray-400">Manage</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50/50">
          {subscriptions.map(sub => (
            <tr 
              key={sub.id} 
              onClick={() => onView(sub)} 
              title="Click to view full subscription profile"
              className="hover:bg-blue-50/20 transition-all cursor-pointer group"
            >
              {visibleColumns.map(col => (
                <td key={`${sub.id}-${col.id}`} className={`p-4 py-5 ${['unit', 'ann'].includes(col.id) ? 'text-right' : ''}`}>
                  {renderCell(col, sub)}
                </td>
              ))}
              <td className="p-4 py-5 text-center">
                <ActionMenu theme="light" sub={sub} onEdit={() => onEdit(sub)} onDelete={() => onDelete(sub.id)} />
              </td>
            </tr>
          ))}
          {subscriptions.length === 0 && (
            <tr><td colSpan={visibleColumns.length + 1} className="p-24 text-center text-gray-300 font-black uppercase tracking-widest text-[10px]">No matches found for active filters.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SubscriptionTable;
