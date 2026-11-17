import React, { useState, useCallback } from 'react';
import { LanguageProvider, useTranslation } from './context/LanguageContext';
import { HeaderHUD } from './components/HeaderHUD';
import { BottomDock } from './components/BottomDock';
import { AboutModal } from './components/AboutModal';
import { LayerSwitcher, type MapStyleMode } from './components/LayerSwitcher';
import { IntroOverlay } from './components/IntroOverlay';
import { Map3D } from './components/Map3D';
import { type QualityMode, GUIDED_TOUR_STOPS } from './config/mapConfig';

const MainShell: React.FC = () => {
  const { language } = useTranslation();
  
  // Modals & Panels
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isLayersOpen, setIsLayersOpen] = useState(false);

  // Map settings
  const [currentStyle, setCurrentStyle] = useState<MapStyleMode>('satellite');
  const [exaggeration, setExaggeration] = useState<number>(1.3);
  const [quality, setQuality] = useState<QualityMode>('high');
  const [is3D, setIs3D] = useState(true);
  const [currentAltitude, setCurrentAltitude] = useState<number>(1400);

  // Intro & Tour states
  const [isIntroPlaying, setIsIntroPlaying] = useState(true);
  const [isTouring, setIsTouring] = useState(false);
  const [currentTourStopIndex, setCurrentTourStopIndex] = useState(0);

  // Dismiss splash screen once map loads
  const handleMapLoaded = useCallback(() => {
    if (typeof (window as any).dismissSplash === 'function') {
      (window as any).dismissSplash();
    }
  }, []);

  const handleSkipIntro = useCallback(() => {
    (window as any).__terranep_map?.skipIntro();
    setIsIntroPlaying(false);
  }, []);

  const handleResetView = useCallback(() => {
    (window as any).__terranep_map?.resetView();
  }, []);

  const handleStartTour = useCallback(() => {
    if (isTouring) {
      setIsTouring(false);
    } else {
      setIsIntroPlaying(false);
      setCurrentTourStopIndex(0);
      setIsTouring(true);
    }
  }, [isTouring]);

  const handleStopTour = useCallback(() => {
    setIsTouring(false);
  }, []);

  const currentTourStop = GUIDED_TOUR_STOPS[currentTourStopIndex];
  const tourStopName = currentTourStop 
    ? (language === 'ne' ? currentTourStop.name_ne : currentTourStop.name_en)
    : undefined;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-navy-950 select-none">
      {/* 3D Map Engine */}
      <Map3D 
        currentStyle={currentStyle}
        exaggeration={exaggeration}
        quality={quality}
        is3D={is3D}
        onMapLoaded={handleMapLoaded}
        onAltitudeChange={setCurrentAltitude}
        isIntroPlaying={isIntroPlaying}
        onIntroEnd={() => setIsIntroPlaying(false)}
        isTouring={isTouring}
        onTourEnd={() => setIsTouring(false)}
        currentTourStopIndex={currentTourStopIndex}
        onTourStopChange={setCurrentTourStopIndex}
      />

      {/* Intro Skip & Active Tour Overlay */}
      <IntroOverlay 
        isIntroPlaying={isIntroPlaying}
        onSkipIntro={handleSkipIntro}
        isTouring={isTouring}
        tourStopName={tourStopName}
        onStopTour={handleStopTour}
      />

      {/* Top HUD Header */}
      <HeaderHUD 
        onOpenAbout={() => setIsAboutOpen(true)}
        quakeCount={0}
        currentAltitude={currentAltitude}
      />

      {/* Bottom Floating Control Dock */}
      <BottomDock 
        is3D={is3D}
        onToggle3D={() => setIs3D((prev) => !prev)}
        onResetView={handleResetView}
        onOpenLayers={() => setIsLayersOpen(true)}
        onStartTour={handleStartTour}
        onMyLocation={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                (window as any).__terranep_map?.flyToLocation(
                  [pos.coords.longitude, pos.coords.latitude], 
                  12
                );
              },
              () => {},
              { enableHighAccuracy: true }
            );
          }
        }}
        onToggleFullscreen={() => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
        }}
        isTouring={isTouring}
      />

      {/* Layer Switcher & Visual Controls Drawer */}
      <LayerSwitcher 
        isOpen={isLayersOpen}
        onClose={() => setIsLayersOpen(false)}
        currentStyle={currentStyle}
        onSelectStyle={setCurrentStyle}
        exaggeration={exaggeration}
        onChangeExaggeration={setExaggeration}
        quality={quality}
        onChangeQuality={setQuality}
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
