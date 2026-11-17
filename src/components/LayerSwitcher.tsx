import React from 'react';
import { useTranslation } from '../context/LanguageContext';
import type { QualityMode } from '../config/mapConfig';
import { 
  X, 
  Satellite, 
  Mountain, 
  Moon, 
  Sliders, 
  BatteryMedium, 
  Zap, 
  Layers as LayersIcon 
} from 'lucide-react';

export type MapStyleMode = 'satellite' | 'terrain' | 'dark';

interface LayerSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  currentStyle: MapStyleMode;
  onSelectStyle: (style: MapStyleMode) => void;
  exaggeration: number;
  onChangeExaggeration: (val: number) => void;
  quality: QualityMode;
  onChangeQuality: (q: QualityMode) => void;
}

export const LayerSwitcher: React.FC<LayerSwitcherProps> = ({
  isOpen,
  onClose,
  currentStyle,
  onSelectStyle,
  exaggeration,
  onChangeExaggeration,
  quality,
  onChangeQuality,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md glass-panel rounded-2xl p-5 shadow-glass border border-cyan-glow/20 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <LayersIcon className="w-4 h-4 text-cyan-glow" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              {t('layers.title')}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Style Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">
            {t('layers.map_style')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {/* Satellite */}
            <button
              onClick={() => onSelectStyle('satellite')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-medium transition-all ${
                currentStyle === 'satellite'
                  ? 'bg-cyan-glow/15 border-cyan-glow text-cyan-glow shadow-glow-cyan'
                  : 'bg-navy-850/60 border-white/10 text-slate-300 hover:bg-white/5'
              }`}
            >
              <Satellite className="w-5 h-5" />
              <span>{t('layers.satellite')}</span>
            </button>

            {/* 3D Terrain */}
            <button
              onClick={() => onSelectStyle('terrain')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-medium transition-all ${
                currentStyle === 'terrain'
                  ? 'bg-cyan-glow/15 border-cyan-glow text-cyan-glow shadow-glow-cyan'
                  : 'bg-navy-850/60 border-white/10 text-slate-300 hover:bg-white/5'
              }`}
            >
              <Mountain className="w-5 h-5" />
              <span>{t('layers.terrain')}</span>
            </button>

            {/* Cinematic Dark */}
            <button
              onClick={() => onSelectStyle('dark')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-medium transition-all ${
                currentStyle === 'dark'
                  ? 'bg-cyan-glow/15 border-cyan-glow text-cyan-glow shadow-glow-cyan'
                  : 'bg-navy-850/60 border-white/10 text-slate-300 hover:bg-white/5'
              }`}
            >
              <Moon className="w-5 h-5" />
              <span>{t('layers.dark')}</span>
            </button>
          </div>
        </div>

        {/* Terrain Exaggeration Slider */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-glow" />
              {t('controls.exaggeration')}
            </span>
            <span className="font-mono text-cyan-glow px-2 py-0.5 rounded bg-cyan-glow/10">
              {exaggeration.toFixed(1)}x
            </span>
          </div>
          <input
            type="range"
            min="1.0"
            max="2.0"
            step="0.1"
            value={exaggeration}
            onChange={(e) => onChangeExaggeration(parseFloat(e.target.value))}
            className="w-full accent-cyan-glow bg-navy-950 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>1.0x (Realistic)</span>
            <span>1.5x (Dramatic)</span>
            <span>2.0x (Peak)</span>
          </div>
        </div>

        {/* Performance & Quality Mode */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            {t('controls.quality')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['high', 'balanced', 'low-power'] as QualityMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => onChangeQuality(mode)}
                className={`py-2 px-2.5 rounded-xl border text-[11px] font-medium capitalize transition-all ${
                  quality === mode
                    ? 'bg-cyan-glow/15 border-cyan-glow text-cyan-glow font-semibold'
                    : 'bg-navy-850/60 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {mode === 'low-power' ? (
                  <span className="flex items-center justify-center gap-1">
                    <BatteryMedium className="w-3 h-3 text-emerald-400" />
                    Low-Power
                  </span>
                ) : mode}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            {quality === 'low-power' 
              ? 'Optimized for budget Android phones: reduces pitch, fog & tile memory.' 
              : 'Full 3D rendering with atmospheric sky, distance fog and 85° pitch.'}
          </p>
        </div>
      </div>
    </div>
  );
};
