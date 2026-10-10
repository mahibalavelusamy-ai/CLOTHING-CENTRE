import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Sparkles, 
  MessageCircle, 
  Truck, 
  Store, 
  ShieldCheck, 
  Scissors 
} from 'lucide-react';
import { Department } from '../types';
import { STORE_CENTRE_INFO } from '../data/clothingData';
import { buildLink } from '../lib/whatsapp';

interface HeroSlideshowProps {
  onSelectCategory: (dept: Department, category: string) => void;
}

interface Slide {
  id: string;
  eyebrow: string;
  tamilTag: string;
  headline: string;
  subtext: string;
  buttonText: string;
  consultationQuery: string;
  department: Department;
  category: string;
  imageUrl: string;
  statPill: string;
}

const SLIDES: Slide[] = [
  {
    id: 'slide-1',
    eyebrow: 'EXCLUSIVE HANDLOOMS',
    tamilTag: 'பாரம்பரிய காஞ்சிபுரம்',
    headline: 'Kanjivaram, woven for the days you remember.',
    subtext: 'Handloom silk sarees with pure zari borders, chosen piece by piece for our flagship boutique in Oddanchatram.',
    buttonText: 'Shop Sarees',
    consultationQuery: 'Hello Yaazh Boutique! I would like to consult a stylist regarding your Handwoven Kanjivaram & Tussar Sarees collection.',
    department: 'sarees',
    category: 'All',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=85',
    statPill: 'Pure Zari • Handwoven'
  },
  {
    id: 'slide-2',
    eyebrow: 'ARTISANAL TAILORING',
    tamilTag: 'பிரத்தியேக தையல்',
    headline: 'Handcrafted Cotton Crop Tops & Designer Blouses.',
    subtext: 'Botanical block prints, rustic wooden buttons, and tailored cuts with 2-inch alteration margins in sizes 32 to 46.',
    buttonText: 'Shop Crop Tops & Blouses',
    consultationQuery: 'Hello Yaazh Boutique! I would like to inquire about your Cotton Crop Tops & Designer Blouses collection.',
    department: 'blouses',
    category: 'All',
    imageUrl: '/products/crop-tops/crop-tops-collection-banner.png',
    statPill: 'Pure Cotton • Wooden Buttons'
  },
  {
    id: 'slide-3',
    eyebrow: 'EFFORTLESS MODERN LUXURY',
    tamilTag: 'வசதியான நவீன ஆடைகள்',
    headline: 'Co-ord Sets & Pure Mulmul Lounge Wear.',
    subtext: 'Breezy pure linen coordinates and feather-light mulmul silhouettes crafted for everyday grace, travel, and festive ease.',
    buttonText: 'Discover Co-ords',
    consultationQuery: 'Hello Yaazh Boutique! I would like to know more about available sizes and colors in your Co-ord & Lounge Wear collection.',
    department: 'coords',
    category: 'All',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=85',
    statPill: 'Breathable Mulmul & Linen'
  },
];

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: '100% Handloom',
    desc: 'Curated authentic weaves',
  },
  {
    icon: Scissors,
    title: 'Saree Pre-Pleating',
    desc: 'Ready drape on request',
  },
  {
    icon: Truck,
    title: 'Free Express Delivery',
    desc: 'On orders above ₹1,999',
  },
  {
    icon: Store,
    title: 'Boutique Store Pickup',
    desc: 'MR Complex, Oddanchatram',
  },
];

const SLIDE_DURATION_MS = 6000;

export const HeroSlideshow: React.FC<HeroSlideshowProps> = ({ onSelectCategory }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isPaused) return;

    const tickInterval = 50;
    const step = (tickInterval / SLIDE_DURATION_MS) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentSlide((curr) => (curr + 1) % SLIDES.length);
          return 0;
        }
        return prev + step;
      });
    }, tickInterval);

    return () => clearInterval(timer);
  }, [isPaused, currentSlide]);

  const slide = SLIDES[currentSlide];

  const handleSelectSlide = (index: number) => {
    setCurrentSlide(index);
    setProgress(0);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
    setProgress(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
    setTouchStart(null);
  };

  const stylistUrl = buildLink(
    STORE_CENTRE_INFO.whatsapp,
    slide.consultationQuery
  );

  return (
    <section className="mb-14 space-y-6 pt-2 sm:pt-4">
      {/* Editorial Headline on Top (Apple-style) */}
      <div className="text-center max-w-4xl mx-auto px-4">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#1D1D1F] leading-[1.08] transition-all">
          {slide.headline}
        </h1>
        <p className="text-base sm:text-xl text-[#6E6E73] max-w-2xl mx-auto mt-4 leading-relaxed font-normal">
          {slide.subtext}
        </p>

        {/* Dual CTAs in Pill Style */}
        <div className="flex items-center justify-center gap-3 mt-7 flex-wrap">
          <button
            onClick={() => onSelectCategory(slide.department, slide.category)}
            className="btn-maroon"
          >
            <span>{slide.buttonText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="#visit"
            className="btn-outline-dark"
          >
            <span>Visit the store</span>
          </a>

          <a
            href={stylistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-dark text-[#2E7D4F] border-[#D2D2D7] hover:border-[#2E7D4F] hidden sm:inline-flex"
            title="Chat on WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Cinematic Showcase Container with 28px rounded corners */}
      <div 
        className="relative w-full rounded-[24px] sm:rounded-[28px] overflow-hidden bg-[#F5F5F7] shadow-sm border border-[#E8E8ED] touch-pan-y group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative min-h-[440px] sm:min-h-[480px] lg:min-h-[520px] aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9] w-full overflow-hidden">
          {SLIDES.map((s, idx) => {
            const isActive = idx === currentSlide;
            return (
              <div
                key={s.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <img
                  src={s.imageUrl}
                  alt={s.headline}
                  className={`w-full h-full object-cover object-center transition-transform duration-[6500ms] ease-out ${
                    isActive ? 'scale-105' : 'scale-100'
                  }`}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />

                {/* Subtle Luxury Gradient on Bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            );
          })}

          {/* Floating Badges in Bottom Left */}
          <div className="absolute bottom-6 left-6 z-20 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-white/95 text-[#1D1D1F] shadow-sm">
              <Sparkles className="w-3 h-3 text-[#6D1A33]" />
              <span>{slide.eyebrow}</span>
            </span>
            <span className="font-tamil text-xs text-white font-semibold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs">
              {slide.tamilTag}
            </span>
            <span className="hidden sm:inline-flex text-xs text-white/90 font-medium px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs">
              {slide.statPill}
            </span>
          </div>

          {/* Arrow Navigation (Desktop) */}
          <button
            onClick={handlePrev}
            className="hidden sm:flex absolute left-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#1D1D1F] items-center justify-center shadow-md transition-all cursor-pointer border border-[#E8E8ED]"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            className="hidden sm:flex absolute right-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#1D1D1F] items-center justify-center shadow-md transition-all cursor-pointer border border-[#E8E8ED]"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Carousel Slide Indicators */}
          <div className="absolute bottom-5 right-5 sm:bottom-6 sm:right-6 z-30 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
            <span className="text-[11px] font-mono font-bold text-white mr-1">
              0{currentSlide + 1} / 0{SLIDES.length}
            </span>
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSlide(idx)}
                className="relative h-1.5 rounded-full overflow-hidden transition-all cursor-pointer bg-white/40"
                style={{ width: idx === currentSlide ? '28px' : '8px' }}
                aria-label={`Jump to slide ${idx + 1}`}
              >
                {idx === currentSlide && (
                  <div 
                    className="absolute inset-y-0 left-0 bg-[#C9A45C] rounded-full transition-all duration-75"
                    style={{ width: `${progress}%` }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Boutique Trust & Service Strip in #F5F5F7 */}
      <div className="bg-[#F5F5F7] text-[#1D1D1F] rounded-[24px] border border-[#E8E8ED] p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 divide-y md:divide-y-0 md:divide-x divide-[#E8E8ED]">
          {TRUST_POINTS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div 
                key={index}
                className={`flex items-center gap-3 ${
                  index > 1 ? 'pt-3 md:pt-0' : ''
                } ${index % 2 !== 0 ? 'pl-2 sm:pl-4' : ''}`}
              >
                <div className="w-9 h-9 rounded-xl bg-[#F3E8EB] text-[#6D1A33] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[13px] font-semibold text-[#1D1D1F] truncate">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#6E6E73] truncate font-normal">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
