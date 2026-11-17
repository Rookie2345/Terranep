import React, { useState } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { toDevanagariNumerals } from '../utils/date';
import { X, CloudSun, Wind, Droplets, Navigation, Mountain } from 'lucide-react';
import type { StationLiveMetrics } from '../services/weatherService';

interface WeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
  stationsMetrics: Record<string, StationLiveMetrics>;
  onFlyToStation: (lat: number, lon: number) => void;
}

export const WeatherModal: React.FC<WeatherModalProps> = ({
  isOpen,
  onClose,
  stationsMetrics,
  onFlyToStation,
}) => {
  const { language, t } = useTranslation();
  const [filter, setFilter] = useState<'all' | 'mountains' | 'cities'>('all');

  if (!isOpen) return null;

  const stationList = Object.values(stationsMetrics).filter((m) => {
    if (filter === 'mountains') return m.station.isMountain;
    if (filter === 'cities') return !m.station.isMountain;
    return true;
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl glass-panel rounded-2xl p-5 shadow-glass border border-cyan-glow/20 max-h-[88vh] flex flex-col space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                {t('weather.title')} & {t('air_quality.title')}
              </h2>
              <p className="text-xs text-slate-400">
                Live Data from Open-Meteo • 15 Nepal Stations
              </p>
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

        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-cyan-glow text-navy-950 font-bold shadow-glow-cyan'
                : 'bg-navy-850/60 text-slate-300 hover:bg-white/5'
            }`}
          >
            All Stations ({Object.keys(stationsMetrics).length})
          </button>
          <button
            onClick={() => setFilter('mountains')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
              filter === 'mountains'
                ? 'bg-cyan-glow text-navy-950 font-bold shadow-glow-cyan'
                : 'bg-navy-850/60 text-slate-300 hover:bg-white/5'
            }`}
          >
            <Mountain className="w-3.5 h-3.5" />
            <span>Himalayas / Base Camps</span>
          </button>
          <button
            onClick={() => setFilter('cities')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'cities'
                ? 'bg-cyan-glow text-navy-950 font-bold shadow-glow-cyan'
                : 'bg-navy-850/60 text-slate-300 hover:bg-white/5'
            }`}
          >
            Major Cities
          </button>
        </div>

        {/* Stations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1 flex-1">
          {stationList.map((metric) => {
            const name = language === 'ne' ? metric.station.name_ne : metric.station.name_en;
            const altName = language === 'ne' ? metric.station.name_en : metric.station.name_ne;
            const condition = language === 'ne' ? metric.condition_ne : metric.condition_en;
            const aqiCategory = language === 'ne' ? metric.aqiCategory_ne : metric.aqiCategory_en;

            return (
              <div 
                key={metric.station.id}
                className="bg-navy-850/70 hover:bg-navy-850 rounded-xl p-3.5 border border-white/5 hover:border-cyan-glow/30 transition-all flex flex-col justify-between space-y-2 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-white text-sm group-hover:text-cyan-glow transition-colors">
                      {name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {altName} • {metric.station.elevation}m
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-white">
                      {language === 'ne' ? toDevanagariNumerals(metric.temperature) : metric.temperature}°C
                    </span>
                    <div className="text-[11px] text-cyan-glow/90 font-medium">
                      {condition}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5 text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Wind className="w-3 h-3 text-slate-400" />
                      {metric.windSpeed} km/h
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Droplets className="w-3 h-3 text-cyan-glow" />
                      {metric.humidity}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span 
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{ 
                        backgroundColor: `${metric.aqiColor}20`, 
                        color: metric.aqiColor 
                      }}
                      title={`US AQI: ${metric.aqi}`}
                    >
                      AQI {metric.aqi} • {aqiCategory}
                    </span>
                    <button
                      onClick={() => {
                        onFlyToStation(metric.station.lat, metric.station.lon);
                        onClose();
                      }}
                      className="p-1 rounded-lg hover:bg-cyan-glow/20 text-cyan-glow transition-colors"
                      title="Fly here"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
