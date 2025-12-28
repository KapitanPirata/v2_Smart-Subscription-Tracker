
import React from 'react';
import { Subscription } from '../types';

interface ReminderAlertModalProps {
  alerts: { sub: Subscription; days: number }[];
  onClose: () => void;
}

const ReminderAlertModal: React.FC<ReminderAlertModalProps> = ({ alerts, onClose }) => {
  return (
    <div className="fixed inset-0 bg-red-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-bounce-slow">
        <div className="bg-red-600 p-6 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <i className="fas fa-bell text-3xl"></i>
          </div>
          <h2 className="text-xl font-black uppercase tracking-widest">Renewal Alert!</h2>
          <p className="text-sm opacity-80 mt-1">Immediate Action Required</p>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-xs text-gray-500 font-bold uppercase border-b pb-2">Upcoming Renewals:</p>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {alerts.map((alert, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 bg-red-50 rounded-xl border border-red-100">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600 font-black text-lg">
                  {alert.days}
                </div>
                <div className="flex-grow">
                  <h4 className="text-sm font-black text-gray-800">{alert.sub.name}</h4>
                  <p className="text-[10px] text-red-600 font-bold uppercase">Expires in {alert.days} days</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block uppercase">Renewal Date</span>
                  <span className="text-xs font-bold">{new Date(alert.sub.renewalDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={onClose}
            className="w-full bg-gray-800 text-white py-4 rounded-2xl font-black text-xs tracking-widest hover:bg-black transition-all transform active:scale-95 mt-4"
          >
            I UNDERSTAND
          </button>
        </div>
      </div>
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ReminderAlertModal;
