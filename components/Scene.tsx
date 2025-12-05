
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import ParticleSystem from './ParticleSystem';
import { ParticleShape } from '../constants';

// Fix for TypeScript errors: Define the missing intrinsic element for R3F
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
    }
  }
}

interface SceneProps {
  shape: ParticleShape;
  color: string;
  handOpenness: number;
}

const Scene: React.FC<SceneProps> = ({ shape, color, handOpenness }) => {
  return (
    <div className="w-full h-full absolute top-0 left-0 bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60 }}
        dpr={[1, 2]} // Support high DPI
        gl={{ antialias: true, toneMapping: THREE.ReinhardToneMapping, alpha: true }}
      >
        <ParticleSystem 
          shape={shape} 
          color={color} 
          handOpenness={handOpenness} 
        />
        
        {/* Added extra ambience */}
        <Sparkles count={500} scale={20} size={2} speed={0.4} opacity={0.5} color={color} />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={0.5} />
        <Environment preset="city" />
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          autoRotate={true}
          autoRotateSpeed={0.5}
          maxDistance={30}
          minDistance={2}
        />
      </Canvas>
    </div>
  );
};

export default Scene;
