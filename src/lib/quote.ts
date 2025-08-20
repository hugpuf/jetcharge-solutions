import { SiteType } from './assumptions';
import { Estimate } from './estimate';

export interface QuoteData {
  // Calculator inputs
  siteType: SiteType;
  acCount: number;
  dcCount: number;
  isUnderground: boolean;
  effectiveRunM: number;
  
  // Contact details (from modal)
  contactName: string;
  contactEmail: string;
  address: string;
  
  // Calculated values
  estimate: Estimate;
  
  // Derived values for display
  oneOffCost: number;
  operatingCostPA: number;
  incumbentAnnualPrice: number;
  estimatedCO2SavingsPA: number;
  
  // Quote metadata
  quoteNumber: string;
  dateGenerated: string;
  validUntil: string;
}

export interface LineItem {
  label: string;
  qty: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
}

// Generate quote number with current timestamp
export function generateQuoteNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const time = now.getTime().toString().slice(-6);
  return `EV${year}${month}${day}-${time}`;
}

// Calculate derived values for the quote
export function calculateQuoteMetrics(estimate: Estimate, siteType: SiteType): {
  oneOffCost: number;
  operatingCostPA: number;
  incumbentAnnualPrice: number;
  estimatedCO2SavingsPA: number;
} {
  // One-off cost is the base cost before markup
  const oneOffCost = estimate.cost;
  
  // Operating cost per annum (simplified - just markup portion)
  const operatingCostPA = estimate.finalPrice - estimate.cost;
  
  // Incumbent pricing (estimated based on site type)
  const incumbentMultipliers: Record<SiteType, number> = {
    'Car Dealership': 1.35,
    'Public Station': 1.42,
    'Office Building': 1.28,
    'Apartment': 1.25,
    'House': 1.20,
  };
  const incumbentAnnualPrice = Math.round(estimate.finalPrice * incumbentMultipliers[siteType]);
  
  // CO2 savings (estimated based on charger capacity)
  const estimatedCO2SavingsPA = Math.round((estimate.chargerCost / 1000) * 2.5); // Rough estimate
  
  return {
    oneOffCost,
    operatingCostPA,
    incumbentAnnualPrice,
    estimatedCO2SavingsPA,
  };
}

// Create line items for the quote
export function generateLineItems(estimate: Estimate, siteType: SiteType, acCount: number, dcCount: number, isUnderground: boolean): LineItem[] {
  const items: LineItem[] = [];
  
  // Charger equipment
  if (acCount > 0) {
    items.push({
      label: 'AC Charging Units',
      qty: acCount,
      unit: 'unit',
      unitPrice: 2000,
      subtotal: acCount * 2000,
    });
  }
  
  if (dcCount > 0) {
    items.push({
      label: 'DC Fast Charging Units',
      qty: dcCount,
      unit: 'unit',
      unitPrice: 25000,
      subtotal: dcCount * 25000,
    });
  }
  
  // Cabling and installation
  items.push({
    label: `Cable Installation (${isUnderground ? 'Underground' : 'Surface'})`,
    qty: estimate.effectiveRunM,
    unit: 'm',
    unitPrice: Math.round(estimate.perMeterRate),
    subtotal: estimate.cablingCost,
  });
  
  // Installation and commissioning
  items.push({
    label: 'Installation & Commissioning',
    qty: 1,
    unit: 'lot',
    unitPrice: Math.round(estimate.finalPrice - estimate.cost),
    subtotal: estimate.finalPrice - estimate.cost,
  });
  
  return items;
}

// Serialize quote data to URL parameters
export function serializeQuoteData(data: Partial<QuoteData>): string {
  const params = new URLSearchParams();
  
  if (data.siteType) params.set('siteType', data.siteType);
  if (data.acCount !== undefined) params.set('acCount', data.acCount.toString());
  if (data.dcCount !== undefined) params.set('dcCount', data.dcCount.toString());
  if (data.isUnderground !== undefined) params.set('isUnderground', data.isUnderground.toString());
  if (data.effectiveRunM !== undefined) params.set('effectiveRunM', data.effectiveRunM.toString());
  if (data.contactName) params.set('contactName', data.contactName);
  if (data.contactEmail) params.set('contactEmail', data.contactEmail);
  if (data.address) params.set('address', data.address);
  
  // Serialize estimate
  if (data.estimate) {
    params.set('finalPrice', data.estimate.finalPrice.toString());
    params.set('cost', data.estimate.cost.toString());
    params.set('cablingCost', data.estimate.cablingCost.toString());
    params.set('chargerCost', data.estimate.chargerCost.toString());
  }
  
  return params.toString();
}

// Deserialize quote data from URL parameters
export function deserializeQuoteData(searchParams: URLSearchParams): Partial<QuoteData> {
  const data: Partial<QuoteData> = {};
  
  const siteType = searchParams.get('siteType') as SiteType;
  if (siteType) data.siteType = siteType;
  
  const acCount = searchParams.get('acCount');
  if (acCount) data.acCount = parseInt(acCount, 10);
  
  const dcCount = searchParams.get('dcCount');
  if (dcCount) data.dcCount = parseInt(dcCount, 10);
  
  const isUnderground = searchParams.get('isUnderground');
  if (isUnderground) data.isUnderground = isUnderground === 'true';
  
  const effectiveRunM = searchParams.get('effectiveRunM');
  if (effectiveRunM) data.effectiveRunM = parseInt(effectiveRunM, 10);
  
  data.contactName = searchParams.get('contactName') || '';
  data.contactEmail = searchParams.get('contactEmail') || '';
  data.address = searchParams.get('address') || '';
  
  // Deserialize estimate
  const finalPrice = searchParams.get('finalPrice');
  const cost = searchParams.get('cost');
  const cablingCost = searchParams.get('cablingCost');
  const chargerCost = searchParams.get('chargerCost');
  
  if (finalPrice && cost && cablingCost && chargerCost) {
    data.estimate = {
      finalPrice: parseFloat(finalPrice),
      cost: parseFloat(cost),
      cablingCost: parseFloat(cablingCost),
      chargerCost: parseFloat(chargerCost),
      effectiveRunM: data.effectiveRunM || 0,
      perMeterRate: 0, // Will be recalculated if needed
    };
  }
  
  return data;
}