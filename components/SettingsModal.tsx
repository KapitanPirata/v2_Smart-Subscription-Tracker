
import React, { useState } from 'react';
import { Currency } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencies: Currency[];
  setCurrencies: React.Dispatch<React.SetStateAction<Currency[]>>;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  departments: string[];
  setDepartments: React.Dispatch<React.SetStateAction<string[]>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

const ListManager: React.FC<{ 
    title: string; 
    items: string[]; 
    onAdd: (item: string) => void; 
    onRemove: (item: string) => void;
    onEdit: (oldItem: string, newItem: string) => void;
    theme: 'light' | 'dark';
}> = ({ title, items, onAdd, onRemove, onEdit, theme }) => {
    const [newItem, setNewItem] = useState('');
    const [editing, setEditing] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    const handleAdd = () => {
        if (newItem.trim()) {
            onAdd(newItem.trim());
            setNewItem('');
        }
    };

    return (
        <section className="space-y-4">
            <h3 className={`text-xs font-black uppercase tracking-widest border-b pb-1 ${theme === 'dark' ? 'text-[#97A0AF] border-[#454F59]' : 'text-[#6B778C] border-[#DFE1E6]'}`}>
                {title}
            </h3>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={newItem} 
                    onChange={e => setNewItem(e.target.value)}
                    placeholder={`New ${title.slice(0, -1)}...`}
                    className={`flex-grow p-2 text-xs border rounded outline-none ${theme === 'dark' ? 'bg-[#22272B] border-[#454F59]' : 'bg-white'}`}
                />
                <button 
                    onClick={handleAdd}
                    className="bg-[#0052CC] text-white text-[10px] font-bold px-4 rounded hover:bg-[#0747A6]"
                >
                    ADD
                </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {items.map(item => (
                    <div key={item} className={`flex items-center justify-between p-2 rounded border ${theme === 'dark' ? 'bg-[#1D2125] border-[#454F59]' : 'bg-gray-50 border-gray-100'}`}>
                        {editing === item ? (
                            <input 
                                autoFocus
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onBlur={() => { onEdit(item, editValue); setEditing(null); }}
                                onKeyDown={e => e.key === 'Enter' && (onEdit(item, editValue), setEditing(null))}
                                className="text-xs bg-white border rounded px-1 flex-grow outline-none"
                            />
                        ) : (
                            <span className="text-xs font-medium">{item}</span>
                        )}
                        <div className="flex gap-2">
                            <button 
                                onClick={() => { setEditing(item); setEditValue(item); }}
                                className="text-gray-400 hover:text-blue-600 text-[10px]"
                            >
                                <i className="fas fa-edit"></i>
                            </button>
                            <button 
                                onClick={() => onRemove(item)}
                                className="text-gray-400 hover:text-red-500 text-[10px]"
                            >
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, onClose, currencies, setCurrencies, theme, onThemeChange, 
    departments, setDepartments, categories, setCategories 
}) => {
  const [newCurrency, setNewCurrency] = useState<Currency>({ code: '', symbol: '', rateToUSD: 1 });

  const addCurrency = () => {
    if (!newCurrency.code || !newCurrency.symbol) return;
    if (currencies.find(c => c.code === newCurrency.code)) return;
    setCurrencies([...currencies, newCurrency]);
    setNewCurrency({ code: '', symbol: '', rateToUSD: 1 });
  };

  const removeCurrency = (code: string) => {
    if (code === 'USD') return;
    setCurrencies(currencies.filter(c => c.code !== code));
  };

  return (
    <div className="fixed inset-0 bg-[#091E42]/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className={`rounded-xl shadow-2xl max-w-2xl w-full flex flex-col ${theme === 'dark' ? 'bg-[#2C333A] text-[#DEE4EA]' : 'bg-white text-[#172B4D]'}`}>
        <div className={`p-6 border-b flex justify-between items-center rounded-t-xl ${theme === 'dark' ? 'bg-[#22272B] border-[#454F59]' : 'bg-[#F4F5F7] border-[#DFE1E6]'}`}>
          <h2 className="text-lg font-bold uppercase tracking-widest">Global Settings</h2>
          <button onClick={onClose} className={`p-2 rounded hover:bg-opacity-10 ${theme === 'dark' ? 'text-[#97A0AF] hover:bg-white' : 'text-[#6B778C] hover:bg-black'}`}>
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10 overflow-y-auto max-h-[80vh] custom-scrollbar">
          <div className="space-y-8">
            <section>
              <h3 className={`text-xs font-black uppercase tracking-widest mb-4 border-b pb-1 flex items-center gap-2 ${theme === 'dark' ? 'text-[#97A0AF] border-[#454F59]' : 'text-[#6B778C] border-[#DFE1E6]'}`}>
                <i className="fas fa-circle-half-stroke"></i> Interface Theme
              </h3>
              <div className={`p-2 rounded-lg border flex gap-1 ${theme === 'dark' ? 'bg-[#1D2125] border-[#454F59]' : 'bg-[#EBECF0] border-[#DFE1E6]'}`}>
                <button 
                  onClick={() => onThemeChange('light')}
                  className={`flex-1 py-2 rounded text-xs font-bold transition-all ${theme === 'light' ? 'bg-white shadow-sm text-[#0052CC]' : 'text-[#6B778C] hover:bg-white/50'}`}
                >
                  <i className="fas fa-sun mr-2"></i> Light Mode
                </button>
                <button 
                  onClick={() => onThemeChange('dark')}
                  className={`flex-1 py-2 rounded text-xs font-bold transition-all ${theme === 'dark' ? 'bg-[#2C333A] shadow-lg text-[#579DFF]' : 'text-[#97A0AF] hover:bg-black/20'}`}
                >
                  <i className="fas fa-moon mr-2"></i> Dark Mode
                </button>
              </div>
            </section>

            <section>
                <h3 className={`text-xs font-black uppercase tracking-widest mb-4 border-b pb-1 flex items-center gap-2 ${theme === 'dark' ? 'text-[#97A0AF] border-[#454F59]' : 'text-[#6B778C] border-[#DFE1E6]'}`}>
                    <i className="fas fa-coins"></i> Currencies
                </h3>
                <div className="grid grid-cols-4 gap-2 mb-4">
                    <input 
                        type="text" placeholder="ISO" value={newCurrency.code} 
                        onChange={e => setNewCurrency({...newCurrency, code: e.target.value.toUpperCase()})}
                        className={`p-2 text-xs border rounded outline-none ${theme === 'dark' ? 'bg-[#22272B] border-[#454F59]' : 'bg-white'}`}
                    />
                    <input 
                        type="text" placeholder="Sym" value={newCurrency.symbol}
                        onChange={e => setNewCurrency({...newCurrency, symbol: e.target.value})}
                        className={`p-2 text-xs border rounded outline-none ${theme === 'dark' ? 'bg-[#22272B] border-[#454F59]' : 'bg-white'}`}
                    />
                    <input 
                        type="number" step="0.01" placeholder="Rate" value={newCurrency.rateToUSD}
                        onChange={e => setNewCurrency({...newCurrency, rateToUSD: parseFloat(e.target.value)})}
                        className={`p-2 text-xs border rounded outline-none ${theme === 'dark' ? 'bg-[#22272B] border-[#454F59]' : 'bg-white col-span-1'}`}
                    />
                    <button onClick={addCurrency} className="bg-[#0052CC] text-white text-[10px] font-bold rounded">ADD</button>
                </div>
                <div className="space-y-1">
                    {currencies.map(c => (
                        <div key={c.code} className="flex justify-between items-center text-xs p-1">
                            <span>{c.code} ({c.symbol})</span>
                            <span className="opacity-50">{c.rateToUSD}</span>
                            {c.code !== 'USD' && <button onClick={() => removeCurrency(c.code)} className="text-red-400"><i className="fas fa-times"></i></button>}
                        </div>
                    ))}
                </div>
            </section>
          </div>

          <div className="space-y-10">
            <ListManager 
                title="Managed Departments" 
                items={departments} 
                onAdd={item => setDepartments([...departments, item])}
                onRemove={item => setDepartments(departments.filter(i => i !== item))}
                onEdit={(old, next) => setDepartments(departments.map(i => i === old ? next : i))}
                theme={theme}
            />

            <ListManager 
                title="Domain Categories" 
                items={categories} 
                onAdd={item => setCategories([...categories, item])}
                onRemove={item => setCategories(categories.filter(i => i !== item))}
                onEdit={(old, next) => setCategories(categories.map(i => i === old ? next : i))}
                theme={theme}
            />
          </div>
        </div>

        <div className={`p-6 border-t rounded-b-xl flex justify-end ${theme === 'dark' ? 'bg-[#22272B] border-[#454F59]' : 'bg-[#F4F5F7] border-[#DFE1E6]'}`}>
          <button 
            onClick={onClose}
            className={`px-8 py-3 rounded font-black text-[10px] tracking-widest uppercase transition-all active:scale-95 ${theme === 'dark' ? 'bg-[#333C44] hover:bg-[#454F59] text-[#DEE4EA]' : 'bg-white hover:bg-[#EBECF0] text-[#172B4D] border border-[#DFE1E6]'}`}
          >
            Apply & Close
          </button>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #DFE1E6; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default SettingsModal;
