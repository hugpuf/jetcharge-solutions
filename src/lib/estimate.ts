import { Assumptions, SiteType } from './assumptions';

export type Estimate = {
  effectiveRunM: number;
  perMeterRate: number;
  cablingCost: number;
  chargerCost: number;
  cost: number;           // subtotal before markup
  finalPrice: number;     // with markup
};

export function computeEstimate(
  input: {
    siteType: SiteType;
    acCount: number;
    dcCount: number;
    isUnderground: boolean;
    runFactor: number; // 0.5..2.0
  },
  a: Assumptions
): Estimate {
  const base = a.siteTypeMeters[input.siteType] ?? 0;
  const effectiveRunM = Math.max(0, Math.round(base * input.runFactor));

  const carrier = input.isUnderground ? a.carrierPerM.trench : a.carrierPerM.tray;

  const perMeterRate =
    input.dcCount * a.cableCostPerM.dc +
    input.acCount * a.cableCostPerM.ac +
    carrier;

  const cablingCost = effectiveRunM * perMeterRate;

  const chargerCost =
    input.acCount * a.chargerPrice.ac +
    input.dcCount * a.chargerPrice.dc;

  const cost = cablingCost + chargerCost;
  const finalPrice = cost * (1 + a.labourMarkupPct / 100);

  return { effectiveRunM, perMeterRate, cablingCost, chargerCost, cost, finalPrice };
}

export const fmtMoney = (n: number) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(n);