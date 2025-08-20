import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/FormField";
import { Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AssumptionData, defaultAssumptions } from "@/types/assumptions";

const Index = () => {
  const [assumptions, setAssumptions] = useState<AssumptionData>(defaultAssumptions);
  const { toast } = useToast();

  // Load saved assumptions on mount
  useEffect(() => {
    const saved = localStorage.getItem('jetcharge-assumptions');
    if (saved) {
      try {
        setAssumptions(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved assumptions:', error);
      }
    }
  }, []);

  const updateAssumption = (section: keyof AssumptionData, key: string, value: number) => {
    setAssumptions(prev => ({
      ...prev,
      [section]: { ...(prev[section] as any), [key]: value }
    }));
  };

  const updateLabourMarkup = (value: number) => {
    setAssumptions(prev => ({ ...prev, labourMarkup: value }));
  };

  const handleSave = () => {
    localStorage.setItem('jetcharge-assumptions', JSON.stringify(assumptions));
    toast({ 
      title: "Settings Saved", 
      description: "Your assumptions have been saved successfully." 
    });
  };

  const handleReset = () => {
    setAssumptions(defaultAssumptions);
    localStorage.removeItem('jetcharge-assumptions');
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
        <div className="steel-panel rounded-xl shadow-large p-8 space-y-8 border border-steel-600/30">
          {/* Site Type Distances */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-chrome-white/90 uppercase tracking-wide">
              Site Type (m)
            </h3>
            <div className="space-y-3">
              <FormField
                label="Car Dealership"
                value={assumptions.siteDistances.carDealership}
                onChange={(value) => updateAssumption('siteDistances', 'carDealership', value)}
              />
              <FormField
                label="Public Station"
                value={assumptions.siteDistances.publicStation}
                onChange={(value) => updateAssumption('siteDistances', 'publicStation', value)}
              />
              <FormField
                label="Office Building"
                value={assumptions.siteDistances.officeBuilding}
                onChange={(value) => updateAssumption('siteDistances', 'officeBuilding', value)}
              />
              <FormField
                label="Apartment"
                value={assumptions.siteDistances.apartment}
                onChange={(value) => updateAssumption('siteDistances', 'apartment', value)}
              />
              <FormField
                label="House"
                value={assumptions.siteDistances.house}
                onChange={(value) => updateAssumption('siteDistances', 'house', value)}
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
                value={assumptions.cableCosts.ac}
                onChange={(value) => updateAssumption('cableCosts', 'ac', value)}
                prefix="$"
              />
              <FormField
                label="DC"
                value={assumptions.cableCosts.dc}
                onChange={(value) => updateAssumption('cableCosts', 'dc', value)}
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
                value={assumptions.carrierCosts.tray}
                onChange={(value) => updateAssumption('carrierCosts', 'tray', value)}
                prefix="$"
              />
              <FormField
                label="Trench"
                value={assumptions.carrierCosts.trench}
                onChange={(value) => updateAssumption('carrierCosts', 'trench', value)}
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
                value={assumptions.chargerPrices.ac}
                onChange={(value) => updateAssumption('chargerPrices', 'ac', value)}
                prefix="$"
              />
              <FormField
                label="DC"
                value={assumptions.chargerPrices.dc}
                onChange={(value) => updateAssumption('chargerPrices', 'dc', value)}
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
                value={assumptions.labourMarkup}
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
              className="flex-1 rounded-lg border-steel-600 text-steel-600 hover:bg-steel-700 hover:text-chrome-white transition-colors"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 rounded-lg bg-gradient-to-r from-warm-orange to-warm-amber text-chrome-white shadow-warm hover:shadow-large transition-all duration-200"
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
