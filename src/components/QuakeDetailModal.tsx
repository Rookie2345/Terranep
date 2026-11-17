import React from 'react';
import { useTranslation } from '../context/LanguageContext';
import { formatDualDate, formatNepalTime, toDevanagariNumerals } from '../utils/date';
import { X, Activity, ExternalLink, Navigation } from 'lucide-react';
import type { EarthquakeFeature } from '../services/earthquakeService';
import { getQuakeColor } from '../services/earthquakeService';

interface QuakeDetailModalProps {
  quake: EarthquakeFeature | null;
  onClose: () => void;
  onFlyTo?: (coordinates: [number, number]) => void;
}

export const QuakeDetailModal: React.FC<QuakeDetailModalProps> = ({
  quake,
  onClose,
  onFlyTo,
}) => {
  const { language, t } = useTranslation();

  if (!quake) return null;

  const dateObj = new Date(quake.time);
  const dualDate = formatDualDate(dateObj, language);
  const nepalTime = formatNepalTime(dateObj, language);
  const color = getQuakeColor(quake.magnitude);

  return (
    <div className="fixed bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-sm pointer-events-none animate-in fade-in slide-in-from-bottom-6 duration-300">
      <div 
        className="glass-panel rounded-2xl p-5 shadow-glass border pointer-events-auto space-y-4"
        style={{ borderColor: `${color}40` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-extrabold text-navy-950 shadow-lg shrink-0"
              style={{ backgroundColor: color }}
            >
              <span className="text-[10px] font-bold tracking-tighter leading-none opacity-80">MAG</span>
              <span className="text-base leading-none mt-0.5">
                {language === 'ne' ? toDevanagariNumerals(quake.magnitude.toFixed(1)) : quake.magnitude.toFixed(1)}
              </span>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1">
                <Activity className="w-3 h-3 animate-pulse" />
                {t('quakes.title')}
              </div>
              <h3 className="text-sm font-bold text-white leading-tight mt-0.5">
                {quake.place}
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Depth & Coordinates */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-navy-850/80 p-2.5 rounded-xl border border-white/5">
            <div className="text-[10px] text-slate-400">{t('quakes.depth')}</div>
            <div className="font-semibold text-white mt-0.5">
              {language === 'ne' ? toDevanagariNumerals(quake.depth.toFixed(1)) : quake.depth.toFixed(1)} km
            </div>
          </div>
          <div className="bg-navy-850/80 p-2.5 rounded-xl border border-white/5">
            <div className="text-[10px] text-slate-400">Coordinates</div>
            <div className="font-semibold text-white mt-0.5 font-mono text-[11px]">
              {quake.coordinates[1].toFixed(2)}°N, {quake.coordinates[0].toFixed(2)}°E
            </div>
          </div>
        </div>

        {/* Date & Nepal Time */}
        <div className="bg-navy-950/60 p-3 rounded-xl border border-white/5 space-y-1 text-xs">
          <div className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">
            {t('quakes.time')} (Nepal Time UTC+5:45)
          </div>
          <div className="font-semibold text-white">
            {nepalTime}
          </div>
          <div className="text-slate-300 text-[11px]">
            {dualDate}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          {quake.url && (
            <a
              href={quake.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyan-glow hover:underline flex items-center gap-1 font-medium"
            >
              <span>USGS Report</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {onFlyTo && (
            <button
              onClick={() => {
                onFlyTo(quake.coordinates);
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-300 hover:bg-orange-500 hover:text-navy-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-glow-orange"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Center Quake</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
