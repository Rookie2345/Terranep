import React from 'react';
import { useTranslation } from '../context/LanguageContext';
import { toDevanagariNumerals } from '../utils/date';
import { X, MapPin, CloudSun, Wind, Activity, Navigation } from 'lucide-react';
import type { StationLiveMetrics } from '../services/weatherService';

export interface DistrictInfo {
  id: number;
  name_en: string;
  name_ne: string;
  province_id: number;
  province_en: string;
  province_ne: string;
}

interface DistrictSheetProps {
  district: DistrictInfo | null;
  onClose: () => void;
  weather?: StationLiveMetrics;
  quakeCount?: number;
  onFlyTo?: () => void;
}

export const DistrictSheet: React.FC<DistrictSheetProps> = ({
  district,
  onClose,
  weather,
  quakeCount = 0,
  onFlyTo,
}) => {
  const { language, t } = useTranslation();

  if (!district) return null;

  const distName = language === 'ne' ? district.name_ne : district.name_en;
  const provName = language === 'ne' ? district.province_ne : district.province_en;

  return (
    <div className="fixed bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-md pointer-events-none animate-in fade-in slide-in-from-bottom-6 duration-300">
      <div 
        className="glass-panel rounded-2xl p-4 sm:p-5 shadow-glass border border-cyan-glow/30 pointer-events-auto space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-glow/15 border border-cyan-glow/40 flex items-center justify-center text-cyan-glow shadow-glow-cyan">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold tracking-wider uppercase text-cyan-glow">
                {t('district.province')}: {provName}
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>{distName}</span>
                <span className="text-xs text-slate-400 font-normal">
                  ({language === 'ne' ? district.name_en : district.name_ne})
                </span>
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Regional Metrics */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Weather */}
          <div className="bg-navy-850/80 rounded-xl p-3 border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <CloudSun className="w-3.5 h-3.5 text-amber-300" />
                {t('weather.title')}
              </span>
              <span className="font-bold text-white text-sm">
                {weather ? `${language === 'ne' ? toDevanagariNumerals(weather.temperature) : weather.temperature}°C` : '--'}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 truncate">
              {weather ? (language === 'ne' ? weather.condition_ne : weather.condition_en) : 'सामान्य'}
            </div>
          </div>

          {/* Air Quality AQI */}
          <div className="bg-navy-850/80 rounded-xl p-3 border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-cyan-glow" />
                AQI
              </span>
              <span 
                className="font-bold text-xs px-1.5 py-0.5 rounded"
                style={{ 
                  backgroundColor: weather ? `${weather.aqiColor}25` : '#10B98125', 
                  color: weather?.aqiColor || '#10B981' 
                }}
              >
                {weather ? (language === 'ne' ? toDevanagariNumerals(weather.aqi) : weather.aqi) : '50'}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 truncate">
              {weather ? (language === 'ne' ? weather.aqiCategory_ne : weather.aqiCategory_en) : t('aqi.good')}
            </div>
          </div>
        </div>

        {/* Recent Earthquakes status */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-navy-950/60 border border-white/5 text-xs">
          <span className="text-slate-300 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-orange-400" />
            {t('quakes.filter_all')}:
          </span>
          <span className="font-semibold text-white">
            {quakeCount > 0 
              ? `${language === 'ne' ? toDevanagariNumerals(quakeCount) : quakeCount} ${t('hud.live_quakes')}`
              : (language === 'ne' ? 'कुनै भूकम्प छैन' : 'No recorded quakes')}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-1">
          {onFlyTo && (
            <button
              onClick={onFlyTo}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-glow/20 border border-cyan-glow/40 text-cyan-glow hover:bg-cyan-glow hover:text-navy-950 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-glow-cyan"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Zoom District</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold transition-colors"
          >
            {t('district.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
