import React from 'react';
import { useTranslation } from '../context/LanguageContext';
import type { QualityMode } from '../config/mapConfig';
import type { QuakeTimeFilter } from '../services/earthquakeService';
import { 
  X, 
  Satellite, 
  Mountain, 
  Moon, 
  Sliders, 
  BatteryMedium, 
  Zap, 
  Layers as LayersIcon,
  Activity,
  CloudSun,
  MapPin,
  Map as MapIcon
} from 'lucide-react';

export type MapStyleMode = 'satellite' | 'terrain' | 'dark';

export interface ActiveLayersConfig {
  earthquakes: boolean;
  weather: boolean;
  districts: boolean;
  places: boolean;
}

interface LayerSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  currentStyle: MapStyleMode;
  onSelectStyle: (style: MapStyleMode) => void;
  exaggeration: number;
  onChangeExaggeration: (val: number) => void;
  quality: QualityMode;
  onChangeQuality: (q: QualityMode) => void;
  activeLayers: ActiveLayersConfig;
  onToggleLayer: (key: keyof ActiveLayersConfig) => void;
  quakeFilter: QuakeTimeFilter;
  onChangeQuakeFilter: (f: QuakeTimeFilter) => void;
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
  activeLayers,
  onToggleLayer,
  quakeFilter,
  onChangeQuakeFilter,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md glass-panel rounded-2xl p-5 shadow-glass border border-cyan-glow/20 space-y-4 max-h-[90vh] overflow-y-auto"
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

        {/* Live Data Layer Toggles */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <label className="text-xs font-semibold text-slate-300">
            Live Layers & Overlays
          </label>
          <div className="grid grid-cols-2 gap-2">
            {/* Earthquakes */}
            <button
              onClick={() => onToggleLayer('earthquakes')}
              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-medium transition-all ${
                activeLayers.earthquakes
                  ? 'bg-orange-500/15 border-orange-500/40 text-orange-300'
                  : 'bg-navy-850/60 border-white/10 text-slate-400'
              }`}
            >
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-400" />
                <span>{t('layers.earthquakes')}</span>
              </span>
              <span className={`w-2 h-2 rounded-full ${activeLayers.earthquakes ? 'bg-orange-400' : 'bg-slate-600'}`} />
            </button>

            {/* Weather */}
            <button
              onClick={() => onToggleLayer('weather')}
              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-medium transition-all ${
                activeLayers.weather
                  ? 'bg-amber-400/15 border-amber-400/40 text-amber-300'
                  : 'bg-navy-850/60 border-white/10 text-slate-400'
              }`}
            >
              <span className="flex items-center gap-2">
                <CloudSun className="w-4 h-4 text-amber-300" />
                <span>{t('layers.weather')}</span>
              </span>
              <span className={`w-2 h-2 rounded-full ${activeLayers.weather ? 'bg-amber-300' : 'bg-slate-600'}`} />
            </button>

            {/* Districts */}
            <button
              onClick={() => onToggleLayer('districts')}
              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-medium transition-all ${
                activeLayers.districts
                  ? 'bg-cyan-glow/15 border-cyan-glow/40 text-cyan-glow'
                  : 'bg-navy-850/60 border-white/10 text-slate-400'
              }`}
            >
              <span className="flex items-center gap-2">
                <MapIcon className="w-4 h-4 text-cyan-glow" />
                <span>{t('layers.districts')}</span>
              </span>
              <span className={`w-2 h-2 rounded-full ${activeLayers.districts ? 'bg-cyan-glow' : 'bg-slate-600'}`} />
            </button>

            {/* Places */}
            <button
              onClick={() => onToggleLayer('places')}
              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-medium transition-all ${
                activeLayers.places
                  ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                  : 'bg-navy-850/60 border-white/10 text-slate-400'
              }`}
            >
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span>{t('layers.places')}</span>
              </span>
              <span className={`w-2 h-2 rounded-full ${activeLayers.places ? 'bg-purple-400' : 'bg-slate-600'}`} />
            </button>
          </div>

          {/* Quake Time Filter (if quakes active) */}
          {activeLayers.earthquakes && (
            <div className="pt-1.5 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">Quake Window:</span>
              <div className="flex gap-1.5">
                {(['24h', '7d', '30d'] as QuakeTimeFilter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => onChangeQuakeFilter(f)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                      quakeFilter === f
                        ? 'bg-orange-500 text-navy-950 font-bold'
                        : 'bg-navy-850 text-slate-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}
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
            <span>1.0x (Natural)</span>
            <span>1.3x (Cinematic)</span>
            <span>2.0x (Dramatized)</span>
          </div>
        </div>

        {/* Quality Mode */}
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
        </div>
      </div>
    </div>
  );
};
