import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Mail, Phone } from 'lucide-react';
import { 
  deserializeQuoteData, 
  generateQuoteNumber, 
  calculateQuoteMetrics, 
  generateLineItems,
  type QuoteData 
} from '@/lib/quote';
import { fmtMoney } from '@/lib/estimate';
import ContactModal from '@/components/ContactModal';

export default function PriceEstimate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  
  // Deserialize quote data from URL parameters
  const quoteData = deserializeQuoteData(searchParams);
  
  // If missing essential data, redirect to calculator
  if (!quoteData.siteType || !quoteData.estimate) {
    navigate('/calculator', { replace: true });
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
  
  // Calculate derived metrics
  const metrics = calculateQuoteMetrics(quoteData.estimate!, quoteData.siteType!);
  const lineItems = generateLineItems(
    quoteData.estimate!,
    quoteData.siteType!,
    quoteData.acCount || 0,
    quoteData.dcCount || 0,
    quoteData.isUnderground || false
  );
  
  const savings = metrics.incumbentAnnualPrice - quoteData.estimate!.finalPrice;
  const monthlyEquivalent = quoteData.estimate!.finalPrice / 12;
  
  const handleEditInputs = () => {
    navigate('/calculator');
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleContactSales = () => {
    setIsContactModalOpen(true);
  };
  
  return (
    <>
      <main className="min-h-screen bg-gradient-warm-sweep flex items-center justify-center p-6 print:bg-white print:p-0">
        <section
          aria-label="Price Estimate"
          className="relative w-[794px] max-w-full aspect-[210/297] bg-chrome-white shadow-large border border-steel-200 rounded-xl print:shadow-none print:border-0 print:rounded-none overflow-hidden print:overflow-visible"
        >
          {/* Neon edge glow - hidden in print */}
          <div className="pointer-events-none absolute inset-0 rounded-xl shadow-warm print:hidden" />
          
          {/* Header */}
          <header className="flex items-start justify-between p-6 border-b border-steel-200">
            <div className="font-semibold tracking-wide text-steel-600 text-xl">
              JetCharge
            </div>
            <div className="text-sm leading-5 text-steel-400 text-right">
              <div><span className="font-semibold text-steel-600">QUOTE #</span> {quoteNumber}</div>
              <div>Date: {dateGenerated}</div>
              <div>Valid until: {validUntil}</div>
              <div>Prepared for: {quoteData.contactName || '—'}</div>
            </div>
          </header>
          
          {/* Hero Summary */}
          <div className="grid grid-cols-2 gap-6 p-6">
            <div className="border border-steel-200 rounded-lg p-4">
              <div className="text-xs uppercase tracking-widest text-steel-400 mb-2">
                Estimated Annual Price (Us)
              </div>
              <div className="text-2xl font-mono font-semibold text-steel-600">
                {fmtMoney(quoteData.estimate!.finalPrice)}
              </div>
              <div className="text-xs mt-2 text-steel-400">
                ≈ {fmtMoney(monthlyEquivalent)}/mo
              </div>
            </div>
            <div className="border border-steel-200 rounded-lg p-4">
              <div className="text-xs uppercase tracking-widest text-steel-400 mb-2">
                Incumbent Annual Price
              </div>
              <div className="text-2xl font-mono font-semibold text-steel-600">
                {fmtMoney(metrics.incumbentAnnualPrice)}
              </div>
              <div className="text-xs mt-2 text-steel-400">Savings est.</div>
              <div className="text-lg font-mono font-semibold text-warm-orange">
                {savings >= 0 ? '+' : '–'}{fmtMoney(Math.abs(savings))}
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
          
          {/* Line Items */}
          <section className="px-6 mb-6">
            <h3 className="text-sm uppercase tracking-wider mb-3 text-steel-600 font-medium">
              Estimate Breakdown
            </h3>
            <div className="border border-steel-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-steel-50">
                  <tr>
                    <th className="text-left p-3 font-medium text-steel-600">Item</th>
                    <th className="text-right p-3 font-medium text-steel-600">Qty</th>
                    <th className="text-right p-3 font-medium text-steel-600">Unit</th>
                    <th className="text-right p-3 font-medium text-steel-600">Unit Price</th>
                    <th className="text-right p-3 font-medium text-steel-600">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => (
                    <tr key={index} className="border-t border-steel-200">
                      <td className="p-3 text-steel-600">{item.label}</td>
                      <td className="p-3 text-right text-steel-500 font-mono">{item.qty}</td>
                      <td className="p-3 text-right text-steel-500">{item.unit}</td>
                      <td className="p-3 text-right text-steel-500 font-mono">{fmtMoney(item.unitPrice)}</td>
                      <td className="p-3 text-right text-steel-600 font-mono font-medium">{fmtMoney(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 grid grid-cols-3 gap-6">
              <div className="col-span-2 text-xs text-steel-400">
                <div className="uppercase tracking-wider mb-2 text-steel-600 font-medium">
                  Notes & Assumptions
                </div>
                <ul className="list-disc ml-5 space-y-1 leading-relaxed">
                  <li>Cable run and trenching based on provided inputs.</li>
                  <li>Switchboard capacity adequate; upgrades priced if required.</li>
                  <li>Final pricing subject to site verification and engineering assessment.</li>
                  <li>Installation includes commissioning and compliance certification.</li>
                </ul>
              </div>
              <div className="border border-steel-200 rounded-lg p-4 text-sm bg-steel-50">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-steel-600">One-off Cost</span>
                    <span className="font-mono text-steel-600">{fmtMoney(metrics.oneOffCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-steel-600">Annual Opex</span>
                    <span className="font-mono text-steel-600">{fmtMoney(metrics.operatingCostPA)}</span>
                  </div>
                  <div className="border-t border-steel-200 pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-steel-600">Total Annual</span>
                      <span className="font-mono text-warm-orange">{fmtMoney(quoteData.estimate!.finalPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>
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
            <Button 
              variant="outline" 
              className="border-steel-600 text-steel-600 bg-chrome-white hover:bg-chrome-white hover:text-warm-orange"
              onClick={handleEditInputs}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Edit Inputs
            </Button>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                className="border-steel-600 text-steel-600 bg-chrome-white hover:bg-chrome-white hover:text-warm-orange"
                onClick={handlePrint}
              >
                <Download className="w-4 h-4 mr-2" />
                Download / Print
              </Button>
              <Button 
                className="bg-warm-orange text-chrome-white hover:bg-warm-amber"
                onClick={handleContactSales}
              >
                <Phone className="w-4 h-4 mr-2" />
                Contact Sales
              </Button>
            </div>
          </footer>
        </section>
      </main>
      
      {/* Contact Modal */}
      {isContactModalOpen && (
        <ContactModal
          open={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          calculatorState={{
            siteType: quoteData.siteType!,
            acCount: quoteData.acCount || 0,
            dcCount: quoteData.dcCount || 0,
            isUnderground: quoteData.isUnderground || false,
            runFactor: 1.0,
          }}
          estimate={quoteData.estimate!}
        />
      )}
    </>
  );
}