import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { defaultAssumptions } from "@/types/assumptions";

type SiteType = 'carDealership' | 'publicStation' | 'officeBuilding' | 'apartment' | 'house';

const siteTypeOptions = [
  { value: 'carDealership', label: 'Car Dealership' },
  { value: 'publicStation', label: 'Public Charging Station' },
  { value: 'officeBuilding', label: 'Office Building' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
];

export default function Calculator() {
  const [siteType, setSiteType] = useState<SiteType>('carDealership');
  const [acChargers, setAcChargers] = useState(0);
  const [dcChargers, setDcChargers] = useState(0);
  const [underground, setUnderground] = useState(false);

  const calculateCost = () => {
    const assumptions = defaultAssumptions;
    const distance = assumptions.siteDistances[siteType];
    
    // Base charger costs
    const acCost = acChargers * assumptions.chargerPrices.ac;
    const dcCost = dcChargers * assumptions.chargerPrices.dc;
    
    // Cable costs based on distance and charger type
    const acCableCost = acChargers * distance * assumptions.cableCosts.ac;
    const dcCableCost = dcChargers * distance * assumptions.cableCosts.dc;
    
    // Carrier costs (trenching vs tray based on underground option)
    const carrierCostPerMeter = underground ? assumptions.carrierCosts.trench : assumptions.carrierCosts.tray;
    const totalDistance = (acChargers + dcChargers) * distance;
    const carrierCost = totalDistance * carrierCostPerMeter;
    
    const baseCost = acCost + dcCost + acCableCost + dcCableCost + carrierCost;
    const finalPrice = baseCost * (1 + assumptions.labourMarkup / 100);
    
    return { baseCost: Math.round(baseCost), finalPrice: Math.round(finalPrice) };
  };

  const { baseCost, finalPrice } = calculateCost();

  return (
    <div className="min-h-screen bg-gradient-to-br from-steel-50 to-steel-100 p-6">
      <div className="container mx-auto h-full flex gap-8">
        {/* Left side - Empty for now */}
        <div className="flex-1">
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-steel-400">
              <h2 className="text-2xl font-medium mb-2">Character Preview</h2>
              <p className="text-sm">Your charging station visualization will appear here</p>
            </div>
          </div>
        </div>

        {/* Right side - Calculator Panel (35% width) */}
        <div className="w-[35%]">
          <Card className="steel-panel elevation-plate warm-glow h-full">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-medium tracking-tight text-chrome-white text-center">
                CREATE YOUR CHARGING STATION
              </CardTitle>
              <p className="text-sm text-chrome-white/80">
                Configure your EV charging infrastructure
              </p>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {/* Site Type */}
              <div className="space-y-3">
                <Label className="text-sm uppercase tracking-wide text-chrome-white/90">
                  Site Type
                </Label>
                <Select value={siteType} onValueChange={(value: SiteType) => setSiteType(value)}>
                  <SelectTrigger className="input-pill h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {siteTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* AC Chargers */}
              <div className="space-y-3">
                <Label className="text-sm uppercase tracking-wide text-chrome-white/90">
                  AC Chargers
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={acChargers}
                  onChange={(e) => setAcChargers(Number(e.target.value) || 0)}
                  className="input-pill numeric-input h-11"
                  placeholder="0"
                />
              </div>

              {/* DC Chargers */}
              <div className="space-y-3">
                <Label className="text-sm uppercase tracking-wide text-chrome-white/90">
                  DC Fast Chargers
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={dcChargers}
                  onChange={(e) => setDcChargers(Number(e.target.value) || 0)}
                  className="input-pill numeric-input h-11"
                  placeholder="0"
                />
              </div>

              {/* Underground Cable */}
              <div className="space-y-3">
                <Label className="text-sm uppercase tracking-wide text-chrome-white/90">
                  Installation Type
                </Label>
                <div className="flex items-center space-x-3 bg-steel-600/20 rounded-xl p-4">
                  <Checkbox
                    id="underground"
                    checked={underground}
                    onCheckedChange={(checked) => setUnderground(checked as boolean)}
                  />
                  <Label htmlFor="underground" className="text-chrome-white cursor-pointer">
                    Run cable underground
                  </Label>
                </div>
              </div>

              {/* Cost Display */}
              <div className="space-y-4 pt-6 border-t border-steel-600/30">
                <div className="flex justify-between items-center">
                  <span className="text-sm uppercase tracking-wide text-chrome-white/70">
                    Base Cost
                  </span>
                  <span className="text-lg font-medium text-chrome-white numeric-input">
                    ${baseCost.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-warm-orange/10 rounded-xl border border-warm-orange/20">
                  <span className="text-sm uppercase tracking-wide text-warm-orange font-medium">
                    Final Price
                  </span>
                  <span className="text-2xl font-medium text-warm-orange numeric-input">
                    ${finalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center p-3 bg-steel-600/20 rounded-lg">
                  <div className="text-2xl font-medium text-chrome-white numeric-input">
                    {acChargers + dcChargers}
                  </div>
                  <div className="text-xs uppercase tracking-wide text-chrome-white/70">
                    Total Chargers
                  </div>
                </div>
                <div className="text-center p-3 bg-steel-600/20 rounded-lg">
                  <div className="text-2xl font-medium text-chrome-white numeric-input">
                    {defaultAssumptions.siteDistances[siteType]}m
                  </div>
                  <div className="text-xs uppercase tracking-wide text-chrome-white/70">
                    Cable Distance
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}