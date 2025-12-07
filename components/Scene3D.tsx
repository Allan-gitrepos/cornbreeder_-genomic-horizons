
import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Environment } from '@react-three/drei';
import { Plant } from '../types';
import CornPlant3D from './CornPlant3D';
import { POPULATION_SIZE } from '../constants';
import * as THREE from 'three';

interface Scene3DProps {
   population: Plant[];
   selectedIds: Set<string>;
   onPlantClick: (id: string) => void;
   showGenetics: boolean;
}

// Soil texture component
const SoilGround: React.FC = () => {
   const soilTexture = useMemo(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      // Base soil color
      ctx.fillStyle = '#3d2817';
      ctx.fillRect(0, 0, 512, 512);

      // Add soil texture variation
      for (let i = 0; i < 2000; i++) {
         const x = Math.random() * 512;
         const y = Math.random() * 512;
         const size = Math.random() * 4 + 1;
         const brightness = Math.random() * 30 - 15;
         const r = 61 + brightness;
         const g = 40 + brightness;
         const b = 23 + brightness;
         ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
         ctx.beginPath();
         ctx.arc(x, y, size, 0, Math.PI * 2);
         ctx.fill();
      }

      // Add some darker patches (organic matter)
      for (let i = 0; i < 100; i++) {
         const x = Math.random() * 512;
         const y = Math.random() * 512;
         const size = Math.random() * 15 + 5;
         ctx.fillStyle = `rgba(20, 15, 10, ${Math.random() * 0.3})`;
         ctx.beginPath();
         ctx.arc(x, y, size, 0, Math.PI * 2);
         ctx.fill();
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(8, 8);
      return texture;
   }, []);

   return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
         <planeGeometry args={[80, 80]} />
         <meshStandardMaterial
            map={soilTexture}
            roughness={0.95}
            metalness={0.05}
         />
      </mesh>
   );
};

// Furrow lines in the field
const FieldFurrows: React.FC<{ rows: number; spacing: number }> = ({ rows, spacing }) => {
   const furrows = [];
   const fieldSize = rows * spacing;

   for (let i = 0; i <= rows; i++) {
      const z = i * spacing - fieldSize / 2;
      furrows.push(
         <mesh key={`furrow-${i}`} position={[0, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[fieldSize + 4, 0.15]} />
            <meshStandardMaterial color="#2a1a0a" roughness={1} />
         </mesh>
      );
   }

   return <group>{furrows}</group>;
};

const Scene3D: React.FC<Scene3DProps> = ({ population, selectedIds, onPlantClick, showGenetics }) => {
   // Grid Layout Logic - 8x8 for 64 plants
   const rows = Math.ceil(Math.sqrt(POPULATION_SIZE));
   const spacing = 1.3; // Slightly tighter spacing
   const fieldOffset = (rows * spacing) / 2 - spacing / 2;

   return (
      <div className="w-full h-full bg-gradient-to-b from-sky-400 to-sky-200 relative">
         {/* 3D Canvas */}
         <Canvas
            shadows
            camera={{ position: [12, 10, 16], fov: 50 }}
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
         >
            <Suspense fallback={null}>
               {/* Bright ambient light */}
               <ambientLight intensity={1.2} color="#fff5e6" />

               {/* Main sun light - bright and warm */}
               <directionalLight
                  position={[20, 30, 10]}
                  intensity={2.5}
                  color="#fff8e0"
                  castShadow
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
                  shadow-camera-far={100}
                  shadow-camera-left={-30}
                  shadow-camera-right={30}
                  shadow-camera-top={30}
                  shadow-camera-bottom={-30}
               />

               {/* Fill light */}
               <directionalLight
                  position={[-10, 15, -10]}
                  intensity={0.8}
                  color="#87ceeb"
               />

               {/* Bright sky with visible sun */}
               <Sky
                  sunPosition={[20, 30, 10]}
                  turbidity={2}
                  rayleigh={0.5}
                  mieCoefficient={0.005}
                  mieDirectionalG={0.8}
                  inclination={0.6}
                  azimuth={0.25}
               />

               {/* Environment for reflections */}
               <Environment preset="sunset" background={false} blur={0.4} />

               {/* Soil ground with texture */}
               <SoilGround />

               {/* Field furrows */}
               <FieldFurrows rows={rows} spacing={spacing} />

               {/* Plants grid */}
               <group position={[-fieldOffset, 0, -fieldOffset]}>
                  {population.map((plant, index) => {
                     const row = Math.floor(index / rows);
                     const col = index % rows;
                     // Add slight random offset for natural look
                     const offsetX = (Math.random() - 0.5) * 0.15;
                     const offsetZ = (Math.random() - 0.5) * 0.15;

                     return (
                        <CornPlant3D
                           key={plant.id}
                           plant={plant}
                           position={[col * spacing + offsetX, 0, row * spacing + offsetZ]}
                           isSelected={selectedIds.has(plant.id)}
                           onClick={onPlantClick}
                           showGenetics={showGenetics}
                        />
                     );
                  })}
               </group>

               <OrbitControls
                  minPolarAngle={0.2}
                  maxPolarAngle={Math.PI / 2 - 0.1}
                  enablePan={true}
                  maxDistance={50}
                  minDistance={3}
                  target={[0, 1, 0]}
               />
            </Suspense>
         </Canvas>

         <div className="absolute top-4 right-4 pointer-events-none text-white text-xs font-mono bg-black/60 backdrop-blur-sm p-3 rounded-lg">
            <p className="font-bold mb-1">🌽 Field Controls</p>
            <p>Click: Select | Drag: Rotate | Scroll: Zoom</p>
         </div>
      </div>
   );
};

export default Scene3D;
