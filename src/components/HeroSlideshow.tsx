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
  accentBorder: string;
}

const SLIDES: Slide[] = [
  {
    id: 'slide-1',
    eyebrow: 'EXCLUSIVE HANDLOOMS',
    tamilTag: 'பாரம்பரிய காஞ்சிபுரம்',
    headline: 'Handwoven Kanjivaram & Tussar Sarees',
    subtext: 'Timeless drapes, pure zari temple borders, and festive palettes crafted with generational mastery for your most cherished moments.',
    buttonText: 'Explore Sarees',
    consultationQuery: 'Hello Yaazh Boutique! I would like to consult a stylist regarding your Handwoven Kanjivaram & Tussar Sarees collection.',
    department: 'sarees',
    category: 'All',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=85',
    statPill: 'Pure Zari • Handwoven',
    accentBorder: 'border-amber-400/40 text-amber-300 bg-amber-950/70',
  },
  {
    id: 'slide-2',
    eyebrow: 'ARTISANAL TAILORING',
    tamilTag: 'பிரத்தியேக தையல்',
    headline: 'Handcrafted Cotton Crop Tops & Designer Blouses',
    subtext: 'Pure cotton botanical block prints, Ikat chevron weaves, rustic wooden button finishes, and pre-stitched tailored cuts paired to perfection.',
    buttonText: 'Shop Crop Tops & Blouses',
    consultationQuery: 'Hello Yaazh Boutique! I would like to inquire about your Cotton Crop Tops & Designer Blouses collection.',
    department: 'blouses',
    category: 'All',
    imageUrl: '/products/crop-tops/crop-tops-collection-banner.png',
    statPill: 'Pure Cotton • Wooden Buttons',
    accentBorder: 'border-amber-400/40 text-amber-300 bg-amber-950/70',
  },
  {
    id: 'slide-3',
    eyebrow: 'EFFORTLESS MODERN LUXURY',
    tamilTag: 'வசதியான நவீன ஆடைகள்',
    headline: 'Co-ord Sets & Pure Mulmul Lounge Wear',
    subtext: 'Breezy pure linen coordinates and feather-light mulmul silhouettes crafted for everyday grace, travel, and festive ease.',
    buttonText: 'Discover Co-ords',
    consultationQuery: 'Hello Yaazh Boutique! I would like to know more about available sizes and colors in your Co-ord & Lounge Wear collection.',
    department: 'coords',
    category: 'All',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=85',
    statPill: 'Breathable Mulmul & Linen',
    accentBorder: 'border-amber-400/40 text-amber-300 bg-amber-950/70',
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

  // Auto-play interval with fine-grained progress bar update
  useEffect(() => {
    if (isPaused) return;

    const tickInterval = 50; // update progress every 50ms
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
    <div className="mb-12 space-y-3">
      {/* Cinematic Main Slide Showcase */}
      <div 
        className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-950 text-white shadow-2xl border border-stone-800 touch-pan-y group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Aspect ratio: Taller on mobile (min-h 480px) for editorial fashion framing */}
        <div className="relative min-h-[480px] sm:min-h-[500px] lg:min-h-[540px] aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9] w-full overflow-hidden">
          {SLIDES.map((s, idx) => {
            const isActive = idx === currentSlide;
            return (
              <div
                key={s.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Background Imagery with Subtle Cinematic Ken Burns Scale */}
                <img
                  src={s.imageUrl}
                  alt={s.headline}
                  className={`w-full h-full object-cover object-center filter brightness-[0.62] transition-transform duration-[6500ms] ease-out ${
                    isActive ? 'scale-105' : 'scale-100'
                  }`}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />

                {/* Luxury Vignette and Multi-stop Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-950/65 to-transparent sm:max-w-3xl" />
              </div>
            );
          })}

          {/* Ambient Gold Radial Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(217,119,6,0.14)_0%,transparent_60%)] pointer-events-none z-10" />

          {/* Editorial Content Overlay */}
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-12 lg:p-16 max-w-3xl">
            <div className="space-y-3.5 sm:space-y-4">
              
              {/* Badges: Eyebrow + Tamil Script + Stat Pill */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 text-[10px] sm:text-xs uppercase tracking-widest font-bold px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border backdrop-blur-md shadow-xs ${slide.accentBorder}`}>
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{slide.eyebrow}</span>
                </span>

                <span className="font-tamil text-[11px] sm:text-xs text-amber-300/90 font-medium px-2.5 py-1 rounded-full bg-stone-900/60 border border-stone-700/60 backdrop-blur-md">
                  {slide.tamilTag}
                </span>

                <span className="hidden sm:inline-flex text-[11px] text-stone-300 font-medium px-2.5 py-1 rounded-full bg-stone-900/60 border border-stone-800 backdrop-blur-md">
                  {slide.statPill}
                </span>
              </div>

              {/* Headline */}
              <h1 className="font-serif-display text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.14] drop-shadow-md">
                {slide.headline}
              </h1>

              {/* Description Subtext */}
              <p className="text-xs sm:text-sm lg:text-base text-stone-300 leading-relaxed max-w-xl font-normal drop-shadow-xs">
                {slide.subtext}
              </p>

              {/* Dual Action CTAs: Shop Collection + WhatsApp Stylist Consultation */}
              <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-2.5 sm:gap-3.5">
                <button
                  onClick={() => onSelectCategory(slide.department, slide.category)}
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm px-6 sm:px-7 py-3 sm:py-3.5 rounded-full shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer uppercase tracking-wider"
                >
                  <span>{slide.buttonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href={stylistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-stone-900/80 hover:bg-stone-900 text-stone-100 hover:text-white border border-stone-700/80 hover:border-amber-500/50 backdrop-blur-md font-semibold text-xs sm:text-sm px-4.5 sm:px-5 py-3 sm:py-3.5 rounded-full shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  title="Connect with Yaazh Boutique Stylist on WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Chat with Stylist</span>
                </a>
              </div>
            </div>
          </div>

          {/* Desktop Arrow Controls */}
          <button
            onClick={handlePrev}
            className="hidden sm:flex absolute left-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-stone-950/70 hover:bg-stone-900 text-stone-200 hover:text-white items-center justify-center backdrop-blur-md border border-stone-700/80 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            className="hidden sm:flex absolute right-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-stone-950/70 hover:bg-stone-900 text-stone-200 hover:text-white items-center justify-center backdrop-blur-md border border-stone-700/80 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Editorial Counter & Progress Bar (Bottom Right) */}
          <div className="absolute bottom-5 right-5 sm:bottom-8 sm:right-12 z-30 flex flex-col items-end gap-2 bg-stone-950/60 backdrop-blur-md px-3.5 py-2 rounded-xl border border-stone-800/80">
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono font-medium text-stone-300">
              <span className="text-amber-400 font-bold">0{currentSlide + 1}</span>
              <span className="text-stone-600">/</span>
              <span>0{SLIDES.length}</span>
            </div>

            {/* Slide Navigation Progress Trackers */}
            <div className="flex items-center gap-1.5">
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSlide(idx)}
                  className="relative h-1.5 rounded-full overflow-hidden transition-all cursor-pointer bg-stone-700/80"
                  style={{ width: idx === currentSlide ? '36px' : '10px' }}
                  aria-label={`Jump to slide ${idx + 1}`}
                >
                  {idx === currentSlide && (
                    <div 
                      className="absolute inset-y-0 left-0 bg-amber-400 rounded-full transition-all duration-75"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Boutique Trust & Service Bar */}
      <div className="bg-stone-900 text-stone-200 rounded-2xl border border-stone-800 p-3 sm:p-4 shadow-md">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 divide-y md:divide-y-0 md:divide-x divide-stone-800/80">
          {TRUST_POINTS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div 
                key={index}
                className={`flex items-center gap-2.5 sm:gap-3 ${
                  index > 1 ? 'pt-2.5 md:pt-0' : ''
                } ${index % 2 !== 0 ? 'pl-2 sm:pl-3' : ''}`}
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-stone-100 truncate">
                    {item.title}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-stone-400 truncate">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
