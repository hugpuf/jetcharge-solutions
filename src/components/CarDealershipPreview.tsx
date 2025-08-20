import { useEffect, useState } from 'react';

interface CarDealershipPreviewProps {
  isActive?: boolean;
  className?: string;
}

export function CarDealershipPreview({ isActive = true, className = "" }: CarDealershipPreviewProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const floatAmplitude = isActive ? 12 : 8;
  const shadowOpacity = isActive ? 0.4 : 0.25;

  return (
    <div className={`w-full h-full flex items-center justify-center relative ${className}`}>
      <style>
        {`
          @media (prefers-reduced-motion: no-preference) {
            .floating-dealership {
              animation: float-up-down 3s ease-in-out infinite;
            }
            .orange-shadow {
              animation: shadow-pulse 3s ease-in-out infinite;
            }
          }

          @keyframes float-up-down {
            0%, 100% { 
              transform: translateY(0px); 
            }
            50% { 
              transform: translateY(-${floatAmplitude}px); 
            }
          }

          @keyframes shadow-pulse {
            0%, 100% { 
              opacity: ${shadowOpacity * 0.7};
              transform: scale(1);
            }
            50% { 
              opacity: ${shadowOpacity};
              transform: scale(1.05);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .floating-dealership, .orange-shadow {
              animation: none !important;
            }
          }
        `}
      </style>
      
      {/* Orange shadow underneath */}
      <div 
        className="orange-shadow absolute bottom-2 w-2/3 h-3 rounded-full blur-md"
        style={{
          background: 'hsl(var(--warm-orange))',
          opacity: shadowOpacity,
        }}
      />
      
      {/* Floating image */}
      <img
        src="/lovable-uploads/8d33438e-4bae-4205-8d3d-d7dfc1da0556.png"
        alt="Car Dealership with EV Charging Station"
        className={`floating-dealership w-auto h-auto max-w-full max-h-full object-contain ${isVisible ? 'animate-fade-in' : ''}`}
        style={{
          filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))',
        }}
      />
    </div>
  );
}