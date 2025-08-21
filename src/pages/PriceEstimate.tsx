import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Phone } from 'lucide-react';
import { deserializeQuoteData, generateQuoteNumber, calculateQuoteMetrics, type QuoteData } from '@/lib/quote';
import { fmtMoney } from '@/lib/estimate';
import { assumptionsStore } from '@/lib/assumptions';
import ContactModal from '@/components/ContactModal';
export default function PriceEstimate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Deserialize quote data from URL parameters
  const quoteData = deserializeQuoteData(searchParams);

  // If missing essential data, redirect to calculator
  if (!quoteData.siteType || !quoteData.estimate) {
    navigate('/calculator', {
      replace: true
    });
    return null;
  }

  // Generate quote metadata
  const quoteNumber = generateQuoteNumber();
  const now = new Date();
  const dateGenerated = now.toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const validUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  // Calculate derived metrics and cost breakdowns
  const metrics = calculateQuoteMetrics(quoteData.estimate!, quoteData.siteType!);
  const assumptions = assumptionsStore.getAssumptions();

  // Calculate individual cost components
  const chargerHardwareCost = quoteData.estimate!.chargerCost;

  // Break down cabling cost into cable installation vs carrier
  const carrierCostPerM = quoteData.isUnderground ? assumptions.carrierPerM.trench : assumptions.carrierPerM.tray;
  const cableCostPerM = (quoteData.acCount || 0) * assumptions.cableCostPerM.ac + (quoteData.dcCount || 0) * assumptions.cableCostPerM.dc;
  const cableInstallationCost = (quoteData.effectiveRunM || 0) * cableCostPerM;
  const carrierCost = (quoteData.effectiveRunM || 0) * carrierCostPerM;

  // Installation & commissioning is the markup applied to base costs
  const baseCost = quoteData.estimate!.cost;
  const installationCommissioningCost = quoteData.estimate!.finalPrice - baseCost;
  const savings = metrics.incumbentAnnualPrice - quoteData.estimate!.finalPrice;
  const monthlyEquivalent = quoteData.estimate!.finalPrice / 12;
  const handleEditInputs = () => {
    navigate('/');
  };
  const handlePrint = () => {
    window.print();
  };
  const handleContactSales = () => {
    setIsContactModalOpen(true);
  };
  return <>
      <main className="min-h-screen bg-gradient-warm-sweep flex items-center justify-center p-6 print:bg-white print:p-0">
        <section aria-label="Price Estimate" className="relative w-[794px] max-w-full aspect-[210/297] bg-chrome-white shadow-large border border-steel-200 rounded-xl print:shadow-none print:border-0 print:rounded-none overflow-hidden print:overflow-visible">
          {/* Neon edge glow - hidden in print */}
          <div className="pointer-events-none absolute inset-0 rounded-xl shadow-warm print:hidden" />
          
          {/* Header */}
          <header className="flex items-start justify-between p-6 border-b border-steel-200">
            <img 
              src="/lovable-uploads/518ccbf1-fd23-4602-bb72-94d5909d7c4c.png"
              alt="Jet Charge Logo"
              className="h-8 w-auto"
            />
            <div className="text-sm leading-5 text-steel-400 text-right">
              <div><span className="font-semibold text-steel-600">ESTIMATE #</span> {quoteNumber}</div>
              <div>Date: {dateGenerated}</div>
              <div>Valid until: {validUntil}</div>
              <div>Prepared for: {quoteData.contactName || '—'}</div>
            </div>
          </header>
          
          {/* Hero Summary */}
          <div className="grid grid-cols-2 gap-6 p-6">
            <div className="border border-steel-200 rounded-lg p-4">
              <div className="text-xs uppercase tracking-widest text-steel-400 mb-2">
                Estimated Total Cost
              </div>
              <div className="text-2xl font-mono font-semibold text-steel-600">
                {fmtMoney(quoteData.estimate!.finalPrice)}
              </div>
              <div className="text-xs mt-2 text-steel-400">
                ≈ {fmtMoney(monthlyEquivalent)}/mo
              </div>
            </div>
            
          </div>
          
          {/* Site Details */}
          <section className="px-6 mb-6">
            <h3 className="text-sm uppercase tracking-wider mb-3 text-steel-600 font-medium">
              Site Details
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-steel-600">Type:</span>{' '}
                <span className="text-steel-500">{quoteData.siteType}</span>
              </div>
              <div>
                <span className="font-medium text-steel-600">Install:</span>{' '}
                <span className="text-steel-500">{quoteData.isUnderground ? 'Underground' : 'Surface'}</span>
              </div>
              <div>
                <span className="font-medium text-steel-600">Address:</span>{' '}
                <span className="text-steel-500">{quoteData.address || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-steel-600">AC/DC:</span>{' '}
                <span className="text-steel-500">{quoteData.acCount || 0} / {quoteData.dcCount || 0}</span>
              </div>
              <div>
                <span className="font-medium text-steel-600">Cable run:</span>{' '}
                <span className="text-steel-500">{quoteData.effectiveRunM || 0} m</span>
              </div>
              <div>
                <span className="font-medium text-steel-600">Civil works:</span>{' '}
                <span className="text-steel-500">{quoteData.isUnderground ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </section>
          
          {/* Cost Breakdown Sections */}
          <section className="px-6 mb-6">
            <h3 className="text-lg font-medium tracking-tight mb-6 text-steel-600">
              Cost Breakdown
            </h3>
            
            <div className="space-y-6">
              {/* Charger Hardware */}
              <div className="border-l-4 border-warm-orange pl-4">
                <h4 className="font-medium text-steel-600 mb-2">Charger Hardware</h4>
                <p className="text-sm text-steel-500 mb-3 leading-relaxed">
                  Cost of AC and DC charging units, calculated as quantity multiplied by unit price, including markup. This represents the hardware itself, not installation.
                </p>
                <div className="font-mono font-semibold text-steel-600">
                  Estimate: {fmtMoney(chargerHardwareCost)}
                </div>
              </div>

              <div className="border-t border-steel-200"></div>

              {/* Cable Installation */}
              <div className="border-l-4 border-warm-orange pl-4">
                <h4 className="font-medium text-steel-600 mb-2">Cable Installation</h4>
                <p className="text-sm text-steel-500 mb-3 leading-relaxed">
                  Cost of cabling based on the cable run length and the type of chargers being installed. This accounts for copper sizing requirements and is priced per meter, with markup included.
                </p>
                <div className="font-mono font-semibold text-steel-600">
                  Estimate: {fmtMoney(cableInstallationCost)}
                </div>
              </div>

              <div className="border-t border-steel-200"></div>

              {/* Cable Carrier */}
              <div className="border-l-4 border-warm-orange pl-4">
                <h4 className="font-medium text-steel-600 mb-2">Cable Carrier (Conduit/Tray)</h4>
                <p className="text-sm text-steel-500 mb-3 leading-relaxed">
                  Cost of the physical carrier for the cable run — either conduit or tray depending on the installation type. This ensures cabling is safely supported and compliant, priced per meter with markup applied.
                </p>
                <div className="font-mono font-semibold text-steel-600">
                  Estimate: {fmtMoney(carrierCost)}
                </div>
              </div>

              <div className="border-t border-steel-200"></div>

              {/* Installation & Commissioning */}
              <div className="border-l-4 border-warm-orange pl-4">
                <h4 className="font-medium text-steel-600 mb-2">Installation & Commissioning</h4>
                <p className="text-sm text-steel-500 mb-3 leading-relaxed">
                  Labour and engineering services to install equipment, integrate with existing electrical infrastructure, and certify compliance. Includes commissioning and handover.
                </p>
                <div className="font-mono font-semibold text-steel-600">
                  Estimate: {fmtMoney(installationCommissioningCost)}
                </div>
              </div>

              <div className="border-t border-steel-200"></div>

              {/* One-off Cost */}
              <div className="border-l-4 border-warm-amber pl-4 bg-steel-50 p-4 rounded-r-lg -ml-4">
                <h4 className="font-medium text-steel-600 mb-2">One-off Cost</h4>
                <p className="text-sm text-steel-500 mb-3 leading-relaxed">
                  Total upfront cost of equipment, cabling, and installation combined.
                </p>
                <div className="font-mono font-bold text-lg text-warm-orange">
                  Estimate: {fmtMoney(quoteData.estimate!.finalPrice)}
                </div>
              </div>

              <div className="border-t border-steel-200"></div>

              {/* Annual Opex */}
              <div className="border-l-4 border-steel-400 pl-4">
                <h4 className="font-medium text-steel-600 mb-2">Annual Opex (if applicable)</h4>
                <p className="text-sm text-steel-500 mb-3 leading-relaxed">
                  Indicative annual operating cost for service, support, and compliance. Not always applicable for every site.
                </p>
                <div className="font-mono font-semibold text-steel-600">
                  Estimate: {fmtMoney(metrics.operatingCostPA)}
                </div>
              </div>
            </div>
          </section>
          
          {/* Notes & Assumptions */}
          <section className="px-6 mb-6">
            <div className="bg-steel-50 border border-steel-200 rounded-lg p-4">
              <h4 className="text-sm uppercase tracking-wider mb-3 text-steel-600 font-medium">
                Notes & Assumptions
              </h4>
              <ul className="text-xs text-steel-500 space-y-2 leading-relaxed">
                <li>• Cable run and trenching based on provided inputs.</li>
                <li>• Switchboard capacity adequate; upgrades priced if required.</li>
                <li>• Final pricing subject to site verification and engineering assessment.</li>
                <li>• Installation includes commissioning and compliance certification.</li>
                <li>• This is an estimate only and not a firm price commitment.</li>
              </ul>
            </div>
          </section>
          
          {/* Callouts */}
          <section className="px-6 mb-6">
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="bg-steel-50 border border-steel-200 rounded-lg p-3 text-center">
                <div className="font-medium text-steel-600 mb-1">Lead Time</div>
                <div className="text-steel-500">6-8 weeks</div>
              </div>
              <div className="bg-steel-50 border border-steel-200 rounded-lg p-3 text-center">
                <div className="font-medium text-steel-600 mb-1">Warranty</div>
                <div className="text-steel-500">3 years full</div>
              </div>
              <div className="bg-steel-50 border border-steel-200 rounded-lg p-3 text-center">
                <div className="font-medium text-steel-600 mb-1">Support</div>
                <div className="text-steel-500">24/7 remote</div>
              </div>
            </div>
          </section>
          
          {/* Footer Actions */}
          <footer className="p-6 flex gap-3 justify-between print:hidden">
            <Button variant="outline" className="border-steel-600 text-steel-600 bg-chrome-white hover:bg-chrome-white hover:text-warm-orange" onClick={handleEditInputs}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Edit Inputs
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" className="border-steel-600 text-steel-600 bg-chrome-white hover:bg-chrome-white hover:text-warm-orange" onClick={handlePrint}>
                <Download className="w-4 h-4 mr-2" />
                Download / Print
              </Button>
              <Button className="bg-warm-orange text-chrome-white hover:bg-warm-amber" onClick={handleContactSales}>
                <Phone className="w-4 h-4 mr-2" />
                Contact Sales
              </Button>
            </div>
          </footer>
        </section>
      </main>
      
      {/* Contact Modal */}
      {isContactModalOpen && <ContactModal open={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} calculatorState={{
      siteType: quoteData.siteType!,
      acCount: quoteData.acCount || 0,
      dcCount: quoteData.dcCount || 0,
      isUnderground: quoteData.isUnderground || false,
      runFactor: 1.0
    }} estimate={quoteData.estimate!} />}
    </>;
}