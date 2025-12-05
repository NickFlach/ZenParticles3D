
import React, { useState, useCallback } from 'react';
import Scene from './components/Scene';
import HandTracker from './components/HandTracker';
import { ParticleShape, INITIAL_COLOR } from './constants';
import { Settings2, Hand, Palette, Box } from 'lucide-react';
import { clsx } from 'clsx';

const App: React.FC = () => {
  const [activeShape, setActiveShape] = useState<ParticleShape>(ParticleShape.Heart);
  const [activeColor, setActiveColor] = useState<string>(INITIAL_COLOR);
  const [handOpenness, setHandOpenness] = useState<number>(0);
  const [cameraReady, setCameraReady] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);

  // Smooth smoothing for the UI display value of openness (optional, visualization only)
  // The actual 3D scene uses the raw value usually, but we passed raw to Scene
  
  const handleHandUpdate = useCallback((val: number) => {
    // MediaPipe runs outside React render cycle often, 
    // but useState is fine here as it triggers the re-render needed for the 3D scene props.
    // For extreme performance, we'd use a ref and useFrame inside the canvas, 
    // but for this complexity, state is sufficient and cleaner.
    setHandOpenness(val);
  }, []);

  return (
    <div className="relative w-full h-screen text-white font-sans selection:bg-blue-500 selection:text-white">
      
      {/* 3D Scene Background */}
      <Scene 
        shape={activeShape} 
        color={activeColor} 
        handOpenness={handOpenness}
      />

      {/* Hand Tracker (Invisible/Preview only) */}
      <HandTracker onHandUpdate={handleHandUpdate} onCameraReady={setCameraReady} />

      {/* UI Overlay */}
      <div className={clsx(
        "absolute top-0 right-0 h-full w-80 bg-black/40 backdrop-blur-md border-l border-white/10 transition-transform duration-500 ease-out z-40 overflow-y-auto",
        showControls ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="p-6 space-y-8">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              ZenParticles
            </h1>
          </div>

          {/* Status Panel */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center space-x-2 mb-2 text-sm font-medium text-gray-300">
              <Hand size={16} />
              <span>Gesture Control</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Closed</span>
              <span>Open</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-100"
                style={{ width: `${handOpenness * 100}%` }}
              />
            </div>
            {!cameraReady && (
              <p className="text-xs text-yellow-500 mt-2 animate-pulse">
                Initializing Camera...
              </p>
            )}
            {cameraReady && (
              <p className="text-xs text-green-400 mt-2">
                Camera Active • {Math.round(handOpenness * 100)}% Expansion
              </p>
            )}
          </div>

          {/* Shape Selector */}
          <div>
            <div className="flex items-center space-x-2 mb-4 text-sm font-medium text-blue-300 uppercase tracking-wider">
              <Box size={14} />
              <span>Shape Geometry</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(ParticleShape).map((shape) => (
                <button
                  key={shape}
                  onClick={() => setActiveShape(shape)}
                  className={clsx(
                    "px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border",
                    activeShape === shape
                      ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                      : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20"
                  )}
                >
                  {shape}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <div className="flex items-center space-x-2 mb-4 text-sm font-medium text-yellow-300 uppercase tracking-wider">
              <Palette size={14} />
              <span>Energy Color</span>
            </div>
            <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                <input 
                type="color" 
                value={activeColor}
                onChange={(e) => setActiveColor(e.target.value)}
                className="w-full h-10 rounded cursor-pointer bg-transparent border-0 p-0"
                />
            </div>
          </div>

        </div>
      </div>

      {/* Toggle Controls Button */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white hover:bg-white/20 transition-all"
      >
        <Settings2 size={20} />
      </button>

      {/* Intro / Instruction Overlay (disappears once camera is ready or clicked) */}
      {!cameraReady && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm">
           <div className="text-center max-w-md p-8 border border-white/10 rounded-2xl bg-black/50">
             <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-400">
               <Hand size={32} />
             </div>
             <h2 className="text-3xl font-bold mb-4">Welcome to ZenParticles</h2>
             <p className="text-gray-400 mb-6">
               Please allow camera access to begin. 
               <br/><br/>
               Control the cosmic dust with your hands. 
               Open your hand to <span className="text-white font-bold">expand</span> the universe. 
               Close it to <span className="text-white font-bold">condense</span> energy.
             </p>
             <div className="flex justify-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{animationDelay: '0ms'}}/>
                <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{animationDelay: '150ms'}}/>
                <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{animationDelay: '300ms'}}/>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
