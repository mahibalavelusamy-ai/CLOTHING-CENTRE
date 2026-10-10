import React from 'react';
import { Sparkles, Scissors, Store, MapPin, Phone, MessageCircle } from 'lucide-react';
import { STORE_CENTRE_INFO } from '../data/clothingData';

export const BrandStoryBlock: React.FC = () => {
  return (
    <div className="space-y-16 sm:space-y-24 mb-16">
      {/* 1. Services & Boutique Strengths (Clean #F5F5F7 Rounded Block) */}
      <section className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="bg-[#F5F5F7] border border-[#E8E8ED] rounded-[24px] sm:rounded-[28px] p-8 sm:p-14 grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          
          {/* Card 1: Saree Pre-Pleating */}
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F3E8EB] text-[#6D1A33] flex items-center justify-center">
              <Scissors className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-semibold text-[#1D1D1F] tracking-tight">
              Saree pre-pleating
            </h3>
            <p className="text-[15px] leading-relaxed text-[#6E6E73] font-normal">
              Bring your saree to the store. We pleat and box-fold it with artisanal precision so it is ready to drape effortlessly on your special day.
            </p>
          </div>

          {/* Card 2: Handloom & Boutique Apparel */}
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F3E8EB] text-[#6D1A33] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-semibold text-[#1D1D1F] tracking-tight">
              Curated ethnic collections
            </h3>
            <p className="text-[15px] leading-relaxed text-[#6E6E73] font-normal">
              Handpicked Kanjivaram & Tussar silk sarees, hand-block printed cotton crop tops, designer blouses, and coordinates crafted with generational mastery.
            </p>
          </div>

          {/* Card 3: In-Store Pickup & Delivery */}
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F3E8EB] text-[#6D1A33] flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-semibold text-[#1D1D1F] tracking-tight">
              Pick up in store
            </h3>
            <p className="text-[15px] leading-relaxed text-[#6E6E73] font-normal">
              Order online, choose your preferred collection time window, and collect from MR Complex with zero fee, or enjoy free doorstep delivery on orders above ₹1,999.
            </p>
          </div>

        </div>
      </section>

      {/* 2. Flagship Store Showcase (Visit us in Kallimandayam) */}
      <section 
        id="visit"
        className="max-w-7xl mx-auto px-2 sm:px-4 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center"
      >
        <div className="space-y-5">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#1D1D1F] leading-tight">
            Visit us in Kallimandayam.
          </h2>
          
          <div className="space-y-2 text-base sm:text-[17px] text-[#424245] leading-relaxed">
            <p className="flex items-start gap-2.5">
              <MapPin className="w-5 h-5 text-[#6D1A33] shrink-0 mt-0.5" />
              <span>{STORE_CENTRE_INFO.address}</span>
            </p>
            <p className="text-[#6E6E73] pl-7">
              Open every day, 9:30 AM to 9:00 PM
            </p>
          </div>

          {/* Phone contacts */}
          <div className="pl-7 space-y-1 text-base text-[#424245]">
            <a 
              href={`tel:${STORE_CENTRE_INFO.phone.replace(/\s+/g, '')}`}
              className="text-[#6D1A33] font-medium hover:underline block"
            >
              {STORE_CENTRE_INFO.phone}
            </a>
            {STORE_CENTRE_INFO.phone2 && (
              <a 
                href={`tel:${STORE_CENTRE_INFO.phone2.replace(/\s+/g, '')}`}
                className="text-[#6D1A33] font-medium hover:underline block"
              >
                {STORE_CENTRE_INFO.phone2}
              </a>
            )}
          </div>

          {/* Action CTAs */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <a
              href="https://www.google.com/maps/search/?api=1&query=MR+Complex+Kallimandayam+Oddanchatram"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-maroon"
            >
              <span>Get directions</span>
            </a>

            <a
              href={`https://wa.me/${STORE_CENTRE_INFO.whatsapp}?text=${encodeURIComponent("Hello Yaazh Boutique, I would like to visit your store in Kallimandayam.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-dark text-[#2E7D4F] border-[#D2D2D7] hover:border-[#2E7D4F]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Right: Yaazh Emblem Card */}
        <div className="bg-[#F5F5F7] border border-[#E8E8ED] rounded-[28px] aspect-[4/3] flex flex-col items-center justify-center p-8 text-center space-y-4">
          <img
            src="/brand/logo.png"
            alt="Yaazh Boutique Emblem"
            className="w-36 h-36 sm:w-44 sm:h-44 object-contain rounded-full shadow-sm"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="space-y-1">
            <p className="font-serif-display text-lg font-bold text-[#1D1D1F] uppercase">
              {STORE_CENTRE_INFO.name}
            </p>
            <p className="text-[14px] text-[#6E6E73] max-w-sm leading-relaxed">
              Named after the <span className="font-tamil font-semibold text-[#6D1A33]">யாழ்</span>, the revered stringed instrument of ancient Tamil classical heritage.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
