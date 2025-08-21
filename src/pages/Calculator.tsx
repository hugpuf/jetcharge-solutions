import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

import { Minus, Plus } from "lucide-react";
import { SiteType, assumptionsStore } from "@/lib/assumptions";
import { computeEstimate, fmtMoney } from "@/lib/estimate";
import { serializeQuoteData } from "@/lib/quote";
import ContactModal from "@/components/ContactModal";
// Using uploaded image directly

const siteTypeOptions: { value: SiteType; label: string }[] = [
  { value: 'Car Dealership', label: 'Car Dealership' },
  { value: 'Public Station', label: 'Public Charging Station' },
  { value: 'Office Building', label: 'Office Building' },
  { value: 'Apartment', label: 'Apartment' },
  { value: 'House', label: 'House' },
];

// Slider: 5 discrete settings
const FACTOR_VALUES = [0.75, 0.875, 1.0, 1.125, 1.25]; // -25%, -12.5%, default, +12.5%, +25%
const DEFAULT_FACTOR_INDEX = 2; // Index for 1.0 (default)

export default function Calculator() {
  const navigate = useNavigate();
  const [siteType, setSiteType] = useState<SiteType | null>(null);
  const [acCount, setAcCount] = useState(0);
  const [dcCount, setDcCount] = useState(0);
  const [isUnderground, setIsUnderground] = useState(false);
  const [runFactorIndex, setRunFactorIndex] = useState(DEFAULT_FACTOR_INDEX);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  
  // Direct input overrides
  const [cableRunOverride, setCableRunOverride] = useState<number | null>(null);
  const [acCountOverride, setAcCountOverride] = useState<string>("");
  const [dcCountOverride, setDcCountOverride] = useState<string>("");

  // Inline edit states
  const [isEditingCableRun, setIsEditingCableRun] = useState(false);
  const [isEditingAc, setIsEditingAc] = useState(false);
  const [isEditingDc, setIsEditingDc] = useState(false);

  const runFactor = FACTOR_VALUES[runFactorIndex];

  const calculateEstimate = useCallback(() => {
    // Return zero estimate if no site type selected or no chargers
    if (!siteType || (acCount === 0 && dcCount === 0)) {
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
    const baseEstimate = computeEstimate({
      siteType,
      acCount,
      dcCount,
      isUnderground,
      runFactor
    }, assumptions);

    // Apply cable run override if set
    if (cableRunOverride !== null) {
      const overriddenEstimate = { ...baseEstimate };
      overriddenEstimate.effectiveRunM = cableRunOverride;
      overriddenEstimate.cablingCost = cableRunOverride * baseEstimate.perMeterRate;
      overriddenEstimate.cost = overriddenEstimate.cablingCost + baseEstimate.chargerCost;
      overriddenEstimate.finalPrice = overriddenEstimate.cost * (1 + assumptions.labourMarkupPct / 100);
      return overriddenEstimate;
    }

    return baseEstimate;
  }, [siteType, acCount, dcCount, isUnderground, runFactor, cableRunOverride]);

  const estimate = calculateEstimate();

  const handleSiteTypeChange = (value: SiteType) => {
    setSiteType(value);
    setRunFactorIndex(DEFAULT_FACTOR_INDEX); // Reset to default factor
  };

  const handleAcIncrement = () => {
    setAcCount(prev => prev + 1);
    setAcCountOverride("");
  };
  const handleAcDecrement = () => {
    setAcCount(prev => Math.max(0, prev - 1));
    setAcCountOverride("");
  };
  const handleDcIncrement = () => {
    setDcCount(prev => prev + 1);
    setDcCountOverride("");
  };
  const handleDcDecrement = () => {
    setDcCount(prev => Math.max(0, prev - 1));
    setDcCountOverride("");
  };

  const handleCableRunInput = (value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 0) {
      setCableRunOverride(null);
    } else {
      setCableRunOverride(numValue);
    }
  };

  const handleAcCountInput = (value: string) => {
    setAcCountOverride(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setAcCount(numValue);
    }
  };

  const handleDcCountInput = (value: string) => {
    setDcCountOverride(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setDcCount(numValue);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-warm-sweep flex items-center justify-center p-4">
      <div className="w-full max-w-7xl">
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-8 lg:gap-12 items-center">
          {/* Preview Column */}
          <div className="order-1 lg:order-1 flex items-center justify-center min-h-[300px] lg:min-h-[400px]">
            <div className="w-full max-w-lg relative">
              <div className="relative animate-float">
                {/* Apartment image - only show when apartment is selected */}
                {siteType === "Apartment" && (
                  <div className="w-full animate-fade-in relative z-10">
                    <img 
                      src="/lovable-uploads/7d605a02-6685-4391-a10b-bb0f094ec375.png"
                      alt="Apartment building with EV charging stations - isometric view"
                      className="w-full h-auto max-w-xl mx-auto"
                    />
                  </div>
                )}
                {/* Orange glow underneath */}
                {siteType === "Apartment" && (
                  <div className="absolute inset-x-0 bottom-0 h-8 bg-warm-orange/30 blur-xl rounded-full transform translate-y-4 scale-75"></div>
                )}
              </div>
            </div>
          </div>

          {/* Calculator Column */}
          <div className="order-2 lg:order-2 relative w-full max-w-md lg:max-w-none mx-auto">
            {/* Logo suspended above steel panel */}
            <div className="flex justify-center mb-6">
              <div className="animate-float">
                <img 
                  src="/lovable-uploads/518ccbf1-fd23-4602-bb72-94d5909d7c4c.png"
                  alt="Jet Charge Logo"
                  className="h-12 w-auto"
                />
              </div>
            </div>
            
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
                      {isEditingAc ? (
                        <input
                          type="number"
                          value={acCountOverride || String(acCount)}
                          onChange={(e) => handleAcCountInput(e.target.value)}
                          onBlur={() => { setIsEditingAc(false); }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
                            if (e.key === 'Escape') { setAcCountOverride(""); setIsEditingAc(false); }
                          }}
                          className="bg-transparent border-none outline-none text-chrome-white font-medium text-center numeric-input w-8 caret-warm-orange"
                          min={0}
                          autoFocus
                        />
                      ) : (
                        <span
                          className="text-chrome-white font-medium w-8 text-center cursor-pointer"
                          data-testid="ac-count"
                          role="button"
                          tabIndex={0}
                          onClick={() => setIsEditingAc(true)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsEditingAc(true); }}
                        >
                          {acCount}
                        </span>
                      )}
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
                      {isEditingDc ? (
                        <input
                          type="number"
                          value={dcCountOverride || String(dcCount)}
                          onChange={(e) => handleDcCountInput(e.target.value)}
                          onBlur={() => { setIsEditingDc(false); }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
                            if (e.key === 'Escape') { setDcCountOverride(""); setIsEditingDc(false); }
                          }}
                          className="bg-transparent border-none outline-none text-chrome-white font-medium text-center numeric-input w-8 caret-warm-orange"
                          min={0}
                          autoFocus
                        />
                      ) : (
                        <span
                          className="text-chrome-white font-medium w-8 text-center cursor-pointer"
                          data-testid="dc-count"
                          role="button"
                          tabIndex={0}
                          onClick={() => setIsEditingDc(true)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsEditingDc(true); }}
                        >
                          {dcCount}
                        </span>
                      )}
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
                            onValueChange={(value) => {
                              setRunFactorIndex(value[0]);
                              setCableRunOverride(null);
                              setIsEditingCableRun(false);
                            }}
                            min={0}
                            max={4}
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
                            {isEditingCableRun ? (
                              <input
                                type="number"
                                value={cableRunOverride ?? estimate.effectiveRunM}
                                onChange={(e) => handleCableRunInput(e.target.value)}
                                onBlur={() => setIsEditingCableRun(false)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
                                  if (e.key === 'Escape') { setCableRunOverride(null); setIsEditingCableRun(false); }
                                }}
                                className="bg-transparent border-none outline-none text-warm-orange text-sm font-medium numeric-input w-12 text-right"
                                min={0}
                                autoFocus
                              />
                            ) : (
                              <span
                                role="button"
                                tabIndex={0}
                                className="cursor-pointer"
                                onClick={() => setIsEditingCableRun(true)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsEditingCableRun(true); }}
                              >
                                {estimate.effectiveRunM}
                              </span>
                            )}
                            m
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

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
              <Button 
                onClick={() => {
                  if (!siteType) return;
                  setIsContactModalOpen(true);
                }}
                disabled={!siteType}
                className="floating-cta w-full h-16 bg-gradient-to-r from-warm-orange to-warm-amber text-chrome-white font-medium text-base uppercase tracking-wide rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                SEND ME A PRICE BREAKDOWN
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal
        open={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        calculatorState={{
          siteType,
          acCount,
          dcCount,
          isUnderground,
          runFactor
        }}
        estimate={estimate}
        onSubmitted={(contactData) => {
          const quoteData = serializeQuoteData({
            siteType,
            acCount,
            dcCount,
            isUnderground,
            effectiveRunM: estimate.effectiveRunM,
            estimate,
            contactName: `${contactData.first_name} ${contactData.last_name}`,
            contactEmail: contactData.email,
            address: '',
          });
          
          navigate(`/loading?${quoteData}`);
        }}
      />
    </div>
  );
}