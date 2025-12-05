import React, { useEffect, useRef, useState } from 'react';
import * as cameraUtils from '@mediapipe/camera_utils';
import * as handsLib from '@mediapipe/hands';

// Handle potentially different export structures (Named vs Default) from CDN
const CameraModule = cameraUtils as any;
const HandsModule = handsLib as any;
const Camera = CameraModule.Camera || CameraModule.default?.Camera;
const Hands = HandsModule.Hands || HandsModule.default?.Hands;

interface HandTrackerProps {
  onHandUpdate: (openness: number) => void;
  onCameraReady: (ready: boolean) => void;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onHandUpdate, onCameraReady }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    
    if (!Hands || !Camera) {
        setError("Failed to load computer vision libraries.");
        console.error("MediaPipe libraries not loaded correctly", { Camera, Hands });
        return;
    }

    const hands = new Hands({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    // Use 'any' for results to avoid import type errors if types aren't exported
    hands.onResults((results: any) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        // Analyze the first detected hand
        const landmarks = results.multiHandLandmarks[0];
        
        // Calculate "openness" based on distance of finger tips from wrist (landmark 0)
        // Tips: 4 (Thumb), 8 (Index), 12 (Middle), 16 (Ring), 20 (Pinky)
        // Wrist: 0
        
        const wrist = landmarks[0];
        const tips = [landmarks[4], landmarks[8], landmarks[12], landmarks[16], landmarks[20]];
        
        let totalDist = 0;
        tips.forEach((tip: any) => {
           const dist = Math.sqrt(
             Math.pow(tip.x - wrist.x, 2) + 
             Math.pow(tip.y - wrist.y, 2) + 
             Math.pow(tip.z - wrist.z, 2) // Z is relative depth
           );
           totalDist += dist;
        });

        const avgDist = totalDist / 5;
        
        // Normalize: 
        // ~0.2 is a closed fist
        // ~0.5+ is an open hand
        // We map this to 0..1 range
        const minVal = 0.15;
        const maxVal = 0.55;
        const normalized = Math.min(Math.max((avgDist - minVal) / (maxVal - minVal), 0), 1);
        
        onHandUpdate(normalized);
      } else {
        // No hand detected
      }
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          try {
            await hands.send({ image: videoRef.current });
          } catch (e) {
            console.error("MediaPipe error:", e);
          }
        }
      },
      width: 640,
      height: 480,
    });

    camera.start()
      .then(() => onCameraReady(true))
      .catch((err: any) => {
        console.error("Camera start error", err);
        setError("Could not access camera. Please allow permissions.");
      });

    return () => {
      // Cleanup if necessary
    };
  }, [onHandUpdate, onCameraReady]);

  return (
    <div className="fixed bottom-4 left-4 z-50 pointer-events-none opacity-80">
      {/* Video preview to show user tracking is working */}
      <div className="relative rounded-xl overflow-hidden border-2 border-white/20 shadow-lg w-32 h-24 bg-black">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover transform -scale-x-100" // Mirror effect
          playsInline
          muted
        />
        {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-xs text-red-400 p-2 text-center">
                {error}
            </div>
        )}
        <div className="absolute bottom-1 right-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>
      <p className="text-[10px] text-white/50 mt-1 ml-1 font-mono uppercase tracking-widest">Sensor Active</p>
    </div>
  );
};

export default HandTracker;