import React, { useState, useEffect } from 'react';
import { Sparkles, Phone, Scissors } from 'lucide-react';

const MESSAGES = [
  {
    icon: Sparkles,
    text: 'Welcome to Yaazh Boutique, Oddanchatram',
  },
  {
    icon: Phone,
    text: 'Call us: +91 95978 33982',
  },
  {
    icon: Scissors,
    text: 'Saree pre-pleating available in store',
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
    <div className="bg-bg text-text-muted border-b border-border text-[11px] py-2 px-4 select-none">
      <div className="max-w-7xl mx-auto">
        {/* Desktop: display all 3 messages with elegant spacing and subtle dividers */}
        <div className="hidden md:flex items-center justify-center gap-8 tracking-widest uppercase text-[10px] font-medium text-text-muted">
          {MESSAGES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <React.Fragment key={item.text}>
                <div className="flex items-center gap-2 hover:text-text transition-colors">
                  <Icon className="w-3.5 h-3.5 text-pink shrink-0" />
                  <span>{item.text}</span>
                </div>
                {idx < MESSAGES.length - 1 && (
                  <span className="text-border" aria-hidden="true">·</span>
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
                className="flex items-center justify-center gap-2 tracking-widest uppercase text-[10px] font-medium text-text-muted transition-opacity duration-300"
              >
                <CurrentIcon className="w-3.5 h-3.5 text-pink shrink-0" />
                <span>{MESSAGES[currentIndex].text}</span>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
