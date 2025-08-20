import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export default function Calculator() {
  const [siteType, setSiteType] = useState<SiteType>('carDealership');
  const [acChargers, setAcChargers] = useState(0);
  const [dcChargers, setDcChargers] = useState(0);
  const [underground, setUnderground] = useState(false);

  const calculateCost = () => {
    const assumptions = defaultAssumptions;
    const distance = assumptions.siteDistances[siteType];

    const acCost = acChargers * assumptions.chargerPrices.ac;
    const dcCost = dcChargers * assumptions.chargerPrices.dc;

    const acCableCost = acChargers * distance * assumptions.cableCosts.ac;
    const dcCableCost = dcChargers * distance * assumptions.cableCosts.dc;

    const carrierCostPerMeter = underground ? assumptions.carrierCosts.trench : assumptions.carrierCosts.tray;
    const totalDistance = (acChargers + dcChargers) * distance;
    const carrierCost = totalDistance * carrierCostPerMeter;

    const baseCost = acCost + dcCost + acCableCost + dcCableCost + carrierCost;
    const finalPrice = baseCost * (1 + assumptions.labourMarkup / 100);

    return { finalPrice: Math.round(finalPrice) };
  };

  const { finalPrice } = calculateCost();

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
              <p className="text-sm text-chrome-white/80 text-center">
                Configure your EV charging infrastructure
              </p>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Configuration Group */}
              <div className="space-y-6">
                {/* Site Type */}
                <div className="space-y-3">
                  <Label className="text-sm uppercase tracking-wide text-chrome-white/90">
                    Site Type
                  </Label>
                  <Select value={siteType} onValueChange={(value: SiteType) => setSiteType(value)}>
                    <SelectTrigger className="input-pill h-11 w-full">
                      <SelectValue />
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
        </div>
      </div>
    </div>
  );
}