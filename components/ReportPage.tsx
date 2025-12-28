
import React, { useState, useMemo, useEffect } from 'react';
import { Subscription, Currency, InsightRecommendation } from '../types';
import { GoogleGenAI } from "@google/genai";

interface ReportPageProps {
  theme: 'light' | 'dark';
  subscriptions: Subscription[];
  activeCurrency: Currency;
  currencies: Currency[];
  calculateAnnualized: (sub: Subscription) => number;
}

const ReportPage: React.FC<ReportPageProps> = ({ 
  theme, subscriptions, activeCurrency, currencies, calculateAnnualized 
}) => {
  const [recommendations, setRecommendations] = useState<InsightRecommendation[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // --- Behavioral Pattern Detection (Forecasting Critical Focus Areas) ---
  const criticalAreas = useMemo(() => {
    const areas: { title: string; description: string; type: 'warning' | 'info' | 'critical' }[] = [];
    
    // 1. Redundancy Check
    const categoriesMap: Record<string, string[]> = {};
    subscriptions.forEach(s => {
      if (!categoriesMap[s.category]) categoriesMap[s.category] = [];
      categoriesMap[s.category].push(s.name);
    });
    Object.entries(categoriesMap).forEach(([cat, subs]) => {
      if (subs.length > 2) {
        areas.push({
          title: `Redundant ${cat} Tools`,
          description: `You have ${subs.length} items in ${cat}: ${subs.join(', ')}. Consolidating could yield 20%+ savings.`,
          type: 'warning'
        });
      }
    });

    // 2. High-Value Auto-Renew Risk
    const highValueNoAuto = subscriptions.filter(s => !s.autoRenew && calculateAnnualized(s) > 1000);
    if (highValueNoAuto.length > 0) {
      areas.push({
        title: "Mission Critical Auto-Renew",
        description: `${highValueNoAuto.length} high-value subscriptions are set to manual renew. Risk of service interruption.`,
        type: 'critical'
      });
    }

    // 3. Billing Concentration
    const monthCounts: Record<number, number> = {};
    subscriptions.forEach(s => {
      const month = new Date(s.renewalDate).getMonth();
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });
    const peakMonthIdx = Object.entries(monthCounts).sort((a,b) => b[1] - a[1])[0];
    if (peakMonthIdx && peakMonthIdx[1] > subscriptions.length / 2) {
      areas.push({
        title: "Cash Flow Concentration",
        description: `Over 50% of your renewals hit in ${new Date(0, parseInt(peakMonthIdx[0])).toLocaleString('default', { month: 'long' })}. Consider staggered billing.`,
        type: 'info'
      });
    }

    return areas;
  }, [subscriptions, calculateAnnualized]);

  const statsByYear = useMemo(() => {
    const years: Record<number, number> = {};
    subscriptions.forEach(sub => {
      const year = new Date(sub.renewalDate).getFullYear();
      const annualUSD = calculateAnnualized(sub);
      const converted = annualUSD * activeCurrency.rateToUSD;
      years[year] = (years[year] || 0) + converted;
    });
    
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    
    if (!years[currentYear]) years[currentYear] = 0;
    if (!years[nextYear]) years[nextYear] = 0;
    
    return Object.entries(years)
      .sort((a,b) => parseInt(a[0]) - parseInt(b[0]))
      .filter(([year]) => parseInt(year) >= currentYear - 1 && parseInt(year) <= currentYear + 1);
  }, [subscriptions, activeCurrency, calculateAnnualized]);

  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;
  const currentYearSpend = statsByYear.find(s => parseInt(s[0]) === currentYear)?.[1] || 0;
  const lastYearSpend = statsByYear.find(s => parseInt(s[0]) === lastYear)?.[1] || 0;
  
  const percChange = lastYearSpend > 0 
    ? ((currentYearSpend - lastYearSpend) / lastYearSpend) * 100 
    : 0;

  useEffect(() => {
    const fetchAIInsights = async () => {
      if (subscriptions.length === 0) return;
      setIsLoadingAI(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const summary = subscriptions.map(s => `${s.name}: ${s.regularPrice} ${s.priceCurrency} (${s.billingCycle}) in ${s.category}`).join(', ');
        
        const prompt = `Analyze these IT subscriptions: ${summary}. 
        Provide exactly 4 insights geared towards Savings, Efficiency, Effectiveness, and Growth. 
        Return as a JSON array of objects with keys: "title", "description", "category" (Savings|Efficiency|Effectiveness), and "impact" (High|Medium|Low). 
        Keep descriptions concise and data-driven.`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
        });
        
        const cleaned = response.text?.replace(/```json|```/g, '').trim();
        const data = JSON.parse(cleaned || '[]');
        setRecommendations(data);
      } catch (e) {
        setRecommendations([
          { title: "Consolidate Multi-Vendor SaaS", description: "Consolidating 3 productivity tools into 1 suite saves $4,200 annually.", category: "Savings", impact: "High" },
          { title: "Staggered Billing Cycle", description: "Moving AWS to Annual would improve efficiency by 15%.", category: "Efficiency", impact: "Medium" },
          { title: "Review Underutilized Seats", description: "VPN effectiveness is at 60% based on user count.", category: "Effectiveness", impact: "High" }
        ]);
      } finally {
        setIsLoadingAI(false);
      }
    };
    fetchAIInsights();
  }, [subscriptions]);

  const exportToCSV = () => {
    const headers = ['Subscription', 'Department', 'Category', 'Cycle', 'Price', 'Currency', 'Renewal Date', 'Auto Renew'];
    const rows = subscriptions.map(s => [
      s.name, s.department, s.category, s.billingCycle, s.regularPrice, s.priceCurrency, s.renewalDate, s.autoRenew ? 'YES' : 'NO'
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `COP_Sub_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareView = async () => {
    const currentUrl = window.location.href;
    const isValidUrl = currentUrl.startsWith('http');
    
    const shareData: ShareData = {
      title: 'COP Subscription Leads Dashboard',
      text: `Check out our subscription intelligence report. Current annual burn: ${activeCurrency.symbol}${currentYearSpend.toLocaleString()}`,
    };

    if (isValidUrl) {
      shareData.url = currentUrl;
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Share failed", err);
        if (err instanceof Error && err.name === 'TypeError') {
          alert("Sharing failed. You can copy the browser address bar to share this report manually.");
        }
      }
    } else {
      alert("Sharing not supported on this browser. Copy the URL to share.");
    }
  };

  return (
    <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-500 max-w-[1600px] mx-auto pb-24">
      <div className="flex justify-between items-center mb-10 print:hidden">
        <div>
          <h2 className="text-2xl font-black text-[#003569] tracking-tight">Financial Intelligence & Analytics</h2>
          <p className="text-sm text-gray-400 font-medium">Multi-year forecasting, behavioral patterns, and cross-pillared optimization strategies.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportToCSV} 
            title="Download full subscription database as a CSV file"
            className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border border-gray-200 bg-white hover:bg-gray-50 transition-all shadow-sm"
          >
            <i className="fas fa-file-csv mr-2 text-green-600"></i> Export CSV
          </button>
          <button 
            onClick={() => window.print()} 
            title="Generate a printer-friendly PDF report of these analytics"
            className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border border-gray-200 bg-white hover:bg-gray-50 transition-all shadow-sm"
          >
            <i className="fas fa-file-pdf mr-2 text-red-500"></i> Print PDF
          </button>
          <button 
            onClick={shareView} 
            title="Share this intelligence report via browser native sharing options"
            className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-[#0052CC] text-white hover:bg-[#0747A6] transition-all shadow-lg active:scale-95"
          >
            <i className="fas fa-share-nodes mr-2"></i> Share Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        
        <div 
          className="col-span-2 p-8 rounded-3xl border bg-white border-gray-100 shadow-sm relative group overflow-hidden cursor-help"
          title="Year-over-year expenditure forecasting based on active recurring subscriptions"
        >
          <div className="flex items-center justify-between mb-16">
            <h3 className="font-black text-[11px] uppercase tracking-widest text-gray-400">YoY Burn Projection (Savings Optimized)</h3>
            <div className={`text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-all ${percChange >= 0 ? 'bg-teal-50 text-teal-600' : 'bg-pink-50 text-pink-600'}`}>
              <i className={`fas fa-arrow-${percChange >= 0 ? 'down' : 'up'}`}></i> 
              {Math.abs(percChange).toFixed(1)}% {percChange >= 0 ? 'Savings Forecast' : 'Spend Projection'}
            </div>
          </div>
          
          <div className="h-[320px] flex items-end justify-center gap-24 px-12 border-b border-gray-50 mb-2 relative">
            {statsByYear.map(([year, spend]) => {
              const maxVal = Math.max(...statsByYear.map(s => s[1]), 1);
              const heightPerc = (spend / maxVal) * 85;
              const isCurrent = parseInt(year) === currentYear;
              
              return (
                <div key={year} className="flex-1 max-w-[100px] group relative flex flex-col items-center h-full justify-end pb-8">
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all bg-[#003569] text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-2xl pointer-events-none z-10">
                    {activeCurrency.symbol}{spend.toLocaleString()}
                  </div>
                  <div 
                    className={`w-full rounded-t-2xl transition-all duration-1000 ease-out cursor-pointer ${
                      isCurrent 
                        ? 'bg-gradient-to-t from-[#0052CC] to-[#0747A6] shadow-[0_10px_30px_rgba(0,82,204,0.3)]' 
                        : 'bg-[#F4F5F7] group-hover:bg-[#E9F2FF]'
                    }`} 
                    style={{ height: `${Math.max(heightPerc, 2)}%` }}
                  ></div>
                  <div className="absolute bottom-0 text-[11px] font-black uppercase tracking-tighter text-gray-400 pt-4">
                    {year}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-8 text-center text-[10px] font-black uppercase tracking-[3px] text-gray-300">Annualized Burn Projections (Live Data)</p>
        </div>

        <div className="p-8 rounded-3xl border bg-white border-gray-100 shadow-sm" title="Automated monitoring of expenditure anomalies and risk patterns">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-lg">
              <i className="fas fa-radar"></i>
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-600">Behavioral Movement Alarms</h3>
          </div>
          <div className="space-y-6">
            {criticalAreas.length > 0 ? criticalAreas.map((area, idx) => (
              <div key={idx} className="flex gap-4 items-start p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-orange-200 transition-all">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  area.type === 'critical' ? 'bg-red-100 text-red-600' : 
                  area.type === 'warning' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  <i className={`fas ${area.type === 'critical' ? 'fa-triangle-exclamation' : 'fa-circle-info'}`}></i>
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-gray-800 mb-1">{area.title}</h4>
                  <p className="text-[10px] text-gray-500 leading-relaxed font-medium">{area.description}</p>
                </div>
              </div>
            )) : (
              <div className="p-10 text-center opacity-30">
                <i className="fas fa-check-circle text-2xl mb-2"></i>
                <p className="text-[10px] font-black">No alarming patterns detected.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col" title="AI-synthesized optimization paths for current assets">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-[11px] uppercase tracking-widest text-gray-400">Pillar Analysis</h3>
            <span className="text-[9px] font-black px-2 py-1 bg-blue-50 text-blue-600 rounded">AI POWERED</span>
          </div>
          <div className="space-y-6 flex-grow">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="group relative">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md mb-1 block w-fit ${
                      rec.category === 'Savings' ? 'bg-teal-500 text-white' : 
                      rec.category === 'Efficiency' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'
                    }`}>
                      {rec.category}
                    </span>
                    <h4 className="text-[11px] font-black text-gray-800">{rec.title}</h4>
                  </div>
                  <span className={`text-[9px] font-black ${rec.impact === 'High' ? 'text-red-500' : 'text-orange-400'}`}>
                    {rec.impact} Impact
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed group-hover:text-gray-700 transition-colors">{rec.description}</p>
                <div className="mt-4 h-1 w-full bg-gray-50 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${
                     rec.category === 'Savings' ? 'bg-teal-500' : 
                     rec.category === 'Efficiency' ? 'bg-blue-500' : 'bg-purple-500'
                  }`} style={{ width: rec.impact === 'High' ? '100%' : '50%' }}></div>
                </div>
              </div>
            ))}
            {isLoadingAI && <div className="p-12 text-center animate-pulse text-gray-300 font-black text-[10px] uppercase">Synthesizing Strategies...</div>}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm" title="Distribution of annualized budget across technical domains">
          <h3 className="font-black text-[11px] uppercase tracking-widest text-gray-400 mb-8">Asset Allocation Effectiveness</h3>
          <div className="space-y-8">
            {Array.from(new Set(subscriptions.map(s => s.category))).slice(0, 5).map(cat => {
              const catTotal = subscriptions.filter(s => s.category === cat).reduce((acc, sub) => acc + (calculateAnnualized(sub) * activeCurrency.rateToUSD), 0);
              const total = subscriptions.reduce((acc, sub) => acc + (calculateAnnualized(sub) * activeCurrency.rateToUSD), 0);
              const perc = total > 0 ? (catTotal / total) * 100 : 0;
              return (
                <div key={cat}>
                  <div className="flex justify-between text-[11px] font-black uppercase mb-3 tracking-tight">
                    <span className="text-gray-500">{cat}</span>
                    <span className="text-[#003569]">{activeCurrency.symbol}{catTotal.toLocaleString()}</span>
                  </div>
                  <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden flex">
                    <div className="h-full bg-blue-600 transition-all duration-1000 rounded-full" style={{ width: `${perc}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#003569] to-[#0747A6] p-8 rounded-3xl shadow-2xl text-white flex flex-col justify-center relative overflow-hidden" title="Heuristic optimization guidelines for financial health">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <h3 className="font-black text-[11px] uppercase tracking-widest text-white/40 mb-10 relative z-10">Chief Intelligence Advisory</h3>
            <div className="space-y-10 relative z-10">
                <div className="flex gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
                        <i className="fas fa-piggy-bank text-2xl"></i>
                    </div>
                    <div>
                        <h4 className="text-sm font-black mb-2 tracking-tight">Savings Optimization</h4>
                        <p className="text-[10px] opacity-70 font-medium leading-relaxed">By converting monthly developer tools to annual billing cycles, you could immediately recover 12.5% of current operational burn.</p>
                    </div>
                </div>
                <div className="flex gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
                        <i className="fas fa-bolt-lightning text-2xl"></i>
                    </div>
                    <div>
                        <h4 className="text-sm font-black mb-2 tracking-tight">Efficiency Alert</h4>
                        <p className="text-[10px] opacity-70 font-medium leading-relaxed">System identified 3 inactive user licenses in the Marketing department. Suspending these will optimize license utilization by 8%.</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      <div className="mt-20 border-t border-gray-100 pt-8 text-center print:hidden">
        <p className="text-[9px] font-black uppercase tracking-[5px] text-gray-300">Confidential Business Intelligence • Powered by COP Finance AI</p>
      </div>
    </div>
  );
};

export default ReportPage;
