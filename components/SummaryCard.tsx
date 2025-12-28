
import React from 'react';

interface SummaryCardProps {
  label: string;
  value: number;
  symbol: string;
  trend: string;
  trendDown?: boolean;
  accentColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, symbol, trend, trendDown, accentColor }) => {
  const getTooltip = (l: string) => {
    switch (l) {
      case 'Total Annual': return 'Total projected expenditure for all active subscriptions over a 12-month period.';
      case 'Monthly Avg': return 'The average cash outflow expected each month based on current recurring leads.';
      case 'Renewals': return 'Count of subscription assets reaching their billing milestone within the current calendar month.';
      case 'Departments': return 'Number of unique internal business units currently managing subscription leads.';
      case 'Critical Items': return 'Subscriptions requiring manual renewal intervention to prevent service lapse.';
      case 'Avg/Dept': return 'Mean annualized expenditure per participating department.';
      default: return '';
    }
  };

  return (
    <div 
      className={`bg-white border-t-4 ${accentColor} rounded-lg p-5 shadow-sm hover:shadow-md transition-all cursor-help`}
      title={getTooltip(label)}
    >
      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</div>
      <div className="text-2xl font-black text-gray-800 tracking-tight">
        {symbol}{value.toLocaleString(undefined, { maximumFractionDigits: value > 1000 ? 1 : 2 })}
        {value >= 1000 && <span className="text-sm ml-0.5 opacity-50 font-bold uppercase">K</span>}
      </div>
      <div className={`mt-2 flex items-center gap-1.5 text-xs font-bold ${trendDown ? 'text-pink-600' : 'text-teal-600'}`}>
        <i className={`fas fa-caret-${trendDown ? 'down' : 'up'}`}></i>
        {trend}
        <span className="text-gray-400 font-medium">from previous 30 days</span>
      </div>
    </div>
  );
};

export default SummaryCard;
