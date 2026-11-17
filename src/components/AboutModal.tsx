import React from 'react';
import { useTranslation } from '../context/LanguageContext';
import { X, ShieldCheck, Mountain, Satellite, Activity, CloudSun } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg glass-panel rounded-2xl p-6 shadow-glass border border-cyan-glow/20 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-glow/10 border border-cyan-glow/30 flex items-center justify-center text-cyan-glow">
              <Mountain className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">{t('about.title')}</h2>
              <p className="text-xs text-cyan-glow/80 font-mono">v1.0 • Nepal 3D Living Terrain</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-sm text-slate-300">
          <p className="leading-relaxed">
            {t('about.description')}
          </p>

          <div className="p-3 rounded-xl bg-navy-850/80 border border-white/5 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-glow flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t('about.data_sources')}
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <Mountain className="w-3.5 h-3.5 text-cyan-glow shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-white">{t('about.attribution_aws')}</span>
                  <div className="text-slate-400">AWS Open Data (Public & Keyless)</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Satellite className="w-3.5 h-3.5 text-cyan-glow shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-white">{t('about.attribution_eox')}</span>
                  <div className="text-slate-400">CC BY 4.0 EOX IT Services GmbH</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Activity className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-white">{t('about.attribution_usgs')}</span>
                  <div className="text-slate-400">Public USGS GeoJSON API (Updated every 5m)</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CloudSun className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-white">{t('about.attribution_meteo')}</span>
                  <div className="text-slate-400">Open-Meteo Public Weather & AQI APIs</div>
                </div>
              </li>
            </ul>
          </div>

          <div className="text-xs text-slate-400 bg-navy-950/60 p-3 rounded-xl border border-white/5">
            💡 {t('about.offline_ready')}
          </div>
        </div>

        <div className="pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-glow text-navy-950 font-semibold text-xs hover:bg-cyan-300 transition-colors shadow-glow-cyan"
          >
            {t('about.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
