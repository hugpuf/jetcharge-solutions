import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Phone, ChevronDown } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
      <main className="min-h-screen bg-gradient-warm-sweep flex items-start justify-center p-6 print:bg-white print:p-0">
        <section aria-label="Price Estimate" className="relative w-[794px] max-w-full min-h-[1123px] bg-chrome-white shadow-large border border-steel-200 rounded-xl print:shadow-none print:border-0 print:rounded-none print:overflow-visible">
          {/* Neon edge glow - hidden in print */}
          <div className="pointer-events-none absolute inset-0 rounded-xl shadow-warm print:hidden" />
          
          {/* Header */}
          <header className="flex items-start justify-between p-6 border-b border-steel-200">
            <img src="/lovable-uploads/518ccbf1-fd23-4602-bb72-94d5909d7c4c.png" alt="Jet Charge Logo" className="h-8 w-auto" />
            <div className="text-sm leading-5 text-steel-400 text-right">
              <div><span className="font-semibold text-steel-600">ESTIMATE #</span> {quoteNumber}</div>
              <div>Date: {dateGenerated}</div>
              <div>Valid until: {validUntil}</div>
              <div>Prepared for: {quoteData.contactName || '—'}</div>
            </div>
          </header>
          
          {/* Site Details */}
          <div className="px-6 mb-6">
            <div className="flex items-start gap-8 pt-6">
              <h3 className="text-sm uppercase tracking-wider text-steel-600 font-medium whitespace-nowrap pt-4">
                Site Details
              </h3>
              <div className="w-96 ml-auto border border-steel-200 rounded-lg p-6 bg-steel-50">
                <div className="grid grid-cols-2 gap-8 text-sm">
                  {/* Column 1 */}
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-steel-400 mb-1">Type</div>
                      <div className="font-mono font-semibold text-steel-600">{quoteData.siteType}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest text-steel-400 mb-1">AC Chargers</div>
                      <div className="font-mono font-semibold text-steel-600">{quoteData.acCount || 0}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest text-steel-400 mb-1">DC Chargers</div>
                      <div className="font-mono font-semibold text-steel-600">{quoteData.dcCount || 0}</div>
                    </div>
                  </div>
                  
                  {/* Column 2 */}
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-steel-400 mb-1">Cable Run</div>
                      <div className="font-mono font-semibold text-steel-600">{quoteData.effectiveRunM || 0} m</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest text-steel-400 mb-1">Install</div>
                      <div className="font-mono font-semibold text-steel-600">{quoteData.isUnderground ? 'Underground' : 'Surface'}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest text-steel-400 mb-1">Civil Works</div>
                      <div className="font-mono font-semibold text-steel-600">{quoteData.isUnderground ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Cost Breakdown Sections */}
          <section className="px-6 mb-6">
            <h3 className="text-sm uppercase tracking-wider mb-6 text-steel-600 font-medium">
              Cost Breakdown
            </h3>
            
            <Accordion type="multiple" className="space-y-4">
              {/* Charger Hardware */}
              <AccordionItem value="charger-hardware" className="border-l-4 border-warm-orange pl-4 border-0">
                <AccordionTrigger className="hover:no-underline py-2">
                  <div className="flex justify-between items-center flex-1">
                    <h4 className="font-medium text-steel-600">Charger Hardware</h4>
                    <div className="font-mono font-semibold text-steel-600">
                      {fmtMoney(chargerHardwareCost)}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <p className="text-sm text-steel-500 leading-relaxed">
                    Cost of AC and DC charging units, calculated as quantity multiplied by unit price. This represents the hardware itself, not installation.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <div className="border-t border-steel-200"></div>

              {/* Cable Installation */}
              <AccordionItem value="cable-installation" className="border-l-4 border-warm-orange pl-4 border-0">
                <AccordionTrigger className="hover:no-underline py-2">
                  <div className="flex justify-between items-center flex-1">
                    <h4 className="font-medium text-steel-600">Cable Installation (Cable Costs)</h4>
                    <div className="font-mono font-semibold text-steel-600">
                      {fmtMoney(cableInstallationCost)}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <p className="text-sm text-steel-500 leading-relaxed">
                    Working out cabling costs is sometimes described as a dark art. The price is essentially a function of your switchboard's current rating, the charging load, and how far we need to run the wires — but small details in copper sizing and site layout can have an outsized effect. On many sites, cabling can account for up to 60% of total installation costs. To refine pricing, we'll need photos of your mains and distribution boards, along with a clear sense of site layout.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <div className="border-t border-steel-200"></div>

              {/* Cable Carrier */}
              <AccordionItem value="cable-carrier" className="border-l-4 border-warm-orange pl-4 border-0">
                <AccordionTrigger className="hover:no-underline py-2">
                  <div className="flex justify-between items-center flex-1">
                    <h4 className="font-medium text-steel-600">Cable Carrier (Conduit/Tray)</h4>
                    <div className="font-mono font-semibold text-steel-600">
                      {fmtMoney(carrierCost)}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <p className="text-sm text-steel-500 leading-relaxed">
                    Costs of the physical carrier for the cables, as either tray or underground trenching depending on installation type. This ensures cabling is safely supported and compliant, priced per metre.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <div className="border-t border-steel-200"></div>

              {/* Installation & Commissioning */}
              <AccordionItem value="installation-commissioning" className="border-l-4 border-warm-orange pl-4 border-0">
                <AccordionTrigger className="hover:no-underline py-2">
                  <div className="flex justify-between items-center flex-1">
                    <h4 className="font-medium text-steel-600">Installation & Commissioning</h4>
                    <div className="font-mono font-semibold text-steel-600">
                      {fmtMoney(installationCommissioningCost)}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <p className="text-sm text-steel-500 leading-relaxed">
                    Labour and engineering services to install equipment, integrate with existing electrical infrastructure, and certify compliance. Includes commissioning and handover.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <div className="border-t border-steel-200"></div>
            </Accordion>

            {/* Final Price / Grand Total */}
            <div className="flex justify-between items-start gap-6 mt-6">
              {/* Legal Disclaimer */}
              <div className="w-1/2 bg-warm-orange/10 border border-warm-orange/20 rounded-lg p-4">
                <p className="text-[10px] text-steel-600 leading-tight">
                  JET Charge has taken care to ensure this information is as accurate and informative as possible. Electric vehicle charging system performance depends on a number of variables, including site-specific electrical infrastructure, vehicle specifications, user charging behaviour, and local network conditions. JET Charge cannot guarantee that the results outlined in this quote will be achieved in all scenarios.
                </p>
              </div>
              
              {/* Estimated Total */}
              <div className="w-1/2 border-l-4 border-warm-amber pl-4 bg-steel-50 p-4 rounded-r-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-steel-600 mb-2">Estimated Total</h4>
                    <p className="text-sm text-steel-500 mb-3 leading-relaxed">
                      Total upfront cost of equipment, cabling, and installation combined.
                    </p>
                  </div>
                  <div className="font-mono font-bold text-lg text-warm-orange ml-4">
                    {fmtMoney(quoteData.estimate!.finalPrice)}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-steel-200 mt-6"></div>

            <Accordion type="multiple" className="mt-6">
              {/* Annual Opex */}
              <AccordionItem value="annual-opex" className="border-l-4 border-steel-400 pl-4 border-0">
                
                <AccordionContent className="pb-4">
                  <p className="text-sm text-steel-500 leading-relaxed">
                    Indicative annual operating cost for service, support, and compliance. Not always applicable for every site.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
          
          {/* Notes & Assumptions */}
          <section className="px-6 mb-6">
            
          </section>
          
          {/* Callouts */}
          <section className="px-6 mb-6">
            
          </section>
          
          {/* Call to Action Section */}
          <section className="px-6 py-8 border-t border-steel-200 print:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src="/lovable-uploads/518ccbf1-fd23-4602-bb72-94d5909d7c4c.png" alt="Jet Charge Logo" className="h-6 w-auto opacity-60" />
                <div>
                  <h3 className="font-medium text-steel-600 mb-1">Ready to move forward?</h3>
                  <p className="text-sm text-steel-500">Book a session with our sales team to discuss your project in detail.</p>
                </div>
              </div>
              <Button className="bg-warm-orange text-chrome-white hover:bg-warm-amber px-6 py-3 text-base font-medium" onClick={handleContactSales}>
                <Phone className="w-4 h-4 mr-2" />
                Book Sales Session
              </Button>
            </div>
          </section>

          {/* Footer Actions */}
          <footer className="px-6 py-4 bg-steel-50 border-t border-steel-200 print:hidden">
            <div className="flex items-center justify-between">
              <Button variant="outline" className="border-steel-600 text-steel-600 bg-chrome-white hover:bg-chrome-white hover:text-warm-orange" onClick={handleEditInputs}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Edit Inputs
              </Button>
              <Button variant="outline" className="border-steel-600 text-steel-600 bg-chrome-white hover:bg-chrome-white hover:text-warm-orange" onClick={handlePrint}>
                <Download className="w-4 h-4 mr-2" />
                Download as PDF
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