import React from 'react';
import { useTranslation } from '../context/LanguageContext';
import { FastForward, Navigation } from 'lucide-react';

interface IntroOverlayProps {
  isIntroPlaying: boolean;
  onSkipIntro: () => void;
  tourStopName?: string;
  isTouring?: boolean;
  onStopTour?: () => void;
}

export const IntroOverlay: React.FC<IntroOverlayProps> = ({
  isIntroPlaying,
  onSkipIntro,
  tourStopName,
  isTouring,
  onStopTour,
}) => {
  const { t } = useTranslation();

  if (!isIntroPlaying && !isTouring) return null;

  return (
    <div className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
      <div className="flex flex-col items-center gap-2 pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300">
        {isIntroPlaying && (
          <button
            onClick={onSkipIntro}
            className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 text-xs font-semibold text-cyan-glow border border-cyan-glow/40 shadow-glow-cyan hover:bg-cyan-glow/20 active:scale-95 transition-all"
          >
            <FastForward className="w-4 h-4 text-cyan-glow animate-pulse" />
            <span>{t('skip_intro')}</span>
          </button>
        )}

        {isTouring && tourStopName && (
          <div className="glass-panel px-5 py-2.5 rounded-2xl flex items-center gap-3 border border-cyan-glow/30 shadow-glass">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-cyan-glow animate-spin" style={{ animationDuration: '3s' }} />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-cyan-glow font-bold">
                  Guided Tour • नेपाल भ्रमण
                </div>
                <div className="text-sm font-bold text-white tracking-wide">
                  {tourStopName}
                </div>
              </div>
            </div>
            <button
              onClick={onStopTour}
              className="ml-2 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Stop
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
