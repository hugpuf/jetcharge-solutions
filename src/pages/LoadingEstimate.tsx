import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function LoadingEstimate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    // Show loading for 2-3 seconds, then navigate to estimate
    const timer = setTimeout(() => {
      navigate(`/estimate?${searchParams.toString()}`, { replace: true });
    }, 2200);
    
    return () => clearTimeout(timer);
  }, [navigate, searchParams]);
  
  return (
    <main className="min-h-screen bg-gradient-warm-sweep flex items-center justify-center p-6">
      <section className="relative w-[794px] max-w-full aspect-[210/297] bg-chrome-white rounded-xl border border-steel-200 overflow-hidden">
        {/* Shimmering neon edge effect */}
        <div className="absolute inset-0 rounded-xl animate-pulse">
          <div className="absolute inset-0 rounded-xl shadow-warm opacity-40" />
          <div className="absolute inset-0 rounded-xl border-2 border-warm-orange/30" />
        </div>
        
        {/* Content skeleton */}
        <div className="relative z-10 p-8 h-full flex flex-col">
          {/* Header skeleton */}
          <div className="flex justify-between items-start mb-8">
            <div className="h-6 w-32 bg-steel-200 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 w-24 bg-steel-200 rounded animate-pulse" />
              <div className="h-3 w-20 bg-steel-200 rounded animate-pulse" />
              <div className="h-3 w-28 bg-steel-200 rounded animate-pulse" />
            </div>
          </div>
          
          {/* Hero section skeleton */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="border border-steel-200 rounded-lg p-4 space-y-3">
              <div className="h-3 w-20 bg-steel-200 rounded animate-pulse" />
              <div className="h-8 w-24 bg-steel-200 rounded animate-pulse" />
              <div className="h-3 w-16 bg-steel-200 rounded animate-pulse" />
            </div>
            <div className="border border-steel-200 rounded-lg p-4 space-y-3">
              <div className="h-3 w-20 bg-steel-200 rounded animate-pulse" />
              <div className="h-8 w-24 bg-steel-200 rounded animate-pulse" />
              <div className="h-6 w-20 bg-steel-200 rounded animate-pulse" />
            </div>
          </div>
          
          {/* Details skeleton */}
          <div className="mb-6">
            <div className="h-4 w-16 bg-steel-200 rounded animate-pulse mb-3" />
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-3 bg-steel-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
          
          {/* Table skeleton */}
          <div className="flex-1 mb-6">
            <div className="h-4 w-20 bg-steel-200 rounded animate-pulse mb-3" />
            <div className="border border-steel-200 rounded-lg p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-3 w-32 bg-steel-200 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-steel-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Loading message */}
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-3 text-steel-600">
              <div className="w-6 h-6 border-2 border-warm-orange border-t-transparent rounded-full animate-spin" />
              <span className="text-lg font-medium">Preparing your estimate...</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}