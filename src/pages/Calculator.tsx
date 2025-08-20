import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Minus, Plus } from "lucide-react";
import { SiteType, assumptionsStore } from "@/lib/assumptions";
import { computeEstimate, fmtMoney } from "@/lib/estimate";

const siteTypeOptions: { value: SiteType; label: string }[] = [
  { value: 'Car Dealership', label: 'Car Dealership' },
  { value: 'Public Station', label: 'Public Charging Station' },
  { value: 'Office Building', label: 'Office Building' },
  { value: 'Apartment', label: 'Apartment' },
  { value: 'House', label: 'House' },
];

// Slider range: 0.5 to 2.0 in steps of 0.05 (30 steps)
const MIN_FACTOR = 0.5;
const MAX_FACTOR = 2.0;
const FACTOR_STEP = 0.05;
const FACTOR_STEPS = Math.round((MAX_FACTOR - MIN_FACTOR) / FACTOR_STEP);
const DEFAULT_FACTOR_INDEX = Math.round((1.0 - MIN_FACTOR) / FACTOR_STEP); // Index for 1.0

export default function Calculator() {
  const [siteType, setSiteType] = useState<SiteType | null>(null);
  const [acCount, setAcCount] = useState(0);
  const [dcCount, setDcCount] = useState(0);
  const [isUnderground, setIsUnderground] = useState(false);
  const [runFactorIndex, setRunFactorIndex] = useState(DEFAULT_FACTOR_INDEX);

  const runFactor = MIN_FACTOR + (runFactorIndex * FACTOR_STEP);

  const calculateEstimate = useCallback(() => {
    if (!siteType) {
      return {
        effectiveRunM: 0,
        perMeterRate: 0,
        cablingCost: 0,
        chargerCost: 0,
        cost: 0,
        finalPrice: 0
      };
    }

    const assumptions = assumptionsStore.getAssumptions();
    return computeEstimate({
      siteType,
      acCount,
      dcCount,
      isUnderground,
      runFactor
    }, assumptions);
  }, [siteType, acCount, dcCount, isUnderground, runFactor]);

  const estimate = calculateEstimate();

  const handleSiteTypeChange = (value: SiteType) => {
    setSiteType(value);
    setRunFactorIndex(DEFAULT_FACTOR_INDEX); // Reset to default factor
  };

  const handleAcIncrement = () => setAcCount(prev => prev + 1);
  const handleAcDecrement = () => setAcCount(prev => Math.max(0, prev - 1));
  const handleDcIncrement = () => setDcCount(prev => prev + 1);
  const handleDcDecrement = () => setDcCount(prev => Math.max(0, prev - 1));

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
                    <Select value={siteType || ""} onValueChange={handleSiteTypeChange} data-testid="site-type-select">
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
                            value={[runFactorIndex]}
                            onValueChange={(value) => setRunFactorIndex(value[0])}
                            min={0}
                            max={FACTOR_STEPS}
                            step={1}
                            className="w-full [&_[role=slider]]:bg-chrome-white [&_[role=slider]]:border-steel-400 [&>div]:bg-steel-500 [&>div>div]:bg-steel-400"
                            data-testid="run-slider"
                          />
                          <div className="flex justify-between text-xs text-chrome-white/60 mt-2">
                            <span>Smaller</span>
                            <span className={runFactorIndex === DEFAULT_FACTOR_INDEX ? "text-warm-orange font-medium" : ""}>Default</span>
                            <span>Larger</span>
                          </div>
                        </div>
                        <div className="bg-steel-600 text-warm-orange p-3 rounded-xl flex items-center gap-2 border border-warm-orange/20" data-testid="run-pill">
                          <div className="text-xs font-medium uppercase tracking-wide">
                            CABLE RUN
                          </div>
                          <div className="text-sm font-medium numeric-input">
                            {estimate.effectiveRunM}m
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
                        onClick={handleAcDecrement}
                        disabled={acCount === 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-chrome-white font-medium w-8 text-center" data-testid="ac-count">{acCount}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-xl border-steel-600/30 bg-transparent text-chrome-white hover:bg-white/10"
                        onClick={handleAcIncrement}
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
                        onClick={handleDcDecrement}
                        disabled={dcCount === 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-chrome-white font-medium w-8 text-center" data-testid="dc-count">{dcCount}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-xl border-steel-600/30 bg-transparent text-chrome-white hover:bg-white/10"
                        onClick={handleDcIncrement}
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
                          !isUnderground
                            ? 'bg-chrome-white text-steel-600'
                            : 'text-chrome-white hover:bg-white/10'
                        }`}
                        onClick={() => setIsUnderground(false)}
                        data-testid="install-type-surface"
                      >
                        Surface run
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 px-3 rounded-lg text-xs font-medium ${
                          isUnderground
                            ? 'bg-chrome-white text-steel-600'
                            : 'text-chrome-white hover:bg-white/10'
                        }`}
                        onClick={() => setIsUnderground(true)}
                        data-testid="install-type-underground"
                      >
                        Underground
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Estimate Group */}
                <div className="pt-6 border-t border-steel-600/30">
                  <div className="bg-steel-600 text-warm-orange p-4 rounded-xl flex items-center justify-between border border-warm-orange/20" data-testid="estimated-price">
                    <div className="text-sm font-medium uppercase tracking-wide">
                      ESTIMATED PRICE
                    </div>
                    <div className="text-2xl font-medium numeric-input">
                      {fmtMoney(estimate.finalPrice)}
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