
import React from 'react';
import { ColumnConfig } from '../types';

interface ColumnManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnConfig[];
  setColumns: React.Dispatch<React.SetStateAction<ColumnConfig[]>>;
}

const ColumnManagerModal: React.FC<ColumnManagerModalProps> = ({ isOpen, onClose, columns, setColumns }) => {
  const toggleVisibility = (id: string) => {
    if (id === 'sub') return; // Subscription name is required
    setColumns(prev => prev.map(c => c.id === id ? { ...c, visible: !c.visible } : c));
  };

  const moveColumn = (index: number, direction: 'up' | 'down') => {
    const newColumns = [...columns].sort((a,b) => a.order - b.order);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newColumns.length) return;

    // Swap orders
    const tempOrder = newColumns[index].order;
    newColumns[index].order = newColumns[targetIndex].order;
    newColumns[targetIndex].order = tempOrder;

    setColumns(newColumns);
  };

  if (!isOpen) return null;

  const sortedCols = [...columns].sort((a,b) => a.order - b.order);

  return (
    <div className="fixed inset-0 bg-[#091E42]/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#003569]">Dashboard Column Configuration</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times"></i></button>
        </div>
        
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          <p className="text-[10px] text-gray-500 font-bold uppercase mb-4">Toggle visibility and reorder sequence</p>
          {sortedCols.map((col, idx) => (
            <div key={col.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 group">
              <input 
                type="checkbox" 
                checked={col.visible} 
                disabled={col.id === 'sub'}
                onChange={() => toggleVisibility(col.id)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className={`flex-grow text-xs font-bold ${col.visible ? 'text-gray-800' : 'text-gray-400 italic'}`}>{col.label}</span>
              
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => moveColumn(idx, 'up')} disabled={idx === 0} className="p-1 px-2 hover:bg-gray-200 rounded text-gray-500 disabled:opacity-20"><i className="fas fa-chevron-up text-[10px]"></i></button>
                <button onClick={() => moveColumn(idx, 'down')} disabled={idx === sortedCols.length - 1} className="p-1 px-2 hover:bg-gray-200 rounded text-gray-500 disabled:opacity-20"><i className="fas fa-chevron-down text-[10px]"></i></button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end">
          <button onClick={onClose} className="px-8 py-2 bg-[#003569] text-white rounded-lg font-bold text-xs">Save & Close</button>
        </div>
      </div>
    </div>
  );
};

export default ColumnManagerModal;
