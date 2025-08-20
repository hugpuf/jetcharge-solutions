export type SiteType = 'Car Dealership' | 'Public Station' | 'Office Building' | 'Apartment' | 'House';

export interface Assumptions {
  siteTypeMeters: Record<SiteType, number>;     // default run per site
  cableCostPerM: { ac: number; dc: number };    // $/m for copper
  carrierPerM:   { tray: number; trench: number }; // $/m carrier
  chargerPrice:  { ac: number; dc: number };    // $ per charger (unit)
  labourMarkupPct: number;                      // %
}

// DEFAULTS (match screenshot; change only via Assumptions UI)
export const DEFAULT_ASSUMPTIONS: Assumptions = {
  siteTypeMeters: {
    'Car Dealership': 50,
    'Public Station': 40,
    'Office Building': 40,
    'Apartment': 20,
    'House': 20,
  },
  cableCostPerM: { ac: 50, dc: 150 },
  carrierPerM:   { tray: 50, trench: 1000 },
  chargerPrice:  { ac: 2000, dc: 25000 },
  labourMarkupPct: 42.15,
};

const STORAGE_KEY = 'ev-calculator-assumptions';

class AssumptionsStore {
  private assumptions: Assumptions;

  constructor() {
    this.assumptions = this.loadFromStorage();
  }

  private loadFromStorage(): Assumptions {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle any missing properties
        return { ...DEFAULT_ASSUMPTIONS, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load assumptions from storage:', error);
    }
    return { ...DEFAULT_ASSUMPTIONS };
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.assumptions));
    } catch (error) {
      console.warn('Failed to save assumptions to storage:', error);
    }
  }

  getAssumptions(): Assumptions {
    return { ...this.assumptions };
  }

  setAssumptions(patch: Partial<Assumptions>): void {
    this.assumptions = { ...this.assumptions, ...patch };
    this.saveToStorage();
  }

  resetToDefaults(): void {
    this.assumptions = { ...DEFAULT_ASSUMPTIONS };
    this.saveToStorage();
  }
}

export const assumptionsStore = new AssumptionsStore();