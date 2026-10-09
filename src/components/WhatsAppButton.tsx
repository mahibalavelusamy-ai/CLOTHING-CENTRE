import React from 'react';
import { MessageCircle } from 'lucide-react';
import { STORE_CENTRE_INFO } from '../data/clothingData';
import { buildLink } from '../lib/whatsapp';

interface WhatsAppButtonProps {
  currentCategory?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = () => {
  const greeting = `Hello ${STORE_CENTRE_INFO.name}! I am browsing your online store and would like to know more about your collection.`;
  const whatsappUrl = buildLink(STORE_CENTRE_INFO.whatsapp, greeting);

  return (
    <div className="fixed bottom-20 md:bottom-6 right-5 z-40 flex items-center gap-2 group">
      <div className="hidden sm:flex items-center gap-1.5 bg-surface/90 text-text text-[11px] font-semibold py-1.5 px-3 rounded-full border border-border shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Chat on WhatsApp</span>
      </div>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative w-13 h-13 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-108 active:scale-95 cursor-pointer border-2 border-white/20"
        aria-label="Chat on WhatsApp"
        title="Chat with Yaazh Boutique on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 text-white fill-white/20" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-pink border-2 border-surface rounded-full" />
      </a>
    </div>
  );
};
