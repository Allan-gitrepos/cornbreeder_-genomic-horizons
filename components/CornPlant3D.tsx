
import React, { useRef, useMemo } from 'react';
import { Plant } from '../types';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group, Color, Mesh, MeshStandardMaterial } from 'three';
import { useGLTF } from '@react-three/drei';

// Use Vite's BASE_URL for proper path resolution on GitHub Pages
const cornModelUrl = `${import.meta.env.BASE_URL}components/corn_corn_corn.glb`;

interface CornPlant3DProps {
  plant: Plant;
  position: [number, number, number];
  isSelected: boolean;
  onClick: (id: string) => void;
  showGenetics: boolean;
}

const CornPlant3D: React.FC<CornPlant3DProps> = ({ plant, position, isSelected, onClick, showGenetics }) => {
  const groupRef = useRef<Group>(null);

  // Load the 3D model
  const { scene } = useGLTF(cornModelUrl);

  // --- TRAIT MAPPING ---
  const yieldVal = plant.phenotype.yield;
  const heightVal = plant.phenotype.height;
  const resVal = plant.phenotype.resistance;

  // Scaling based on genetics
  const baseScale = 0.45;
  // Height affects Y scale
  const heightScale = Math.max(0.6, (heightVal / 20));
  const finalScaleY = baseScale * heightScale;
  // Yield affects thickness
  const thicknessScale = baseScale * (0.7 + (yieldVal / 30));

  // Health (0.0 to 1.0) based on resistance
  const healthFactor = Math.min(1, Math.max(0, resVal / 15));

  // Clone scene with proper material tinting
  const clonedScene = useMemo(() => {
    const c = scene.clone(true);

    // Color based on health
    const healthyTint = new Color(0xffffff); // White = Original
    const sickTint = new Color(0xa16207);    // Brown/Yellow (diseased)

    const plantTint = sickTint.clone().lerp(healthyTint, healthFactor);

    c.traverse((obj) => {
      if ((obj as Mesh).isMesh) {
        const mesh = obj as Mesh;

        if (mesh.material) {
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

  // Animation - gentle sway
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      const swayAmount = 0.03 * healthFactor;
      const swayX = Math.sin(time * 0.8 + position[0] * 0.5) * swayAmount;
      const swayZ = Math.cos(time * 0.6 + position[2] * 0.5) * swayAmount;

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
      {/* Selection Ring - appears when selected */}
      {isSelected && (
        <group>
          <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.35, 0.45, 32]} />
            <meshBasicMaterial color="#22c55e" opacity={0.9} transparent side={2} />
          </mesh>
          {/* Glow effect */}
          <pointLight position={[0, 1.5, 0]} color="#22c55e" intensity={3} distance={2.5} />
        </group>
      )}

      {/* Genomic View indicator - subtle glow instead of orb */}
      {showGenetics && (
        <pointLight
          position={[0, finalScaleY * 3, 0]}
          color={plant.breedingValue.yield > 12 ? "#a855f7" : "#6b7280"}
          intensity={plant.breedingValue.yield > 12 ? 2 : 0.5}
          distance={2}
        />
      )}

      {/* The 3D Corn Model */}
      <primitive
        object={clonedScene}
        scale={[thicknessScale, finalScaleY, thicknessScale]}
        rotation={[0, Math.random() * Math.PI * 2, 0]}
      />
    </group>
  );
};

export default CornPlant3D;
