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

  const strokeOpacity = isActive ? 1 : 0.7;
  const glowOpacity = isActive ? 0.55 : 0.35;
  const hoverAmplitude = isActive ? 10 : 6;

  return (
    <div className={`w-full h-full flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 1024 1024"
        className={`w-full h-full max-w-md max-h-md ${isVisible ? 'animate-fade-in' : ''}`}
        style={{
          filter: `drop-shadow(8px 12px 24px rgba(0, 0, 0, 0.2))`
        }}
      >
        <title>Car Dealership — EV Neon Hover</title>
        
        {/* CSS Animations */}
        <defs>
          <style>
            {`
              @media (prefers-reduced-motion: no-preference) {
                .dealership-main {
                  animation: hover-main 4s ease-in-out infinite;
                  transform-origin: 512px 512px;
                }
                .glow-pulse {
                  animation: glow-pulse 4s ease-in-out infinite;
                }
                .battery-hud {
                  animation: battery-fill 2s ease-in-out infinite;
                }
                .cable-shimmer {
                  animation: cable-flow 2s linear infinite;
                }
                .charger-led {
                  animation: led-blink 1.2s ease-in-out infinite;
                }
                .road-car {
                  animation: road-motion 3s ease-in-out infinite;
                }
              }

              @keyframes hover-main {
                0%, 100% { 
                  transform: translateY(0px) rotate(0deg) scale(1); 
                }
                50% { 
                  transform: translateY(-${hoverAmplitude}px) rotate(0.4deg) scale(1.01); 
                }
              }

              @keyframes glow-pulse {
                0%, 100% { 
                  filter: drop-shadow(0 0 4px rgba(230, 230, 230, 0.4)); 
                }
                50% { 
                  filter: drop-shadow(0 0 8px rgba(230, 230, 230, ${glowOpacity})); 
                }
              }

              @keyframes battery-fill {
                0% { stroke-dasharray: 0 40; }
                25% { stroke-dasharray: 10 30; }
                50% { stroke-dasharray: 20 20; }
                75% { stroke-dasharray: 30 10; }
                85% { stroke-dasharray: 40 0; }
                100% { stroke-dasharray: 40 0; }
              }

              @keyframes cable-flow {
                0% { stroke-dashoffset: 0; }
                100% { stroke-dashoffset: -20; }
              }

              @keyframes led-blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0.3; }
              }

              @keyframes road-motion {
                0%, 100% { transform: translateX(0); opacity: 1; }
                50% { transform: translateX(10px); opacity: 1; }
              }

              @media (prefers-reduced-motion: reduce) {
                .dealership-main, .glow-pulse, .battery-hud, .cable-shimmer, .charger-led, .road-car {
                  animation: none !important;
                  filter: drop-shadow(0 0 6px rgba(230, 230, 230, 0.4)) !important;
                }
              }
            `}
          </style>
        </defs>

        {/* Main dealership structure */}
        <g className="dealership-main glow-pulse">
          {/* Building outline - continuous path */}
          <path
            d="M 200 450 L 200 350 L 350 280 L 500 350 L 500 300 L 650 240 L 800 300 L 800 450 L 650 520 L 500 450 L 350 520 L 200 450 Z
               M 500 350 L 500 450
               M 350 350 L 450 320 L 550 350 L 650 320 L 750 350
               M 220 380 L 220 420 M 240 380 L 240 420 M 260 380 L 260 420 M 280 380 L 280 420 M 300 380 L 300 420 M 320 380 L 320 420"
            fill="none"
            stroke="#1A1A1A"
            strokeWidth="4"
            strokeOpacity={strokeOpacity}
            strokeLinecap="round"
            strokeLinejoin="round"
            rx="12"
          />

          {/* Roof skylights */}
          <g>
            <rect x="370" y="300" width="60" height="30" rx="12" fill="none" stroke="#1A1A1A" strokeWidth="4" strokeOpacity={strokeOpacity} />
            <rect x="450" y="290" width="60" height="30" rx="12" fill="none" stroke="#1A1A1A" strokeWidth="4" strokeOpacity={strokeOpacity} />
            <rect x="530" y="285" width="60" height="30" rx="12" fill="none" stroke="#1A1A1A" strokeWidth="4" strokeOpacity={strokeOpacity} />
          </g>

          {/* Forecourt parking bays */}
          <g>
            <path d="M 180 500 L 220 480 L 260 500 L 220 520 Z" fill="none" stroke="#1A1A1A" strokeWidth="4" strokeOpacity={strokeOpacity} strokeLinecap="round" />
            <path d="M 280 500 L 320 480 L 360 500 L 320 520 Z" fill="none" stroke="#1A1A1A" strokeWidth="4" strokeOpacity={strokeOpacity} strokeLinecap="round" />
            <path d="M 380 500 L 420 480 L 460 500 L 420 520 Z" fill="none" stroke="#1A1A1A" strokeWidth="4" strokeOpacity={strokeOpacity} strokeLinecap="round" />
          </g>

          {/* EV Chargers */}
          <g>
            {/* Charger 1 */}
            <rect x="480" y="520" width="20" height="40" rx="8" fill="none" stroke="#1A1A1A" strokeWidth="4" strokeOpacity={strokeOpacity} />
            <circle cx="490" cy="530" r="3" fill="#1A1A1A" className="charger-led" opacity={strokeOpacity} />
            
            {/* Charger 2 */}
            <rect x="520" y="520" width="20" height="40" rx="8" fill="none" stroke="#1A1A1A" strokeWidth="4" strokeOpacity={strokeOpacity} />
            <circle cx="530" cy="530" r="3" fill="#1A1A1A" className="charger-led" opacity={strokeOpacity} />
          </g>

          {/* Demo car (plugged in) */}
          <g>
            <path d="M 420 490 L 460 485 L 460 505 L 420 510 Z M 425 492 L 425 503 M 455 487 L 455 498" fill="none" stroke="#1A1A1A" strokeWidth="4" strokeOpacity={strokeOpacity} strokeLinecap="round" />
            
            {/* Charging cable */}
            <path 
              d="M 460 495 Q 470 500 480 520" 
              fill="none" 
              stroke="#1A1A1A" 
              strokeWidth="3" 
              strokeOpacity={strokeOpacity}
              strokeDasharray="4 4"
              className="cable-shimmer"
            />
          </g>

          {/* Battery HUD above car (only visible when active) */}
          {isActive && (
            <g>
              <rect x="415" y="470" width="50" height="12" rx="6" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeOpacity={0.8} />
              <rect 
                x="418" 
                y="473" 
                width="44" 
                height="6" 
                rx="3" 
                fill="none" 
                stroke="#1A1A1A" 
                strokeWidth="2" 
                strokeOpacity={0.8}
                className="battery-hud"
              />
            </g>
          )}

          {/* Pylon sign */}
          <g>
            <rect x="150" y="580" width="60" height="30" rx="12" fill="none" stroke="#1A1A1A" strokeWidth="4" strokeOpacity={strokeOpacity} />
            <rect x="175" y="610" width="10" height="20" rx="4" fill="none" stroke="#1A1A1A" strokeWidth="4" strokeOpacity={strokeOpacity} />
            <text x="180" y="600" fontSize="12" fill="#1A1A1A" textAnchor="middle" opacity={strokeOpacity} fontWeight="bold">CARS</text>
          </g>

          {/* Trees */}
          <g>
            <circle cx="120" cy="400" r="20" fill="none" stroke="#1A1A1A" strokeWidth="4" strokeOpacity={strokeOpacity} />
            <rect x="115" y="420" width="10" height="30" rx="4" fill="none" stroke="#1A1A1A" strokeWidth="4" strokeOpacity={strokeOpacity} />
            
            <circle cx="850" cy="420" r="20" fill="none" stroke="#1A1A1A" strokeWidth="4" strokeOpacity={strokeOpacity} />
            <rect x="845" y="440" width="10" height="30" rx="4" fill="none" stroke="#1A1A1A" strokeWidth="4" strokeOpacity={strokeOpacity} />
            
            <circle cx="120" cy="600" r="20" fill="none" stroke="#1A1A1A" strokeWidth="4" strokeOpacity={strokeOpacity} />
            <rect x="115" y="620" width="10" height="30" rx="4" fill="none" stroke="#1A1A1A" strokeWidth="4" strokeOpacity={strokeOpacity} />
          </g>

          {/* Road segment */}
          <g>
            <path d="M 50 700 L 950 700 M 50 750 L 950 750" fill="none" stroke="#1A1A1A" strokeWidth="4" strokeOpacity={strokeOpacity} strokeLinecap="round" />
            <path d="M 100 725 L 150 725 M 200 725 L 250 725 M 300 725 L 350 725 M 400 725 L 450 725 M 500 725 L 550 725 M 600 725 L 650 725 M 700 725 L 750 725 M 800 725 L 850 725" 
                  fill="none" 
                  stroke="#1A1A1A" 
                  strokeWidth="2" 
                  strokeOpacity={strokeOpacity * 0.6} 
                  strokeDasharray="25 25"
                  strokeLinecap="round" />
            
            {/* Streetlight */}
            <rect x="895" y="650" width="8" height="50" rx="4" fill="none" stroke="#1A1A1A" strokeWidth="4" strokeOpacity={strokeOpacity} />
            <circle cx="899" cy="645" r="8" fill="none" stroke="#1A1A1A" strokeWidth="4" strokeOpacity={strokeOpacity} />
            
            {/* Small road car */}
            <path 
              d="M 700 720 L 730 718 L 730 732 L 700 730 Z M 705 722 L 705 728 M 725 720 L 725 726" 
              fill="none" 
              stroke="#1A1A1A" 
              strokeWidth="3" 
              strokeOpacity={strokeOpacity * 0.7}
              strokeLinecap="round"
              className="road-car"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}