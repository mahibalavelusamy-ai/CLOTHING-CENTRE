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
  imageUrl: string;
  gradientClass: string;
  accentBorder: string;
}

const SLIDES: Slide[] = [
  {
    id: 'slide-1',
    eyebrow: 'EXCLUSIVE HANDLOOMS',
    headline: 'Handwoven Kanjivaram & Tussar Sarees',
    subtext: 'Timeless drapes, pure zari temple borders, and festive palettes crafted with generational mastery for your most cherished moments.',
    buttonText: 'Explore Sarees',
    department: 'sarees',
    category: 'All',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=85',
    gradientClass: 'from-[#421016] via-[#240b0e] to-stone-950',
    accentBorder: 'border-amber-500/30 text-amber-300 bg-amber-950/60',
  },
  {
    id: 'slide-2',
    eyebrow: 'ARTISANAL TAILORING',
    headline: 'Block Printed & Zardozi Designer Blouses',
    subtext: 'Artisan hand-block Ajrakh prints, intricate zardozi embroidery, and ready-to-wear tailored cuts paired to perfection.',
    buttonText: 'Shop Blouses',
    department: 'blouses',
    category: 'All',
    imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1600&q=85',
    gradientClass: 'from-[#0d3829] via-[#092219] to-stone-950',
    accentBorder: 'border-amber-500/30 text-amber-300 bg-amber-950/60',
  },
  {
    id: 'slide-3',
    eyebrow: 'EFFORTLESS MODERN LUXURY',
    headline: 'Co-ord Sets & Pure Mulmul Lounge Wear',
    subtext: 'Breezy pure linen coordinates and feather-light mulmul silhouettes crafted for everyday grace, travel, and festive ease.',
    buttonText: 'Discover Co-ords',
    department: 'coords',
    category: 'All',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=85',
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
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-950 text-white shadow-xl mb-12 border border-stone-800"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background imagery with luxury gradient overlays */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] min-h-[380px] sm:min-h-[460px] w-full overflow-hidden">
        {SLIDES.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-all duration-1000 ease-out ${
              idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
          >
            {s.imageUrl ? (
              <>
                <img
                  src={s.imageUrl}
                  alt={s.headline}
                  className="w-full h-full object-cover object-center filter brightness-[0.68] transition-transform duration-1000 ease-out"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/50 to-transparent" />
              </>
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${s.gradientClass} relative overflow-hidden flex items-center`}>
                <div className="absolute -right-16 -top-16 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
                <div className="absolute right-1/4 -bottom-20 w-80 h-80 rounded-full bg-amber-500/5 blur-2xl pointer-events-none" />
              </div>
            )}
          </div>
        ))}

        {/* Ambient motif overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(217,119,6,0.12)_0%,transparent_60%)] pointer-events-none" />

        {/* Content Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 sm:p-12 lg:p-16 max-w-3xl">
          <div className="space-y-3 sm:space-y-4">
            <span className={`inline-flex items-center gap-1.5 text-[10px] sm:text-xs uppercase tracking-widest font-bold px-3.5 py-1.5 rounded-full border backdrop-blur-md shadow-sm ${slide.accentBorder}`}>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{slide.eyebrow}</span>
            </span>

            <h1 className="font-serif-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.12] drop-shadow-md">
              {slide.headline}
            </h1>

            <p className="text-xs sm:text-base text-stone-300 leading-relaxed max-w-xl font-normal drop-shadow-sm">
              {slide.subtext}
            </p>

            <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onSelectCategory(slide.department, slide.category)}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm px-7 py-3.5 rounded-full shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer uppercase tracking-wider"
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
          className="hidden sm:flex absolute left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-stone-900/70 hover:bg-stone-900 text-stone-200 hover:text-white items-center justify-center backdrop-blur-md border border-stone-700 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % SLIDES.length)}
          className="hidden sm:flex absolute right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-stone-900/70 hover:bg-stone-900 text-stone-200 hover:text-white items-center justify-center backdrop-blur-md border border-stone-700 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slide Indicators Dots */}
        <div className="absolute bottom-6 right-6 sm:right-12 z-20 flex items-center gap-2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentSlide ? 'w-8 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'w-2 bg-stone-600 hover:bg-stone-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
