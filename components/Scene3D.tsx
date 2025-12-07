
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Environment } from '@react-three/drei';
import { Plant } from '../types';
import CornPlant3D from './CornPlant3D';
import { POPULATION_SIZE } from '../constants';

interface Scene3DProps {
  population: Plant[];
  selectedIds: Set<string>;
  onPlantClick: (id: string) => void;
  showGenetics: boolean;
}

const Scene3D: React.FC<Scene3DProps> = ({ population, selectedIds, onPlantClick, showGenetics }) => {
  // Grid Layout Logic
  const rows = Math.ceil(Math.sqrt(POPULATION_SIZE));
  const spacing = 1.5;

  return (
    <div className="w-full h-full bg-black relative">
       {/* 3D Canvas */}
       <Canvas shadows camera={{ position: [8, 8, 12], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.8} />
            <directionalLight 
                position={[10, 20, 5]} 
                intensity={2.0} 
                castShadow 
                shadow-mapSize-width={2048} 
                shadow-mapSize-height={2048}
            />
            
            <Sky sunPosition={[10, 10, 0]} turbidity={0.5} rayleigh={0.5} mieCoefficient={0.005} mieDirectionalG={0.8} />
            <Environment preset="park" background={false} blur={0.5} />

            {/* Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
               <planeGeometry args={[100, 100]} />
               <meshStandardMaterial color="#291d0e" roughness={1} />
            </mesh>
            
            {/* Grid Helper for Reference */}
            <gridHelper args={[60, 60, 0x444444, 0x222222]} position={[0, 0.01, 0]} />

            {/* Plants */}
            <group position={[-(rows * spacing) / 2 + spacing/2, 0, -(rows * spacing) / 2 + spacing/2]}>
               {population.map((plant, index) => {
                  const row = Math.floor(index / rows);
                  const col = index % rows;
                  return (
                    <CornPlant3D 
                       key={plant.id} 
                       plant={plant} 
                       position={[col * spacing, 0, row * spacing]}
                       isSelected={selectedIds.has(plant.id)}
                       onClick={onPlantClick}
                       showGenetics={showGenetics}
                    />
                  );
               })}
            </group>

            <OrbitControls 
                minPolarAngle={0} 
                maxPolarAngle={Math.PI / 2 - 0.1} // Prevent going below ground
                enablePan={true}
                maxDistance={40}
                minDistance={2}
                target={[0, 1, 0]}
            />
          </Suspense>
       </Canvas>
       
       <div className="absolute top-4 right-4 pointer-events-none text-white/50 text-xs font-mono bg-black/50 p-2 rounded">
          <p>LMB: Select/Rotate | RMB: Pan | Scroll: Zoom</p>
       </div>
    </div>
  );
};

export default Scene3D;
