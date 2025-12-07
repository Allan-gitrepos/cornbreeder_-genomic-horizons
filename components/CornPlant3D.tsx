
import React, { useRef, useMemo } from 'react';
import { Plant } from '../types';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group, Color, Mesh, MeshStandardMaterial } from 'three';
import { useGLTF } from '@react-three/drei';

// Direct path to the file in the components folder
const cornModelUrl = '/components/corn_corn_corn.glb';

interface CornPlant3DProps {
  plant: Plant;
  position: [number, number, number];
  isSelected: boolean;
  onClick: (id: string) => void;
  showGenetics: boolean;
}

const CornPlant3D: React.FC<CornPlant3DProps> = ({ plant, position, isSelected, onClick, showGenetics }) => {
  const groupRef = useRef<Group>(null);

  // Load the user-provided model
  const { scene } = useGLTF(cornModelUrl);

  // --- TRAIT MAPPING ---
  const yieldVal = plant.phenotype.yield; 
  const heightVal = plant.phenotype.height || 15; 
  const resVal = plant.phenotype.resistance;

  // Scaling logic based on Genetics
  // Base scale of model might need adjustment depending on the GLB unit size
  const baseScale = 0.5; 
  const yieldScale = Math.max(0.8, heightVal / 12); 
  const finalScaleY = baseScale * yieldScale;
  const finalScaleXZ = baseScale * (0.8 + (yieldVal / 40)); // Slightly fatter if higher yield

  // Health Calculation (0.0 to 1.0)
  // High Resistance (20) -> 1.0 (Healthy)
  // Low Resistance (0) -> 0.0 (Sick)
  const healthFactor = Math.min(1, Math.max(0, resVal / 15));

  // --- CLONING & MATERIAL LOGIC ---
  const clonedScene = useMemo(() => {
    // Deep clone the scene so we have a unique instance for this plant
    const c = scene.clone(true);

    // Define tints
    const healthyTint = new Color(0xffffff); // White = Original Texture colors
    const sickTint = new Color(0xa16207);    // Brown/Yellow overlay

    // Calculate this plant's specific tint
    const plantTint = sickTint.clone().lerp(healthyTint, healthFactor);

    // Traverse the model to apply the tint to all materials
    c.traverse((obj) => {
      if ((obj as Mesh).isMesh) {
        const mesh = obj as Mesh;
        
        // We must clone the material so we don't affect other plants sharing the same base model
        if (mesh.material) {
           // Handle single material or array of materials
           const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
           
           mesh.material = materials.map((m) => {
             const newMat = m.clone() as MeshStandardMaterial;
             newMat.color.copy(plantTint);
             return newMat;
           })[0]; 
        }
      }
    });

    return c;
  }, [scene, healthFactor]);


  // Animation (Gentle Sway)
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      const swayAmount = 0.05 * (healthFactor); 
      // Desynchronize sway based on position
      const swayX = Math.sin(time + position[0] * 0.5) * swayAmount;
      const swayZ = Math.cos(time + position[2] * 0.5) * swayAmount;
      
      // Apply rotation to the group
      groupRef.current.rotation.x = swayX;
      groupRef.current.rotation.z = swayZ;
    }
  });

  return (
    <group 
      ref={groupRef} 
      position={new Vector3(...position)} 
      onClick={(e) => { e.stopPropagation(); onClick(plant.id); }}
    >
      {/* Selection Ring */}
      {isSelected && (
        <group>
          <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.4, 0.5, 32]} />
            <meshBasicMaterial color="#3b82f6" opacity={0.8} transparent side={2}/>
          </mesh>
          <pointLight position={[0, 2, 0]} color="#3b82f6" intensity={2} distance={3} />
        </group>
      )}

      {/* Breeding Value Orb (Genomic Selection View) */}
      {showGenetics && (
        <group position={[0, finalScaleY * 4, 0]}>
            <mesh>
              <sphereGeometry args={[0.25, 16, 16]} />
              <meshStandardMaterial 
                color={plant.breedingValue.yield > 12 ? "#a855f7" : "#4b5563"} 
                emissive={plant.breedingValue.yield > 12 ? "#a855f7" : "#000000"}
                emissiveIntensity={2}
                transparent
                opacity={0.9}
              />
            </mesh>
        </group>
      )}

      {/* The External 3D Model */}
      <primitive 
        object={clonedScene} 
        scale={[finalScaleXZ, finalScaleY, finalScaleXZ]} 
        rotation={[0, Math.random() * Math.PI, 0]} // Random rotation for variation
      />

    </group>
  );
};

export default CornPlant3D;
