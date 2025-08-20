import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/FormField";
import { Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Assumptions, DEFAULT_ASSUMPTIONS, assumptionsStore } from "@/lib/assumptions";

const Index = () => {
  const [assumptions, setAssumptions] = useState<Assumptions>(DEFAULT_ASSUMPTIONS);
  const { toast } = useToast();

  // Load assumptions from store on mount and migrate legacy data
  useEffect(() => {
    // Load current assumptions from store
    setAssumptions(assumptionsStore.getAssumptions());
    
    // One-time migration from legacy localStorage key
    const legacySaved = localStorage.getItem('jetcharge-assumptions');
    if (legacySaved) {
      try {
        const legacyData = JSON.parse(legacySaved);
        // Map legacy structure to new structure
        const migrated: Partial<Assumptions> = {
          siteTypeMeters: {
            'Car Dealership': legacyData.siteDistances?.carDealership ?? DEFAULT_ASSUMPTIONS.siteTypeMeters['Car Dealership'],
            'Public Station': legacyData.siteDistances?.publicStation ?? DEFAULT_ASSUMPTIONS.siteTypeMeters['Public Station'],
            'Office Building': legacyData.siteDistances?.officeBuilding ?? DEFAULT_ASSUMPTIONS.siteTypeMeters['Office Building'],
            'Apartment': legacyData.siteDistances?.apartment ?? DEFAULT_ASSUMPTIONS.siteTypeMeters['Apartment'],
            'House': legacyData.siteDistances?.house ?? DEFAULT_ASSUMPTIONS.siteTypeMeters['House'],
          },
          cableCostPerM: {
            ac: legacyData.cableCosts?.ac ?? DEFAULT_ASSUMPTIONS.cableCostPerM.ac,
            dc: legacyData.cableCosts?.dc ?? DEFAULT_ASSUMPTIONS.cableCostPerM.dc,
          },
          carrierPerM: {
            tray: legacyData.carrierCosts?.tray ?? DEFAULT_ASSUMPTIONS.carrierPerM.tray,
            trench: legacyData.carrierCosts?.trench ?? DEFAULT_ASSUMPTIONS.carrierPerM.trench,
          },
          chargerPrice: {
            ac: legacyData.chargerPrices?.ac ?? DEFAULT_ASSUMPTIONS.chargerPrice.ac,
            dc: legacyData.chargerPrices?.dc ?? DEFAULT_ASSUMPTIONS.chargerPrice.dc,
          },
          labourMarkupPct: legacyData.labourMarkup ?? DEFAULT_ASSUMPTIONS.labourMarkupPct,
        };
        
        // Merge into store and update local state
        assumptionsStore.setAssumptions(migrated);
        setAssumptions(assumptionsStore.getAssumptions());
        
        // Remove legacy key
        localStorage.removeItem('jetcharge-assumptions');
      } catch (error) {
        console.error('Failed to migrate legacy assumptions:', error);
      }
    }
  }, []);

  const updateSiteType = (siteType: keyof Assumptions['siteTypeMeters'], value: number) => {
    const updated = { ...assumptions };
    updated.siteTypeMeters[siteType] = value;
    setAssumptions(updated);
    assumptionsStore.setAssumptions({ siteTypeMeters: updated.siteTypeMeters });
  };

  const updateCableCost = (type: 'ac' | 'dc', value: number) => {
    const updated = { ...assumptions };
    updated.cableCostPerM[type] = value;
    setAssumptions(updated);
    assumptionsStore.setAssumptions({ cableCostPerM: updated.cableCostPerM });
  };

  const updateCarrierCost = (type: 'tray' | 'trench', value: number) => {
    const updated = { ...assumptions };
    updated.carrierPerM[type] = value;
    setAssumptions(updated);
    assumptionsStore.setAssumptions({ carrierPerM: updated.carrierPerM });
  };

  const updateChargerPrice = (type: 'ac' | 'dc', value: number) => {
    const updated = { ...assumptions };
    updated.chargerPrice[type] = value;
    setAssumptions(updated);
    assumptionsStore.setAssumptions({ chargerPrice: updated.chargerPrice });
  };

  const updateLabourMarkup = (value: number) => {
    const updated = { ...assumptions, labourMarkupPct: value };
    setAssumptions(updated);
    assumptionsStore.setAssumptions({ labourMarkupPct: value });
  };

  const handleSave = () => {
    assumptionsStore.setAssumptions(assumptions);
    toast({ 
      title: "Settings Saved", 
      description: "Your assumptions have been saved successfully." 
    });
  };

  const handleReset = () => {
    assumptionsStore.resetToDefaults();
    setAssumptions(assumptionsStore.getAssumptions());
    toast({ 
      title: "Settings Reset", 
      description: "All assumptions have been reset to default values." 
    });
  };

  return (
    <div className="min-h-screen p-6 flex items-center justify-center" style={{ background: 'var(--gradient-warm-sweep)' }}>
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-medium tracking-tight text-steel-600 mb-2">
            Assumptions
          </h1>
          <p className="text-sm text-steel-400">
            Configure calculation defaults
          </p>
        </div>

        {/* Form Card */}
        <div className="steel-panel rounded-xl p-8 space-y-8 border border-steel-600/30" style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.05)' }}>
          {/* Site Type Distances */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-chrome-white/90 uppercase tracking-wide">
              Site Type (m)
            </h3>
            <div className="space-y-3">
              <FormField
                label="Car Dealership"
                value={assumptions.siteTypeMeters['Car Dealership']}
                onChange={(value) => updateSiteType('Car Dealership', value)}
              />
              <FormField
                label="Public Station"
                value={assumptions.siteTypeMeters['Public Station']}
                onChange={(value) => updateSiteType('Public Station', value)}
              />
              <FormField
                label="Office Building"
                value={assumptions.siteTypeMeters['Office Building']}
                onChange={(value) => updateSiteType('Office Building', value)}
              />
              <FormField
                label="Apartment"
                value={assumptions.siteTypeMeters['Apartment']}
                onChange={(value) => updateSiteType('Apartment', value)}
              />
              <FormField
                label="House"
                value={assumptions.siteTypeMeters['House']}
                onChange={(value) => updateSiteType('House', value)}
              />
            </div>
          </div>

          {/* Cable Cost */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-chrome-white/90 uppercase tracking-wide">
              Cable Cost ($/m)
            </h3>
            <div className="space-y-3">
              <FormField
                label="AC"
                value={assumptions.cableCostPerM.ac}
                onChange={(value) => updateCableCost('ac', value)}
                prefix="$"
              />
              <FormField
                label="DC"
                value={assumptions.cableCostPerM.dc}
                onChange={(value) => updateCableCost('dc', value)}
                prefix="$"
              />
            </div>
          </div>

          {/* Cable Carrier Cost */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-chrome-white/90 uppercase tracking-wide">
              Cable Carrier Cost ($/m)
            </h3>
            <div className="space-y-3">
              <FormField
                label="Tray"
                value={assumptions.carrierPerM.tray}
                onChange={(value) => updateCarrierCost('tray', value)}
                prefix="$"
              />
              <FormField
                label="Trench"
                value={assumptions.carrierPerM.trench}
                onChange={(value) => updateCarrierCost('trench', value)}
                prefix="$"
              />
            </div>
          </div>

          {/* Charger Price */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-chrome-white/90 uppercase tracking-wide">
              Charger Price ($)
            </h3>
            <div className="space-y-3">
              <FormField
                label="AC"
                value={assumptions.chargerPrice.ac}
                onChange={(value) => updateChargerPrice('ac', value)}
                prefix="$"
              />
              <FormField
                label="DC"
                value={assumptions.chargerPrice.dc}
                onChange={(value) => updateChargerPrice('dc', value)}
                prefix="$"
              />
            </div>
          </div>

          {/* Labour Markup */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-chrome-white/90 uppercase tracking-wide">
              Labour Markup
            </h3>
            <div className="space-y-3">
              <FormField
                label="Markup (%)"
                value={assumptions.labourMarkupPct}
                onChange={updateLabourMarkup}
                step="0.01"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1 rounded-lg border-steel-600 text-steel-600 bg-chrome-white hover:bg-chrome-white hover:text-warm-orange transition-colors"
              data-testid="assumptions-reset"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 rounded-lg bg-gradient-to-r from-warm-orange to-warm-amber text-chrome-white shadow-warm hover:shadow-large transition-all duration-200"
              data-testid="assumptions-save"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
