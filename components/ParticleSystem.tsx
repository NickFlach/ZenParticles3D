
import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ParticleShape, PARTICLE_COUNT } from '../constants';
import { generateParticles } from '../utils/geometry';

// Fix for TypeScript errors: Define the missing intrinsic elements for R3F
declare global {
  namespace JSX {
    interface IntrinsicElements {
      points: any;
      shaderMaterial: any;
    }
  }
}

interface ParticleSystemProps {
  shape: ParticleShape;
  color: string;
  handOpenness: number; // 0 to 1
}

// Custom Shader Material for Procedural Glowing Dots
const ParticleShaderMaterial = {
  vertexShader: `
    uniform float uTime;
    uniform float uExpansion;
    uniform float uSize;
    
    varying float vDistance;
    
    void main() {
      vec3 pos = position;
      
      // Expansion logic
      vec3 direction = normalize(pos);
      float dist = length(pos);
      
      // Breathing and expansion
      // Use noise-like movement
      float jitter = sin(uTime * 2.0 + dist * 0.5) * 0.2;
      
      // Map handOpenness (0 to 1) to expansion range (1.0 to 6.0)
      float expansionFactor = 1.0 + (uExpansion * 5.0); 
      
      vec3 finalPos = pos * expansionFactor + (direction * jitter);
      
      // Rotate the entire cloud slowly
      float globalRot = uTime * 0.15;
      float sG = sin(globalRot);
      float cG = cos(globalRot);
      mat2 rotG = mat2(cG, -sG, sG, cG);
      finalPos.xz = rotG * finalPos.xz;
      finalPos.xy = rotG * finalPos.xy; // Add some complex rotation

      vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
      
      // Size attenuation
      gl_PointSize = uSize * (20.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
      
      vDistance = dist;
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uOpacity;
    
    void main() {
      // Calculate distance from center of the point (0.0 to 0.5)
      vec2 coord = gl_PointCoord - vec2(0.5);
      float r = length(coord);
      
      // Circular clipping
      if (r > 0.5) discard;
      
      // Create a soft glow effect
      // 0.0 at center, 0.5 at edge
      float strength = 1.0 - (r * 2.0);
      strength = pow(strength, 1.5); // Sharpen the falloff slightly
      
      vec3 finalColor = uColor;
      
      // Add a hot white center
      finalColor = mix(finalColor, vec3(1.0), strength * 0.5);

      gl_FragColor = vec4(finalColor, uOpacity * strength);
    }
  `
};

const ParticleSystem: React.FC<ParticleSystemProps> = ({ shape, color, handOpenness }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Generate geometry
  const positions = useMemo(() => generateParticles(shape, PARTICLE_COUNT), [shape]);
  
  // Update Uniforms
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uColor.value.set(color);
    }
  }, [color]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      
      const currentExp = materialRef.current.uniforms.uExpansion.value;
      materialRef.current.uniforms.uExpansion.value = THREE.MathUtils.lerp(currentExp, handOpenness, 0.1);
      
      // Dynamic pulsing size
      // Smaller base size since we have more particles now
      materialRef.current.uniforms.uSize.value = 15.0 + Math.sin(state.clock.getElapsedTime() * 2.0) * 5.0;
    }
  });

  // Create Geometry
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uExpansion: { value: 0 },
    uSize: { value: 20.0 },
    uColor: { value: new THREE.Color(color) },
    uOpacity: { value: 0.8 }
  }), []);

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        attach="material"
        args={[ParticleShaderMaterial]}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
      />
    </points>
  );
};

export default ParticleSystem;
