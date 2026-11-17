import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { formatDualDate, formatNepalTime } from '../utils/date';
import { Globe2, Info, Mountain, Activity } from 'lucide-react';

interface HeaderHUDProps {
  onOpenAbout: () => void;
  quakeCount?: number;
  currentAltitude?: number;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({ 
  onOpenAbout, 
  quakeCount = 0,
}) => {
  const { language, toggleLanguage, t } = useTranslation();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dualDateStr = formatDualDate(currentTime, language);
  const timeStr = formatNepalTime(currentTime, language);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 p-2 sm:p-3 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Brand Badge */}
        <div className="glass-panel rounded-2xl px-3.5 py-2 flex items-center gap-2.5 pointer-events-auto border border-cyan-glow/20 shadow-glass">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-glow animate-ping absolute opacity-75"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-glow"></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mountain className="w-4 h-4 text-cyan-glow shrink-0 hidden xs:block" />
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>{language === 'ne' ? 'टेरानेप' : 'TerraNep'}</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-cyan-glow/15 text-cyan-glow border border-cyan-glow/30">
                3D
              </span>
            </h1>
          </div>
        </div>

        {/* Center: Live Nepal Time & Dual Date (hidden on ultra-small screens, visible on sm+) */}
        <div className="hidden md:flex glass-panel rounded-2xl px-4 py-2 items-center gap-3 pointer-events-auto border border-white/10 shadow-glass text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-cyan-glow font-medium">{t('hud.nepal_time')}:</span>
            <span className="font-mono font-semibold text-white tracking-wider">{timeStr}</span>
          </div>
          <div className="w-px h-3.5 bg-white/20"></div>
          <div className="text-slate-300 font-medium">
            {dualDateStr}
          </div>
          {quakeCount > 0 && (
            <>
              <div className="w-px h-3.5 bg-white/20"></div>
              <div className="flex items-center gap-1 text-orange-400 font-medium">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>{quakeCount} {t('hud.live_quakes')}</span>
              </div>
            </>
          )}
        </div>

        {/* Right: Controls & Toggles */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="glass-button rounded-xl px-3 py-2 flex items-center gap-1.5 text-xs font-semibold text-white shadow-glass active:scale-95"
            title="Toggle Language (नेपाली / English)"
            aria-label="Toggle Language"
          >
            <Globe2 className="w-3.5 h-3.5 text-cyan-glow" />
            <span>{language === 'ne' ? 'English' : 'नेपाली'}</span>
          </button>

          {/* About / Info */}
          <button
            onClick={onOpenAbout}
            className="glass-button rounded-xl p-2 text-slate-300 hover:text-white shadow-glass active:scale-95"
            title={t('about.title')}
            aria-label="About TerraNep"
          >
            <Info className="w-4 h-4 text-cyan-glow" />
          </button>
        </div>
      </div>

      {/* Mobile-only secondary HUD bar for Time */}
      <div className="md:hidden mt-1.5 flex justify-center pointer-events-auto">
        <div className="glass-panel-subtle rounded-xl px-3 py-1 flex items-center gap-2 text-[11px] text-slate-300 border border-white/10">
          <span className="font-mono text-cyan-glow font-semibold">{timeStr}</span>
          <span className="text-white/30">•</span>
          <span className="truncate max-w-[200px]">{dualDateStr}</span>
        </div>
      </div>
    </header>
  );
};
