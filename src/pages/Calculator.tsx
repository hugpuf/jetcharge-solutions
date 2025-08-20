import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { defaultAssumptions } from "@/types/assumptions";
import { Minus, Plus } from "lucide-react";

type SiteType = 'carDealership' | 'publicStation' | 'officeBuilding' | 'apartment' | 'house';

const siteTypeOptions = [
  { value: 'carDealership', label: 'Car Dealership' },
  { value: 'publicStation', label: 'Public Charging Station' },
  { value: 'officeBuilding', label: 'Office Building' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
];

const SCALE_STEPS = [0.75, 0.875, 1, 1.125, 1.25];

export default function Calculator() {
  const [siteType, setSiteType] = useState<SiteType | null>(null);
  const [acChargers, setAcChargers] = useState(0);
  const [dcChargers, setDcChargers] = useState(0);
  const [underground, setUnderground] = useState(false);
  const [scaleIndex, setScaleIndex] = useState(2); // Default to middle (1x scale)

  const calculateCost = () => {
    // Return 0 if no site type is selected
    if (!siteType) {
      return { finalPrice: 0, baseDistance: 0, adjustedDistance: 0 };
    }

    const assumptions = defaultAssumptions;
    const baseDistance = assumptions.siteDistances[siteType];
    const adjustedDistance = Math.round(baseDistance * SCALE_STEPS[scaleIndex]);

    const acCost = acChargers * assumptions.chargerPrices.ac;
    const dcCost = dcChargers * assumptions.chargerPrices.dc;

    const acCableCost = acChargers * adjustedDistance * assumptions.cableCosts.ac;
    const dcCableCost = dcChargers * adjustedDistance * assumptions.cableCosts.dc;

    const carrierCostPerMeter = underground ? assumptions.carrierCosts.trench : assumptions.carrierCosts.tray;
    const totalDistance = (acChargers + dcChargers) * adjustedDistance;
    const carrierCost = totalDistance * carrierCostPerMeter;

    const baseCost = acCost + dcCost + acCableCost + dcCableCost + carrierCost;
    const finalPrice = baseCost * (1 + assumptions.labourMarkup / 100);

    return { finalPrice: Math.round(finalPrice), baseDistance, adjustedDistance };
  };

  const { finalPrice, adjustedDistance } = calculateCost();

  const handleSiteTypeChange = (value: SiteType) => {
    setSiteType(value);
    setScaleIndex(2); // Reset to default scale when site changes
  };

  return (
    <div className="min-h-screen bg-gradient-warm-sweep flex items-center justify-center p-4">
      <div className="w-full max-w-7xl">
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-8 lg:gap-12 items-center">
          {/* Preview Column */}
          <div className="order-1 lg:order-1 flex items-center justify-center min-h-[300px] lg:min-h-[400px]">
            <div className="text-center text-steel-400">
              <h2 className="text-2xl font-medium mb-2">Character Preview</h2>
              <p className="text-sm">Your charging station visualization will appear here</p>
            </div>
          </div>

          {/* Calculator Column */}
          <div className="order-2 lg:order-2 relative w-full max-w-md lg:max-w-none mx-auto">
          <Card className="steel-panel elevation-plate h-full">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-medium tracking-tight text-chrome-white text-center">
                CREATE YOUR CHARGING STATION
              </CardTitle>
              <p className="text-sm text-chrome-white/80 text-center">
                Configure your EV charging infrastructure
              </p>
            </CardHeader>

            <CardContent className="space-y-8 pb-8">
              {/* Configuration Group */}
              <div className="space-y-6">
                {/* Site Type */}
                <div className="space-y-3 w-full">
                  <Label className="text-sm uppercase tracking-wide text-chrome-white/90">
                    Site Type
                  </Label>
                  <Select value={siteType || ""} onValueChange={handleSiteTypeChange}>
                    <SelectTrigger className="input-pill input-pill--tall input-pill--full">
                      <SelectValue placeholder="Select site type" />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      {siteTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Cable Run Distance - Only show when site is selected */}
                {siteType && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Slider
                          value={[scaleIndex]}
                          onValueChange={(value) => setScaleIndex(value[0])}
                          min={0}
                          max={4}
                          step={1}
                          className="w-full [&_[role=slider]]:bg-chrome-white [&_[role=slider]]:border-steel-400 [&>div]:bg-steel-500 [&>div>div]:bg-steel-400"
                        />
                        <div className="flex justify-between text-xs text-chrome-white/60 mt-2">
                          <span>Smaller</span>
                          <span>Default</span>
                          <span>Larger</span>
                        </div>
                      </div>
                      <div className="bg-steel-600 text-warm-orange p-4 rounded-xl flex items-center justify-between border border-warm-orange/20">
                        <div className="text-sm font-medium uppercase tracking-wide">
                          CABLE RUN
                        </div>
                        <div className="text-2xl font-medium numeric-input">
                          {adjustedDistance}m
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AC Chargers */}
                <div className="flex items-center justify-between">
                  <Label className="text-sm uppercase tracking-wide text-chrome-white/90">
                    AC Chargers
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-xl border-steel-600/30 bg-transparent text-chrome-white hover:bg-white/10"
                      onClick={() => setAcChargers(Math.max(0, acChargers - 1))}
                      disabled={acChargers === 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-chrome-white font-medium w-8 text-center">{acChargers}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-xl border-steel-600/30 bg-transparent text-chrome-white hover:bg-white/10"
                      onClick={() => setAcChargers(acChargers + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* DC Fast Chargers */}
                <div className="flex items-center justify-between">
                  <Label className="text-sm uppercase tracking-wide text-chrome-white/90">
                    DC Fast Chargers
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-xl border-steel-600/30 bg-transparent text-chrome-white hover:bg-white/10"
                      onClick={() => setDcChargers(Math.max(0, dcChargers - 1))}
                      disabled={dcChargers === 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-chrome-white font-medium w-8 text-center">{dcChargers}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-xl border-steel-600/30 bg-transparent text-chrome-white hover:bg-white/10"
                      onClick={() => setDcChargers(dcChargers + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Installation Type - Segmented Control */}
                <div className="flex items-center justify-between">
                  <Label className="text-sm uppercase tracking-wide text-chrome-white/90">
                    Installation Type
                  </Label>
                  <div className="flex rounded-xl border border-steel-600/30 bg-steel-600/20 p-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 px-3 rounded-lg text-xs font-medium ${
                        !underground
                          ? 'bg-chrome-white text-steel-600'
                          : 'text-chrome-white hover:bg-white/10'
                      }`}
                      onClick={() => setUnderground(false)}
                    >
                      Surface run
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 px-3 rounded-lg text-xs font-medium ${
                        underground
                          ? 'bg-chrome-white text-steel-600'
                          : 'text-chrome-white hover:bg-white/10'
                      }`}
                      onClick={() => setUnderground(true)}
                    >
                      Underground
                    </Button>
                  </div>
                </div>
              </div>

              {/* Estimate Group */}
              <div className="pt-6 border-t border-steel-600/30">
                <div className="bg-steel-600 text-warm-orange p-4 rounded-xl flex items-center justify-between border border-warm-orange/20">
                  <div className="text-sm font-medium uppercase tracking-wide">
                    ESTIMATED PRICE
                  </div>
                  <div className="text-2xl font-medium numeric-input">
                    ${finalPrice.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action - Floating separate from steel panel */}
          <div className="absolute -bottom-20 left-0 right-0">
            <Button className="floating-cta w-full h-16 bg-gradient-to-r from-warm-orange to-warm-amber text-chrome-white font-medium text-base uppercase tracking-wide rounded-xl hover:shadow-lg transition-all duration-300">
              SEND ME A PRICE BREAKDOWN
            </Button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}