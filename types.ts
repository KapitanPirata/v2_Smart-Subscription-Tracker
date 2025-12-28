
export enum BillingCycle {
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly',
  ANNUALLY = 'Annually'
}

export type AppView = 'dashboard' | 'reports';

export interface Currency {
  code: string;
  symbol: string;
  rateToUSD: number;
}

export interface SubscriberDetails {
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  mobile: string;
}

export interface PaymentDetails {
  cardType: string;
  cardholderName: string;
  lastFour: string;
  expiryDate: string; // MM/YY
}

export interface SubscriptionAttachment {
  name: string;
  type: string;
  data: string; // base64
}

export interface Subscription {
  id: string;
  name: string;
  department: string;
  category: string;
  description: string;
  dateStarted: string;
  billingCycle: BillingCycle;
  renewalDate: string;
  trialPrice: number;
  regularPrice: number;
  priceCurrency: string;
  autoRenew: boolean;
  url: string;
  subscriber: SubscriberDetails;
  payment: PaymentDetails;
  reminders: number[];
  attachments: SubscriptionAttachment[];
}

export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

export interface SummaryStats {
  yearlySpend: number;
  monthlySpend: number;
}

export interface InsightRecommendation {
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  category: 'Savings' | 'Efficiency' | 'Effectiveness';
}
