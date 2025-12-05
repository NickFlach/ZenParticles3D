import * as THREE from 'three';
import { ParticleShape, PARTICLE_COUNT } from '../constants';

export const generateParticles = (shape: ParticleShape, count: number = PARTICLE_COUNT): Float32Array => {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    let x = 0, y = 0, z = 0;

    switch (shape) {
      case ParticleShape.Heart: {
        // Parametric heart
        const t = Math.random() * Math.PI * 2;
        const r = Math.pow(Math.random(), 0.3); // distribute internally
        // Heart formula
        x = 16 * Math.pow(Math.sin(t), 3);
        y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        z = (Math.random() - 0.5) * 5; // Thickness
        // Normalize and scale
        x *= 0.1 * r;
        y *= 0.1 * r;
        z *= r;
        break;
      }
      case ParticleShape.Flower: {
        // Rose curve / Polar
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const k = 4; // petals
        const r = Math.cos(k * theta) + 2; 
        const dist = Math.random() * 2;
        x = r * Math.cos(theta) * Math.sin(phi) * dist;
        y = r * Math.sin(theta) * Math.sin(phi) * dist;
        z = r * Math.cos(phi) * dist * 0.5;
        break;
      }
      case ParticleShape.Saturn: {
        const isRing = Math.random() > 0.6;
        if (isRing) {
          const angle = Math.random() * Math.PI * 2;
          const radius = 3 + Math.random() * 2;
          x = Math.cos(angle) * radius;
          z = Math.sin(angle) * radius;
          y = (Math.random() - 0.5) * 0.2;
        } else {
          // Planet body
          const u = Math.random();
          const v = Math.random();
          const theta = 2 * Math.PI * u;
          const phi = Math.acos(2 * v - 1);
          const r = 1.5;
          x = r * Math.sin(phi) * Math.cos(theta);
          y = r * Math.sin(phi) * Math.sin(theta);
          z = r * Math.cos(phi);
        }
        break;
      }
      case ParticleShape.Zen: {
         // Abstract sitting figure (Stacked cones/spheres)
         const r = Math.random();
         const theta = Math.random() * Math.PI * 2;
         const section = Math.random();
         
         if (section < 0.4) {
           // Base (legs)
           const rad = 2.5 * Math.sqrt(r);
           y = -2 + (Math.random() * 1);
           x = rad * Math.cos(theta);
           z = rad * Math.sin(theta) * 0.6; // flattened z
         } else if (section < 0.8) {
           // Body
           const rad = 1.5 * Math.sqrt(r) * (1 - (section - 0.4) * 2);
           y = -1 + (section - 0.4) * 5; 
           x = rad * Math.cos(theta);
           z = rad * Math.sin(theta);
         } else {
           // Head
           const rad = 0.6 * Math.sqrt(r);
           y = 1.2 + Math.random() * 0.8;
           x = rad * Math.cos(theta);
           z = rad * Math.sin(theta);
         }
         break;
      }
      case ParticleShape.Fireworks: {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = Math.pow(Math.random(), 1/3) * 3; // Uniform sphere
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
        break;
      }
      case ParticleShape.Spiral: {
        const angle = i * 0.1;
        const r = angle * 0.02;
        x = r * Math.cos(angle);
        z = r * Math.sin(angle);
        y = (Math.random() - 0.5) * 2;
        break;
      }
      default:
        x = (Math.random() - 0.5) * 5;
        y = (Math.random() - 0.5) * 5;
        z = (Math.random() - 0.5) * 5;
    }

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;
  }

  return positions;
};
