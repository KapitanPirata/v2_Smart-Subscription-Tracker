
import React, { useState, useMemo, useEffect } from 'react';
import { Subscription, BillingCycle, Currency, AppView, ColumnConfig } from './types';
import { INITIAL_DATA, DEFAULT_COLUMNS, DEPARTMENTS as INITIAL_DEPTS, CATEGORIES as INITIAL_CATS } from './constants';
import SummaryCard from './components/SummaryCard';
import SubscriptionTable from './components/SubscriptionTable';
import AddSubscriptionForm from './components/AddSubscriptionForm';
import SettingsModal from './components/SettingsModal';
import Slicers from './components/Slicers';
import ViewSubscriptionModal from './components/ViewSubscriptionModal';
import ReportPage from './components/ReportPage';
import ColumnManagerModal from './components/ColumnManagerModal';
import ConfirmationModal from './components/ConfirmationModal';

const App: React.FC = () => {
  const today = new Date();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(INITIAL_DATA);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isColumnManagerOpen, setIsColumnManagerOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [viewingSubscription, setViewingSubscription] = useState<Subscription | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Confirmation Modal States
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'primary';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'primary',
    onConfirm: () => {},
  });

  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Dynamic lists for Departments and Categories
  const [departments, setDepartments] = useState<string[]>(() => {
    const saved = localStorage.getItem('sub-tracker-depts');
    return saved ? JSON.parse(saved) : INITIAL_DEPTS;
  });
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('sub-tracker-cats');
    return saved ? JSON.parse(saved) : INITIAL_CATS;
  });

  const [columns, setColumns] = useState<ColumnConfig[]>(() => {
    const saved = localStorage.getItem('sub-tracker-columns');
    return saved ? JSON.parse(saved) : DEFAULT_COLUMNS;
  });

  const [currencies, setCurrencies] = useState<Currency[]>([
    { code: 'PHP', symbol: '₱', rateToUSD: 56.20 },
    { code: 'USD', symbol: '$', rateToUSD: 1 }
  ]);
  const [activeCurrencyCode, setActiveCurrencyCode] = useState('PHP');
  const activeCurrency = currencies.find(c => c.code === activeCurrencyCode) || currencies[0];

  useEffect(() => {
    localStorage.setItem('sub-tracker-columns', JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    localStorage.setItem('sub-tracker-depts', JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem('sub-tracker-cats', JSON.stringify(categories));
  }, [categories]);

  const calculateAnnualized = (sub: Subscription) => {
    let multiplier = 0;
    switch (sub.billingCycle) {
      case BillingCycle.WEEKLY: multiplier = 52; break;
      case BillingCycle.MONTHLY: multiplier = 12; break;
      case BillingCycle.QUARTERLY: multiplier = 4; break;
      case BillingCycle.ANNUALLY: multiplier = 1; break;
    }
    const entryRate = currencies.find(c => c.code === sub.priceCurrency)?.rateToUSD || 1;
    const usdPrice = sub.regularPrice / entryRate;
    return usdPrice * multiplier;
  };

  const convertFromUSD = (usdAmount: number, targetCurrency?: Currency) => {
    const target = targetCurrency || activeCurrency;
    return usdAmount * target.rateToUSD;
  };

  const totals = useMemo(() => {
    const yearlyUSD = subscriptions.reduce((acc, sub) => acc + calculateAnnualized(sub), 0);
    return {
      yearlySpend: convertFromUSD(yearlyUSD),
      monthlySpend: convertFromUSD(yearlyUSD / 12)
    };
  }, [subscriptions, activeCurrency, currencies]);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      const renewalDate = new Date(sub.renewalDate);
      const monthName = renewalDate.toLocaleString('default', { month: 'long' });
      const yearVal = renewalDate.getFullYear();
      
      const searchMatch = !searchTerm || 
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        sub.description.toLowerCase().includes(searchTerm.toLowerCase());
      const monthMatch = !selectedMonth || monthName === selectedMonth;
      const yearMatch = !selectedYear || yearVal === selectedYear;
      const deptMatch = !selectedDept || sub.department === selectedDept;
      const cycleMatch = !selectedCycle || sub.billingCycle === selectedCycle;

      // Custom Range Match
      let rangeMatch = true;
      if (startDate) {
        rangeMatch = rangeMatch && new Date(sub.renewalDate) >= new Date(startDate);
      }
      if (endDate) {
        rangeMatch = rangeMatch && new Date(sub.renewalDate) <= new Date(endDate);
      }
      
      return searchMatch && monthMatch && yearMatch && deptMatch && cycleMatch && rangeMatch;
    });
  }, [subscriptions, searchTerm, selectedMonth, selectedYear, selectedDept, selectedCycle, startDate, endDate]);

  const addOrUpdateSubscription = (sub: Subscription) => {
    if (editingSubscription) {
      setConfirmConfig({
        isOpen: true,
        title: 'Confirm Record Update',
        message: `You are about to modify the details for "${sub.name}". Are you sure you want to commit these changes?`,
        type: 'primary',
        onConfirm: () => {
          setSubscriptions(prev => prev.map(s => s.id === sub.id ? sub : s));
          setIsFormOpen(false);
          setEditingSubscription(null);
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      });
    } else {
      setSubscriptions(prev => [...prev, sub]);
      setIsFormOpen(false);
    }
  };

  const confirmDelete = (id: string) => {
    const sub = subscriptions.find(s => s.id === id);
    setViewingSubscription(null);
    
    setConfirmConfig({
      isOpen: true,
      title: 'CONFIRM RECORD DELETION',
      message: `Warning: You are about to permanently delete "${sub?.name}". This action cannot be undone.`,
      type: 'danger',
      onConfirm: () => {
        setSubscriptions(prev => prev.filter(s => s.id !== id));
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-200 ${theme === 'dark' ? 'bg-[#1D2125] text-[#DEE4EA]' : 'bg-[#F3F6F9] text-[#172B4D]'}`}>
      <header className={`bg-[#003569] text-white px-8 py-4 shadow-md flex justify-between items-center relative overflow-hidden`}>
        <div className="flex items-center gap-6 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
              <i className="fas fa-layer-group text-[#003569] text-xl"></i>
            </div>
            <h1 className="text-xl font-bold tracking-tight font-heading">COP Subscription Leads Dashboard</h1>
          </div>
          <nav className="hidden md:flex gap-4 ml-8">
            <button 
              onClick={() => setCurrentView('dashboard')} 
              title="Switch to main subscription monitoring table"
              className={`px-3 py-2 rounded transition-colors text-sm font-semibold ${currentView === 'dashboard' ? 'bg-white/20' : 'hover:bg-white/10'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setCurrentView('reports')} 
              title="View advanced financial analytics and AI-driven insights"
              className={`px-3 py-2 rounded transition-colors text-sm font-semibold ${currentView === 'reports' ? 'bg-white/20' : 'hover:bg-white/10'}`}
            >
              Intelligence Reports
            </button>
          </nav>
        </div>
        
        <div className="flex items-center gap-4 z-10">
          <button 
            onClick={() => setIsColumnManagerOpen(true)} 
            title="Configure which table columns are visible"
            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded text-sm transition-all border border-white/20 font-semibold"
          >
            <i className="fas fa-table-list mr-2"></i> Manage Columns
          </button>
          <button 
            onClick={() => { setEditingSubscription(null); setIsFormOpen(true); }} 
            title="Initiate a new subscription entry into the system"
            className="bg-[#4C3D96] hover:bg-[#5E4DB2] px-6 py-2 rounded text-sm font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2"
          >
            <i className="fas fa-plus"></i> Add New Subscription
          </button>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#004182] -skew-x-12 translate-x-1/4 pointer-events-none"></div>
      </header>

      <main className="flex-grow max-w-[1920px] mx-auto px-8 py-8 w-full transition-all">
        {currentView === 'dashboard' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <SummaryCard label="Total Annual" trend="-4.8%" trendDown value={totals.yearlySpend} symbol={activeCurrency.symbol} accentColor="border-pink-500" />
              <SummaryCard label="Monthly Avg" trend="-4.9%" trendDown value={totals.monthlySpend} symbol={activeCurrency.symbol} accentColor="border-blue-600" />
              <SummaryCard label="Renewals" trend="0.1%" value={subscriptions.filter(s => new Date(s.renewalDate).getMonth() === today.getMonth()).length} symbol="" accentColor="border-teal-500" />
              <SummaryCard label="Departments" trend="-3.4%" trendDown value={new Set(subscriptions.map(s => s.department)).size} symbol="" accentColor="border-green-500" />
              <SummaryCard label="Critical Items" trend="-7.1%" trendDown value={subscriptions.filter(s => !s.autoRenew).length} symbol="" accentColor="border-red-400" />
              <SummaryCard label="Avg/Dept" trend="-3.8%" trendDown value={totals.yearlySpend / (new Set(subscriptions.map(s => s.department)).size || 1)} symbol={activeCurrency.symbol} accentColor="border-purple-600" />
            </div>

            <div className="bg-white rounded-t-lg shadow-sm p-4 flex flex-wrap items-center gap-6 border-x border-t border-gray-100">
              <Slicers 
                theme={theme}
                selectedMonth={selectedMonth} 
                setSelectedMonth={setSelectedMonth}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                selectedDept={selectedDept}
                setSelectedDept={setSelectedDept}
                selectedCycle={selectedCycle}
                setSelectedCycle={setSelectedCycle}
                subscriptions={subscriptions}
                departments={departments}
              />
              <div className="flex-grow"></div>
              <div className="flex items-center gap-2 border-l pl-4 border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest" title="Choose the primary currency for dashboard calculations">Currency</span>
                <select 
                  value={activeCurrencyCode}
                  onChange={(e) => setActiveCurrencyCode(e.target.value)}
                  title="Switch between configured currencies (e.g., PHP, USD)"
                  className="bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                >
                  {currencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                </select>
                <button 
                  onClick={() => setIsSettingsOpen(true)} 
                  title="Open system configuration and master list management"
                  className="p-2 hover:bg-gray-100 rounded text-gray-500 transition-colors"
                >
                  <i className="fas fa-cog"></i>
                </button>
              </div>
            </div>

            <div className="bg-white p-4 border-x border-gray-100 flex items-center gap-4">
              <div className="relative flex-grow max-w-md">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                <input 
                  type="text" 
                  placeholder="Search by subscription name or description..."
                  value={searchTerm}
                  title="Live search through all indexed subscription leads"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500 font-medium placeholder:text-gray-300"
                />
              </div>
            </div>

            <div className="bg-white rounded-b-lg shadow-sm border border-gray-100 overflow-visible">
              <SubscriptionTable 
                theme={theme}
                columns={columns}
                subscriptions={filteredSubscriptions} 
                onDelete={confirmDelete}
                onEdit={(sub) => { setEditingSubscription(sub); setIsFormOpen(true); }}
                onView={(sub) => setViewingSubscription(sub)}
                calculateAnnualized={(sub) => convertFromUSD(calculateAnnualized(sub))}
                convertPrice={(price, cur) => {
                  const fromRate = currencies.find(c => c.code === cur)?.rateToUSD || 1;
                  const usdPrice = price / fromRate;
                  return convertFromUSD(usdPrice);
                }}
                currencySymbol={activeCurrency.symbol}
              />
            </div>
          </>
        ) : (
          <ReportPage 
            theme={theme}
            subscriptions={subscriptions}
            activeCurrency={activeCurrency}
            currencies={currencies}
            calculateAnnualized={calculateAnnualized}
          />
        )}
      </main>

      <footer className="w-full py-8 border-t border-gray-200 mt-auto bg-white/50 backdrop-blur-sm print:hidden">
        <div className="max-w-[1920px] mx-auto px-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[4px] text-gray-400">
            AI Powered by <span className="text-[#003569]">COP Technology & Digital Innovation Department</span>
          </p>
        </div>
      </footer>

      {isFormOpen && (
        <div className="fixed inset-0 bg-[#091E42]/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col overflow-hidden max-h-[95vh]">
            <div className="p-6 border-b flex justify-between items-center bg-white shrink-0">
              <h2 className="text-xl font-bold text-[#003569] font-heading">{editingSubscription ? 'Edit Subscription Details' : 'Add New Subscription Item'}</h2>
              <button 
                onClick={() => setIsFormOpen(false)} 
                title="Discard changes and exit form"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <i className="fas fa-times text-gray-400"></i>
              </button>
            </div>
            <div className="p-0 overflow-y-auto custom-scrollbar">
              <AddSubscriptionForm 
                theme={theme}
                onSubmit={addOrUpdateSubscription} 
                initialData={editingSubscription} 
                currencies={currencies}
                departments={departments}
                categories={categories}
              />
            </div>
          </div>
        </div>
      )}

      {viewingSubscription && (
        <ViewSubscriptionModal 
          theme={theme}
          subscription={viewingSubscription}
          currencies={currencies}
          activeCurrency={activeCurrency}
          onClose={() => setViewingSubscription(null)}
          onEdit={() => { setEditingSubscription(viewingSubscription); setViewingSubscription(null); setIsFormOpen(true); }}
          onDelete={() => confirmDelete(viewingSubscription.id)}
          calculateAnnualizedUSD={() => calculateAnnualized(viewingSubscription)}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)}
          currencies={currencies}
          setCurrencies={setCurrencies}
          theme={theme}
          onThemeChange={setTheme}
          departments={departments}
          setDepartments={setDepartments}
          categories={categories}
          setCategories={setCategories}
        />
      )}

      {isColumnManagerOpen && (
        <ColumnManagerModal 
          isOpen={isColumnManagerOpen}
          onClose={() => setIsColumnManagerOpen(false)}
          columns={columns}
          setColumns={setColumns}
        />
      )}

      <ConfirmationModal 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        confirmLabel={confirmConfig.type === 'danger' ? 'DELETE RECORD' : 'COMMIT UPDATE'}
        cancelLabel="CANCEL"
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #DFE1E6; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;
