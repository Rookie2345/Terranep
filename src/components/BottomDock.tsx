import React from 'react';
import { useTranslation } from '../context/LanguageContext';
import { 
  Compass, 
  Layers, 
  RotateCcw, 
  Navigation, 
  Maximize, 
  Box,
  LocateFixed
} from 'lucide-react';

interface BottomDockProps {
  is3D?: boolean;
  onToggle3D?: () => void;
  onResetView?: () => void;
  onOpenLayers?: () => void;
  onStartTour?: () => void;
  onMyLocation?: () => void;
  onToggleFullscreen?: () => void;
  isTouring?: boolean;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  is3D = true,
  onToggle3D,
  onResetView,
  onOpenLayers,
  onStartTour,
  onMyLocation,
  onToggleFullscreen,
  isTouring = false,
}) => {
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-3 left-0 right-0 z-40 px-3 pointer-events-none flex flex-col items-center gap-2">
      {/* Primary Floating Action Dock */}
      <div className="glass-panel rounded-2xl p-1.5 flex items-center gap-1 sm:gap-2 pointer-events-auto border border-cyan-glow/20 shadow-glass">
        {/* 2D / 3D Toggle */}
        <button
          onClick={onToggle3D}
          className={`glass-button rounded-xl px-3 py-2 flex items-center gap-1.5 text-xs font-semibold ${
            is3D ? 'text-cyan-glow bg-cyan-glow/10 border-cyan-glow/40' : 'text-slate-300'
          }`}
          title={is3D ? t('controls.view_2d') : t('controls.view_3d')}
        >
          <Box className="w-4 h-4 text-cyan-glow" />
          <span>{is3D ? '3D' : '2D'}</span>
        </button>

        {/* Layers Drawer Button */}
        <button
          onClick={onOpenLayers}
          className="glass-button rounded-xl px-3 py-2 flex items-center gap-1.5 text-xs font-semibold text-white"
          title={t('layers.title')}
        >
          <Layers className="w-4 h-4 text-cyan-glow" />
          <span className="hidden xs:inline">{t('layers.title')}</span>
        </button>

        {/* Guided Tour Flythrough */}
        <button
          onClick={onStartTour}
          className={`glass-button rounded-xl px-3 py-2 flex items-center gap-1.5 text-xs font-semibold ${
            isTouring 
              ? 'bg-cyan-glow text-navy-950 font-bold shadow-glow-cyan' 
              : 'text-white bg-gradient-to-r from-cyan-glow/20 to-blue-500/20 border-cyan-glow/30'
          }`}
          title={t('controls.fly_tour')}
        >
          <Navigation className={`w-4 h-4 ${isTouring ? 'text-navy-950 fill-navy-950' : 'text-cyan-glow'}`} />
          <span className="hidden sm:inline">{t('controls.fly_tour')}</span>
        </button>

        <div className="w-px h-5 bg-white/15 my-auto hidden xs:block"></div>

        {/* Reset Camera View */}
        <button
          onClick={onResetView}
          className="glass-button rounded-xl p-2 text-slate-300 hover:text-white"
          title={t('controls.reset_view')}
          aria-label={t('controls.reset_view')}
        >
          <RotateCcw className="w-4 h-4 text-cyan-glow" />
        </button>

        {/* My Location */}
        <button
          onClick={onMyLocation}
          className="glass-button rounded-xl p-2 text-slate-300 hover:text-white"
          title={t('controls.my_location')}
          aria-label={t('controls.my_location')}
        >
          <LocateFixed className="w-4 h-4 text-cyan-glow" />
        </button>

        {/* Compass */}
        <button
          onClick={onResetView}
          className="glass-button rounded-xl p-2 text-slate-300 hover:text-white"
          title="Compass / North"
          aria-label="Compass"
        >
          <Compass className="w-4 h-4 text-cyan-glow" />
        </button>

        {/* Fullscreen */}
        <button
          onClick={onToggleFullscreen}
          className="glass-button rounded-xl p-2 text-slate-300 hover:text-white hidden sm:flex"
          title={t('controls.fullscreen')}
          aria-label={t('controls.fullscreen')}
        >
          <Maximize className="w-4 h-4 text-cyan-glow" />
        </button>
      </div>
    </div>
  );
};
