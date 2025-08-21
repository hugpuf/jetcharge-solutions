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
                {/* Isometric apartment with EV charging */}
                <div className="neon-wrap w-full animate-fade-in relative z-10">
                  <svg viewBox="0 0 1024 1024" role="img" aria-labelledby="title desc" className="w-full h-auto">
                    <title id="title">Apartment block with street frontage and EV charging</title>
                    <desc id="desc">Isometric neon line drawing of a five-storey apartment with balconies, street layer, and a side EV pad with two chargers and two cars.</desc>

                    {/* Tokens */}
                    <defs>
                      <style>{`
                        .svg-tube { fill:none; stroke:hsl(var(--steel-600)); stroke-width:6; stroke-linecap:round; stroke-linejoin:round; }
                        .svg-glow { stroke:hsl(var(--warm-orange)); stroke-width:9.6; filter:url(#outer-glow); opacity:.5; }
                        .svg-hover { animation: bob 4s ease-in-out infinite; transform-origin:center; }
                        .svg-pulse { animation: pulse 4s ease-in-out infinite; }
                        @keyframes bob { 0%,100%{ transform:translateY(0) } 50%{ transform:translateY(-8px) } }
                        @keyframes pulse { 0%,100%{ opacity:.42 } 50%{ opacity:.58 } }
                      `}</style>

                      {/* Outer glow filter */}
                      <filter id="outer-glow" x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox">
                        <feGaussianBlur stdDeviation="12" result="blur"/>
                        <feMerge>
                          <feMergeNode in="blur"/>
                        </feMerge>
                      </filter>

                      {/* Reusable symbols */}
                      <symbol id="tree" viewBox="0 0 60 90">
                        <circle className="svg-tube" cx="30" cy="28" r="20"/>
                        <circle className="svg-tube" cx="18" cy="40" r="14"/>
                        <circle className="svg-tube" cx="42" cy="40" r="14"/>
                        <line   className="svg-tube" x1="30" y1="90" x2="30" y2="54"/>
                      </symbol>

                      <symbol id="lamp" viewBox="0 0 22 80">
                        <circle className="svg-tube" cx="11" cy="12" r="8"/>
                        <line className="svg-tube" x1="11" y1="20" x2="11" y2="78"/>
                      </symbol>

                      <symbol id="charger" viewBox="0 0 60 160">
                        <rect className="svg-tube" x="10" y="10" rx="18" ry="18" width="40" height="120"/>
                        <rect className="svg-tube" x="22" y="30" rx="6" ry="6" width="16" height="26"/>
                        <path className="svg-tube" d="M40 120 C70 130, 80 135, 92 146"/>
                      </symbol>

                      <symbol id="car" viewBox="0 0 180 90">
                        <path className="svg-tube" d="M15 60 L45 30 L120 30 Q150 32 165 48 L168 72 Q130 78 50 78 Q35 78 15 74 Z"/>
                        <circle className="svg-tube" cx="50" cy="76" r="10"/>
                        <circle className="svg-tube" cx="130" cy="74" r="10"/>
                      </symbol>

                      <symbol id="balcony" viewBox="0 0 120 36">
                        <rect className="svg-tube" x="5" y="8" rx="8" ry="8" width="110" height="20"/>
                        <line className="svg-tube" x1="25" y1="8" x2="25" y2="28"/>
                        <line className="svg-tube" x1="60" y1="8" x2="60" y2="28"/>
                        <line className="svg-tube" x1="95" y1="8" x2="95" y2="28"/>
                      </symbol>

                      <symbol id="win" viewBox="0 0 40 58">
                        <rect className="svg-tube" x="5" y="5" rx="8" ry="8" width="30" height="48"/>
                        <line className="svg-tube" x1="5" y1="29" x2="35" y2="29"/>
                      </symbol>
                    </defs>

                    {/* Background */}
                    <rect x="0" y="0" width="1024" height="1024" fill="transparent"/>
                    <g className="svg-hover">

                      {/* Ground plate */}
                      <g className="svg-pulse">
                        <path className="svg-glow" d="M120 760 L550 960 L980 760 L550 560 Z"/>
                        <path className="svg-tube" d="M120 760 L550 960 L980 760 L550 560 Z"/>
                      </g>

                      {/* Street & curb */}
                      <g className="svg-pulse">
                        <path className="svg-glow" d="M60 690 L520 900"/>
                        <path className="svg-tube" d="M60 690 L520 900"/>
                        <path className="svg-glow" d="M120 660 L580 870"/>
                        <path className="svg-tube" d="M120 660 L580 870"/>
                        {/* dashed centerline */}
                        <g strokeDasharray="32 28">
                          <path className="svg-glow" d="M160 680 L600 880"/>
                          <path className="svg-tube" d="M160 680 L600 880"/>
                        </g>
                        {/* Lamp + small passing car for scale */}
                        <use href="#lamp" x="190" y="585" transform="rotate(24 190 585)"/>
                        <use href="#car"  x="300" y="735" transform="rotate(24 300 735) scale(.6)"/>
                      </g>

                      {/* Building mass */}
                      {/* Roof rim */}
                      <g className="svg-pulse">
                        <path className="svg-glow" d="M360 180 L700 340 L700 520 L360 360 Z"/>
                        <path className="svg-tube" d="M360 180 L700 340 L700 520 L360 360 Z"/>
                      </g>
                      {/* Left facade */}
                      <path className="svg-glow" d="M360 360 L360 760 L260 710 L260 310 Z"/>
                      <path className="svg-tube" d="M360 360 L360 760 L260 710 L260 310 Z"/>
                      {/* Right facade */}
                      <path className="svg-glow" d="M360 360 L700 520 L700 920 L360 760 Z"/>
                      <path className="svg-tube" d="M360 360 L700 520 L700 920 L360 760 Z"/>

                      {/* Storefronts */}
                      <g transform="translate(270 640) rotate(24)">
                        <path className="svg-tube" d="M0 0 h80 v26 h-80 Z"/>
                        <path className="svg-tube" d="M110 0 h80 v26 h-80 Z"/>
                      </g>

                      {/* Balconies */}
                      <g transform="translate(300 440) rotate(24)">
                        <use href="#balcony" x="-40" y="-160"/>
                        <use href="#balcony" x="-40" y="-110"/>
                        <use href="#balcony" x="-40" y="-60"/>
                        <use href="#balcony" x="-40" y="-10"/>
                      </g>

                      {/* Windows */}
                      <g transform="translate(520 520) rotate(24)">
                        <use href="#win" x="0"   y="-160"/>
                        <use href="#win" x="60"  y="-140"/>
                        <use href="#win" x="0"   y="-90"/>
                        <use href="#win" x="60"  y="-70"/>
                        <use href="#win" x="0"   y="-20"/>
                        <use href="#win" x="60"  y="0"/>
                      </g>

                      {/* Street trees */}
                      <use href="#tree" x="220" y="560" transform="rotate(24 220 560)"/>
                      <use href="#tree" x="280" y="590" transform="rotate(24 280 590)"/>
                      <use href="#tree" x="340" y="620" transform="rotate(24 340 620)"/>

                      {/* EV Charging Pad */}
                      <g className="svg-pulse">
                        <path className="svg-glow" d="M690 640 L940 760 L780 840 L530 720 Z"/>
                        <path className="svg-tube" d="M690 640 L940 760 L780 840 L530 720 Z"/>
                      </g>
                      {/* Parking bays */}
                      <path className="svg-tube" d="M560 730 L760 830"/>
                      <path className="svg-tube" d="M620 700 L820 800"/>

                      {/* Chargers */}
                      <use href="#charger" x="820" y="640" transform="rotate(24 820 640) scale(.75)"/>
                      <use href="#charger" x="880" y="670" transform="rotate(24 880 670) scale(.75)"/>

                      {/* Cars */}
                      <use href="#car" x="560" y="720" transform="rotate(24 560 720) scale(.75)"/>
                      <use href="#car" x="630" y="685" transform="rotate(24 630 685) scale(.75)"/>

                      {/* Battery indicator */}
                      <g transform="translate(700 630) rotate(24)">
                        <rect className="svg-tube" x="0" y="0" rx="8" ry="8" width="80" height="32"/>
                        <line className="svg-tube" x1="18" y1="8" x2="18" y2="24"/>
                        <line className="svg-tube" x1="34" y1="8" x2="34" y2="24"/>
                        <line className="svg-tube" x1="50" y1="8" x2="50" y2="24"/>
                        <line className="svg-tube" x1="66" y1="8" x2="66" y2="24"/>
                      </g>
                    </g>
                  </svg>
                </div>
                {/* Orange glow underneath */}
                <div className="absolute inset-x-0 bottom-0 h-8 bg-warm-orange/30 blur-xl rounded-full transform translate-y-4 scale-75"></div>
              </div>
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