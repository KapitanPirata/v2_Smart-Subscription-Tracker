
import React from 'react';
import { BillingCycle, Subscription } from '../types';

interface SlicersProps {
  theme: 'light' | 'dark';
  selectedMonth: string | null;
  setSelectedMonth: (month: string | null) => void;
  selectedYear: number | null;
  setSelectedYear: (year: number | null) => void;
  startDate: string | null;
  setStartDate: (date: string | null) => void;
  endDate: string | null;
  setEndDate: (date: string | null) => void;
  selectedDept: string | null;
  setSelectedDept: (dept: string | null) => void;
  selectedCycle: BillingCycle | null;
  setSelectedCycle: (cycle: BillingCycle | null) => void;
  subscriptions: Subscription[];
  departments: string[];
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const Slicers: React.FC<SlicersProps> = ({ 
  selectedMonth, setSelectedMonth, 
  selectedYear, setSelectedYear,
  startDate, setStartDate,
  endDate, setEndDate,
  selectedDept, setSelectedDept,
  selectedCycle, setSelectedCycle,
  subscriptions,
  departments
}) => {
  const availableYears = Array.from(new Set(subscriptions.map(s => new Date(s.renewalDate).getFullYear()))).sort((a: number, b: number) => b - a);

  const selectClass = "bg-gray-50 border border-gray-200 text-gray-700 text-[11px] font-bold rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none min-w-[120px] cursor-pointer";
  const dateInputClass = "bg-gray-50 border border-gray-200 text-gray-700 text-[10px] font-bold rounded-lg p-1.5 outline-none w-[110px] cursor-pointer";

  const hasFilters = selectedMonth || selectedYear || selectedDept || selectedCycle || startDate || endDate;

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <i className="far fa-calendar text-gray-400 text-xs"></i>
        <select 
          value={selectedYear || ''} 
          title="Filter by specific renewal year"
          onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
          className={selectClass}
        >
          <option value="">All Years</option>
          {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <select 
        value={selectedMonth || ''} 
        title="Filter by specific renewal month"
        onChange={(e) => setSelectedMonth(e.target.value || null)}
        className={selectClass}
      >
        <option value="">All Months</option>
        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
      </select>

      <div className="h-6 w-px bg-gray-100"></div>

      <div className="flex items-center gap-2 bg-gray-50/50 p-1 px-2 rounded-lg border border-dashed border-gray-200">
        <span className="text-[9px] font-black uppercase text-gray-400">Range:</span>
        <input 
          type="date" 
          value={startDate || ''} 
          onChange={(e) => setStartDate(e.target.value || null)}
          className={dateInputClass}
          title="Filter results from this renewal date forward"
        />
        <span className="text-gray-300">→</span>
        <input 
          type="date" 
          value={endDate || ''} 
          onChange={(e) => setEndDate(e.target.value || null)}
          className={dateInputClass}
          title="Filter results up to this renewal date"
        />
      </div>

      <div className="h-6 w-px bg-gray-100"></div>

      <div className="flex items-center gap-2">
        <i className="fas fa-building text-gray-400 text-xs"></i>
        <select 
          value={selectedDept || ''} 
          title="Show subscriptions belonging to a specific department"
          onChange={(e) => setSelectedDept(e.target.value || null)}
          className={selectClass}
        >
          <option value="">All Depts</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <select 
        value={selectedCycle || ''} 
        title="Filter by billing frequency (e.g., Monthly, Annually)"
        onChange={(e) => setSelectedCycle(e.target.value as BillingCycle || null)}
        className={selectClass}
      >
        <option value="">All Cycles</option>
        {Object.values(BillingCycle).map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      {hasFilters && (
        <button 
          onClick={() => { 
            setSelectedMonth(null); 
            setSelectedYear(null); 
            setSelectedDept(null); 
            setSelectedCycle(null);
            setStartDate(null);
            setEndDate(null);
          }}
          title="Clear all active slicer filters"
          className="text-[10px] text-blue-600 font-black uppercase hover:underline px-2 tracking-widest"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
};

export default Slicers;
