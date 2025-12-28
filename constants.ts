
import { Subscription, BillingCycle } from './types';

export const CATEGORIES = [
  'Cloud Infrastructure',
  'SaaS Productivity',
  'Cybersecurity & VPN',
  'Hosting & Domains',
  'Developer Tools',
  'AI & API Services',
  'Networking & Ops',
  'Tech Training',
  'Other IT Services'
];

export const DEPARTMENTS = [
  'Engineering',
  'Marketing',
  'Human Resources',
  'Finance',
  'Operations',
  'Product',
  'Sales',
  'Legal'
];

export const INITIAL_DATA: Subscription[] = [
  {
    id: '1',
    name: 'AWS Instance',
    department: 'Engineering',
    category: 'Cloud Infrastructure',
    description: 'Main production server for the web portal.',
    dateStarted: '2025-01-16',
    billingCycle: BillingCycle.MONTHLY,
    renewalDate: '2025-03-16',
    trialPrice: 0,
    regularPrice: 2500.00,
    priceCurrency: 'PHP',
    autoRenew: true,
    url: 'https://aws.amazon.com',
    subscriber: {
      firstName: 'David',
      lastName: 'Jara',
      email: 'david.jara@cop-tdi.com',
      designation: 'Senior Engineer',
      mobile: '+63 912 345 6789'
    },
    payment: {
      cardType: 'Visa',
      cardholderName: 'David Jara',
      lastFour: '4242',
      expiryDate: '12/28'
    },
    reminders: [60],
    attachments: []
  },
  {
    id: '2',
    name: 'GitHub Copilot',
    department: 'Engineering',
    category: 'Developer Tools',
    description: 'AI-powered productivity.',
    dateStarted: '2024-11-10',
    billingCycle: BillingCycle.MONTHLY,
    renewalDate: '2025-04-10',
    trialPrice: 0,
    regularPrice: 19.00,
    priceCurrency: 'USD',
    autoRenew: true,
    url: 'https://github.com',
    subscriber: {
      firstName: 'Juan',
      lastName: 'DC',
      email: 'juan.dc@cop-tdi.com',
      designation: 'DevOps Lead',
      mobile: '+63 917 111 2222'
    },
    payment: {
      cardType: 'Mastercard',
      cardholderName: 'Juan DC',
      lastFour: '8812',
      expiryDate: '05/26'
    },
    reminders: [30, 7],
    attachments: []
  }
];

export const DEFAULT_COLUMNS = [
  { id: 'sub', label: 'Subscription', visible: true, order: 0 },
  { id: 'dept', label: 'Department', visible: true, order: 1 },
  { id: 'admin', label: 'Subscriber', visible: true, order: 2 },
  { id: 'pay', label: 'Payment', visible: true, order: 3 },
  { id: 'ren', label: 'Renewal', visible: true, order: 4 },
  { id: 'stat', label: 'Status', visible: true, order: 5 },
  { id: 'unit', label: 'Unit Price', visible: true, order: 6 },
  { id: 'ann', label: 'Annual', visible: true, order: 7 }
];
