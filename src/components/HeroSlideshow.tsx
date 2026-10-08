import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { Department } from '../types';

interface HeroSlideshowProps {
  onSelectCategory: (dept: Department, category: string) => void;
}

interface Slide {
  id: string;
  eyebrow: string;
  headline: string;
  subtext: string;
  buttonText: string;
  department: Department;
  category: string;
  imageUrl?: string;
  gradientClass: string;
  accentBorder: string;
}

const SLIDES: Slide[] = [
  {
    id: 'slide-1',
    eyebrow: 'ROYAL HERITAGE WEAVES',
    headline: 'Handloom Kanchipuram & Pure Silk Sarees.',
    subtext: 'Exquisite zari borders, soft mulberry silks, and breathable everyday cotton drapes for timeless celebrations.',
    buttonText: 'Explore Sarees',
    department: 'sarees',
    category: 'Silk Sarees',
    gradientClass: 'from-[#421016] via-[#240b0e] to-stone-950',
    accentBorder: 'border-rose-500/30 text-rose-300 bg-rose-950/60',
  },
  {
    id: 'slide-2',
    eyebrow: 'CONTEMPORARY ETHNIC ATTIRE',
    headline: 'Flowing Anarkalis & Hand-Embroidered Sets.',
    subtext: 'Flattering silhouettes crafted in pure slub cotton, muslin, and georgette with coordinated palazzos and dupattas.',
    buttonText: 'Shop Kurtis & Chudidars',
    department: 'kurtis',
    category: 'Kurtis',
    gradientClass: 'from-[#0d3829] via-[#092219] to-stone-950',
    accentBorder: 'border-emerald-500/30 text-emerald-300 bg-emerald-950/60',
  },
  {
    id: 'slide-3',
    eyebrow: 'DELIGHTFUL FESTIVE KIDSWEAR',
    headline: 'Traditional Pattu Pavadais & Kurta Sets.',
    subtext: 'Gentle on sensitive skin, crafted for vibrant celebrations with handcrafted ethnic charm and all-day comfort.',
    buttonText: 'Discover Kidswear',
    department: 'kids',
    category: 'Girls Ethnic Wear',
    gradientClass: 'from-[#1b2a47] via-[#10192e] to-stone-950',
    accentBorder: 'border-amber-500/30 text-amber-300 bg-amber-950/60',
  },
];

export const HeroSlideshow: React.FC<HeroSlideshowProps> = ({ onSelectCategory }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const slide = SLIDES[currentSlide];

  return (
    <div 
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-950 text-white shadow-xl mb-12"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background imagery or luxury gradient tinted containers with text only */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] min-h-[360px] sm:min-h-[440px] w-full overflow-hidden">
        {SLIDES.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
              idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
          >
            {s.imageUrl ? (
              <>
                <img
                  src={s.imageUrl}
                  alt={s.headline}
                  className="w-full h-full object-cover object-center filter brightness-65 transition-transform duration-1000 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-950/40 to-transparent" />
              </>
            ) : (
              /* Rich gradient tinted background with subtle ambient motif glow */
              <div className={`w-full h-full bg-gradient-to-br ${s.gradientClass} relative overflow-hidden flex items-center`}>
                <div className="absolute -right-16 -top-16 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
                <div className="absolute right-1/4 -bottom-20 w-80 h-80 rounded-full bg-amber-400/5 blur-2xl pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.03)_0%,transparent_60%)] pointer-events-none" />
              </div>
            )}
          </div>
        ))}

        {/* Content Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 sm:p-12 lg:p-16 max-w-3xl">
          <div className="space-y-3 sm:space-y-4">
            <span className={`inline-flex items-center gap-1.5 text-[10px] sm:text-xs uppercase tracking-widest font-semibold px-3 py-1 rounded-full border backdrop-blur-xs ${slide.accentBorder}`}>
              <Sparkles className="w-3 h-3 shrink-0" />
              <span>{slide.eyebrow}</span>
            </span>

            <h1 className="font-serif-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-50 leading-[1.1]">
              {slide.headline}
            </h1>

            <p className="text-xs sm:text-base text-stone-300 leading-relaxed max-w-xl font-normal">
              {slide.subtext}
            </p>

            <div className="pt-2 sm:pt-4">
              <button
                onClick={() => onSelectCategory(slide.department, slide.category)}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm px-6 py-3 rounded-full shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer uppercase tracking-wider"
              >
                <span>{slide.buttonText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Arrow Navigation (Desktop) */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1))}
          className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-stone-900/60 hover:bg-stone-900 text-stone-200 hover:text-white items-center justify-center backdrop-blur-sm border border-stone-700/60 transition-colors cursor-pointer"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % SLIDES.length)}
          className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-stone-900/60 hover:bg-stone-900 text-stone-200 hover:text-white items-center justify-center backdrop-blur-sm border border-stone-700/60 transition-colors cursor-pointer"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slide Indicators Dots */}
        <div className="absolute bottom-5 right-6 sm:right-12 z-20 flex items-center gap-2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentSlide ? 'w-8 bg-amber-400' : 'w-2 bg-stone-500/60 hover:bg-stone-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
