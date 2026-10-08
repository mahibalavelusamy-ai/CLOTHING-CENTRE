import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
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
}

const SLIDES: Slide[] = [
  {
    id: 'slide-1',
    eyebrow: 'AUTUMN / WINTER EDIT',
    headline: 'Curated Elegance & Modern Silhouettes.',
    subtext: 'Discover breathable combed cottons, breezy tiered linens, and effortless everyday essentials.',
    buttonText: "Explore Women's Apparel",
    department: 'women',
    category: 'All',
    imageUrl: 'https://picsum.photos/seed/luxury-hero-editorial-1/1600/900',
  },
  {
    id: 'slide-2',
    eyebrow: "TIMELESS MEN'S TAILORING",
    headline: 'Crisp Oxford Weaves & Stretch Chinos.',
    subtext: 'Structured button-downs and smart flat-front trousers designed for boardroom to weekend comfort.',
    buttonText: "Shop Men's Essentials",
    department: 'men',
    category: 'Shirts',
    imageUrl: 'https://picsum.photos/seed/luxury-hero-editorial-2/1600/900',
  },
  {
    id: 'slide-3',
    eyebrow: 'FESTIVE & TRADITIONAL BESPOKE',
    headline: 'Handloom Kurtas & Heritage Ensembles.',
    subtext: 'Authentic artisan block prints, pure slub cotton sets, and rich palettes crafted for celebrations.',
    buttonText: 'Discover Ethnic Sets',
    department: 'ethnic',
    category: 'Kurtas & Sets',
    imageUrl: 'https://picsum.photos/seed/luxury-hero-editorial-3/1600/900',
  },
];

export const HeroSlideshow: React.FC<HeroSlideshowProps> = ({ onSelectCategory }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const slide = SLIDES[currentSlide];

  return (
    <div 
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-950 text-white shadow-xl mb-12"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background imagery with luxury gradient overlays */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] min-h-[380px] sm:min-h-[460px] w-full overflow-hidden">
        {SLIDES.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
              idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
          >
            <img
              src={s.imageUrl}
              alt={s.headline}
              className="w-full h-full object-cover object-center filter brightness-65 transition-transform duration-1000 ease-out"
              loading="lazy"
            />
            {/* Dual gradient scrim for pristine contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-950/40 to-transparent" />
          </div>
        ))}

        {/* Content Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 sm:p-12 lg:p-16 max-w-3xl">
          <div className="space-y-3 sm:space-y-4">
            <span className="inline-block text-[10px] sm:text-xs uppercase tracking-widest font-semibold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full">
              {slide.eyebrow}
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
