import React, { useState, useEffect } from 'react';
import { Truck, RotateCcw, Scissors } from 'lucide-react';
import { formatPrice, FREE_DELIVERY_THRESHOLD } from '../lib/format';

const MESSAGES = [
  {
    icon: Truck,
    text: `Complimentary Delivery On Orders Above ${formatPrice(FREE_DELIVERY_THRESHOLD)}`,
  },
  {
    icon: RotateCcw,
    text: 'Easy 7-Day Returns & Size Exchange Available',
  },
  {
    icon: Scissors,
    text: 'Complimentary Saree Fall, Pico & Custom Alterations',
  },
];

export const AnnouncementBar: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-stone-950 text-stone-300 border-b border-stone-800 text-[11px] py-2 px-4 select-none">
      <div className="max-w-7xl mx-auto">
        {/* Desktop: display all 3 messages with elegant spacing and subtle dividers */}
        <div className="hidden md:flex items-center justify-center gap-8 tracking-widest uppercase text-[10px] font-medium text-stone-400">
          {MESSAGES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <React.Fragment key={item.text}>
                <div className="flex items-center gap-2 hover:text-stone-200 transition-colors">
                  <Icon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{item.text}</span>
                </div>
                {idx < MESSAGES.length - 1 && (
                  <span className="text-stone-700" aria-hidden="true">·</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile: smoothly rotating single message */}
        <div className="md:hidden flex items-center justify-center text-center">
          {(() => {
            const CurrentIcon = MESSAGES[currentIndex].icon;
            return (
              <div
                key={currentIndex}
                className="flex items-center justify-center gap-2 tracking-widest uppercase text-[10px] font-medium text-stone-300 transition-opacity duration-300"
              >
                <CurrentIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{MESSAGES[currentIndex].text}</span>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
