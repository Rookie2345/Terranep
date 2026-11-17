import React, { useState, useEffect } from 'react';
import { LanguageProvider, useTranslation } from './context/LanguageContext';
import { HeaderHUD } from './components/HeaderHUD';
import { BottomDock } from './components/BottomDock';
import { AboutModal } from './components/AboutModal';
import { Mountain, Compass, Sparkles } from 'lucide-react';

const MainShell: React.FC = () => {
  const { t, language } = useTranslation();
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [is3D, setIs3D] = useState(true);

  // Dismiss instant splash screen once React shell mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof (window as any).dismissSplash === 'function') {
        (window as any).dismissSplash();
      }
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-navy-900 select-none">
      {/* Dynamic Background Preview (Map Canvas will be mounted here in Phase 2) */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-navy-800 via-navy-900 to-navy-950 flex flex-col items-center justify-center p-6 text-center">
        {/* Subtle grid and mountain horizon backdrop */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#3DD6F5 1px, transparent 1px), radial-gradient(#3DD6F5 1px, #0B1220 1px)`,
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px',
          }}
        />

        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-glow/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-md mx-auto space-y-4 animate-in fade-in zoom-in-95 duration-500">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-glow/10 border border-cyan-glow/30 text-cyan-glow text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Phase 1 Verified • Ready for 3D Map</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {language === 'ne' ? 'टेरानेप' : 'TerraNep'}
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            {t('tagline')}
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-2">
            <span className="glass-panel-subtle px-3 py-1.5 rounded-xl text-xs text-cyan-glow border border-cyan-glow/20 flex items-center gap-1.5">
              <Mountain className="w-3.5 h-3.5" />
              AWS Terrarium DEM
            </span>
            <span className="glass-panel-subtle px-3 py-1.5 rounded-xl text-xs text-cyan-glow border border-cyan-glow/20 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              Sentinel-2 Cloudless
            </span>
            <span className="glass-panel-subtle px-3 py-1.5 rounded-xl text-xs text-orange-400 border border-orange-500/20">
              USGS Live Quakes
            </span>
          </div>
        </div>
      </div>

      {/* Top HUD Header */}
      <HeaderHUD 
        onOpenAbout={() => setIsAboutOpen(true)}
        quakeCount={0}
      />

      {/* Bottom Floating Control Dock */}
      <BottomDock 
        is3D={is3D}
        onToggle3D={() => setIs3D(!is3D)}
        onResetView={() => {}}
        onOpenLayers={() => {}}
        onStartTour={() => {}}
        onToggleFullscreen={() => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
        }}
      />

      {/* About & License Modal */}
      <AboutModal 
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <MainShell />
    </LanguageProvider>
  );
}

export default App;
