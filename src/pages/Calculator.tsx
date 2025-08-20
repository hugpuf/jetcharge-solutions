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
    
    return { finalPrice: Math.round(finalPrice) };
  };

  const { finalPrice } = calculateCost();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EDECE7] to-white p-6">
      <div className="container mx-auto h-full flex gap-8">
        {/* Left side - Empty for now */}
        <div className="flex-1">
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-[#26252A]/60">
              <h2 className="text-xl font-medium mb-2">Station Preview</h2>
              <p className="text-sm">Your charging station visualization will appear here</p>
            </div>
          </div>
        </div>

        {/* Right side - Calculator Panel (35% width) */}
        <div className="w-[35%]">
          <Card className="bg-[#26252A] rounded-[2px] shadow-[0_8px_24px_rgba(38,37,42,0.18),0_1px_3px_rgba(38,37,42,0.12)] h-full border-0">
            <CardHeader className="text-center space-y-2 pb-6">
              <CardTitle className="text-lg font-semibold tracking-tight text-white">
                Create Your Charging Station
              </CardTitle>
              <p className="text-sm text-white/70">
                Configure your EV charging infrastructure
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Configuration Group */}
              <div className="space-y-4">
                {/* Site Type */}
                <div className="space-y-3">
                  <Label className="text-sm text-white/90 block">
                    Site type
                  </Label>
                  <Select value={siteType} onValueChange={(value: SiteType) => setSiteType(value)}>
                    <SelectTrigger className="w-full h-10 rounded-[2px] border-[#26252A]/20 bg-white text-[#26252A] min-w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-[2px]">
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
                  <Label className="text-sm text-white/90">
                    AC chargers
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-[2px] border-white/20 bg-transparent text-white hover:bg-white/10"
                      onClick={() => setAcChargers(Math.max(0, acChargers - 1))}
                      disabled={acChargers === 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-white font-medium w-8 text-center">{acChargers}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-[2px] border-white/20 bg-transparent text-white hover:bg-white/10"
                      onClick={() => setAcChargers(acChargers + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* DC Fast Chargers */}
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-white/90">
                    DC fast chargers
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-[2px] border-white/20 bg-transparent text-white hover:bg-white/10"
                      onClick={() => setDcChargers(Math.max(0, dcChargers - 1))}
                      disabled={dcChargers === 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-white font-medium w-8 text-center">{dcChargers}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-[2px] border-white/20 bg-transparent text-white hover:bg-white/10"
                      onClick={() => setDcChargers(dcChargers + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Installation Type */}
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-white/90">
                    Installation type
                  </Label>
                  <div className="flex rounded-[2px] border border-white/20 bg-transparent">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 px-3 rounded-[2px] text-xs font-medium ${
                        !underground 
                          ? 'bg-white text-[#26252A]' 
                          : 'text-white hover:bg-white/10'
                      }`}
                      onClick={() => setUnderground(false)}
                    >
                      Surface run
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 px-3 rounded-[2px] text-xs font-medium ${
                        underground 
                          ? 'bg-white text-[#26252A]' 
                          : 'text-white hover:bg-white/10'
                      }`}
                      onClick={() => setUnderground(true)}
                    >
                      Underground
                    </Button>
                  </div>
                </div>
              </div>

              {/* Estimate Group */}
              <div className="pt-6 border-t border-white/10">
                <div className="bg-[#F5841A] text-white p-4 rounded-[2px] text-center">
                  <div className="text-sm font-medium uppercase tracking-wide mb-1">
                    Final Price
                  </div>
                  <div className="text-2xl font-bold">
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