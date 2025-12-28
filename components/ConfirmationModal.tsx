
import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'primary';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  type = 'primary'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#091E42]/60 backdrop-blur-sm flex items-center justify-center z-[300] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        <div className={`p-6 flex items-center gap-4 ${type === 'danger' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-700'}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${type === 'danger' ? 'bg-red-100' : 'bg-blue-100'}`}>
            <i className={`fas ${type === 'danger' ? 'fa-exclamation-triangle' : 'fa-question-circle'} text-xl`}></i>
          </div>
          <h3 className="text-lg font-black uppercase tracking-widest font-heading">{title}</h3>
        </div>
        <div className="p-8">
          <p className="text-sm text-gray-600 font-medium leading-relaxed">{message}</p>
          <div className="mt-8 flex gap-3 justify-end">
            <button 
              onClick={onCancel}
              className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-gray-100 transition-all"
            >
              {cancelLabel}
            </button>
            <button 
              onClick={onConfirm}
              className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all shadow-lg active:scale-95 ${
                type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#003569] hover:bg-[#004182]'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
