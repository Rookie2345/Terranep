import React from 'react';
import { useTranslation } from '../context/LanguageContext';
import { toDevanagariNumerals } from '../utils/date';
import { X, Award, Navigation, Mountain, Landmark } from 'lucide-react';

export interface PlaceItem {
  id: string;
  name_en: string;
  name_ne: string;
  category: string;
  lat: number;
  lon: number;
  elevation: number;
  year_built: number | null;
  unesco: boolean;
  short_description_en: string;
  short_description_ne: string;
  long_description_en: string;
  long_description_ne: string;
  images: string[];
  tags: string[];
}

interface PlaceDetailModalProps {
  place: PlaceItem | null;
  onClose: () => void;
  onFlyTo: (place: PlaceItem) => void;
}

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({
  place,
  onClose,
  onFlyTo,
}) => {
  const { language, t } = useTranslation();

  if (!place) return null;

  const title = language === 'ne' ? place.name_ne : place.name_en;
  const subtitle = language === 'ne' ? place.name_en : place.name_ne;
  const shortDesc = language === 'ne' ? place.short_description_ne : place.short_description_en;
  const longDesc = language === 'ne' ? place.long_description_ne : place.long_description_en;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg glass-panel rounded-2xl overflow-hidden shadow-glass border border-cyan-glow/20 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Place Image Banner */}
        {place.images && place.images[0] && (
          <div className="relative w-full h-44 sm:h-52 overflow-hidden bg-navy-950">
            <img 
              src={place.images[0]} 
              alt={title} 
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-black/40" />
            
            {/* Close button */}
            <button 
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white/80 hover:text-white backdrop-blur-md transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* UNESCO & Category badges */}
            <div className="absolute bottom-3 left-4 flex flex-wrap items-center gap-1.5">
              {place.unesco && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/80 text-navy-950 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 backdrop-blur-md">
                  <Award className="w-3 h-3" />
                  UNESCO World Heritage
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-glow/20 text-cyan-glow border border-cyan-glow/30 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md">
                {place.category}
              </span>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {title}
            </h2>
            <div className="text-xs text-slate-400 mt-0.5">
              {subtitle} • {language === 'ne' ? toDevanagariNumerals(place.elevation) : place.elevation}m {t('hud.meters')}
            </div>
          </div>

          <p className="text-sm text-cyan-glow/90 font-medium leading-relaxed bg-navy-850/60 p-3 rounded-xl border border-cyan-glow/15">
            {shortDesc}
          </p>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {longDesc}
          </p>

          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
              <Mountain className="w-3.5 h-3.5 text-cyan-glow" />
              {place.lat.toFixed(4)}°N, {place.lon.toFixed(4)}°E
            </span>
            {place.year_built && (
              <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 ml-auto">
                <Landmark className="w-3.5 h-3.5 text-amber-400" />
                {place.year_built < 0 ? `${Math.abs(place.year_built)} BC` : `${place.year_built} AD`}
              </span>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-white/10 bg-navy-900/60 flex items-center justify-between">
          <button
            onClick={() => {
              onFlyTo(place);
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-cyan-glow text-navy-950 font-bold text-xs hover:bg-cyan-300 transition-colors shadow-glow-cyan flex items-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            <span>Fly to Location</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
          >
            {t('district.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
