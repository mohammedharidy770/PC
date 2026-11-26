import { useEffect, useMemo, useRef } from 'react';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EXPLODED_EXTRA_PARTS, HARDWARE_COMPONENTS } from '../../data/components';
import { BuildMaterials, ComponentId, RGBConfig } from '../../types/hardware';
import { createProceduralTextures, detectSoftwareWebGL } from '../../utils/webgl';
import { createPCAssembly } from './buildPCAssembly';

interface PCModelProps {
  materials: BuildMaterials;
  rgbConfig: RGBConfig;
  glassVisible?: boolean;
  explodeAmount?: number; // 0 = assembled, 1 = fully exploded
  assemblyProgress?: number; // 0..1 for Hero scroll assembly (1 = fully assembled)
  highlightedComponent?: ComponentId | null;
  isolateComponent?: ComponentId | null;
  autoRotate?: boolean;
  floatingWhenExploded?: boolean;
  onSelectComponent?: (id: ComponentId) => void;
  onHoverComponent?: (id: ComponentId | null) => void;
}

const EXPLODE_VECTORS: Record<ComponentId, [number, number, number]> = {
  processor: HARDWARE_COMPONENTS.find((c) => c.id === 'processor')!.explodeOffset,
  gpu: HARDWARE_COMPONENTS.find((c) => c.id === 'gpu')!.explodeOffset,
  motherboard: HARDWARE_COMPONENTS.find((c) => c.id === 'motherboard')!.explodeOffset,
  memory: HARDWARE_COMPONENTS.find((c) => c.id === 'memory')!.explodeOffset,
  storage: HARDWARE_COMPONENTS.find((c) => c.id === 'storage')!.explodeOffset,
  cooling: HARDWARE_COMPONENTS.find((c) => c.id === 'cooling')!.explodeOffset,
  psu: HARDWARE_COMPONENTS.find((c) => c.id === 'psu')!.explodeOffset,
  case: HARDWARE_COMPONENTS.find((c) => c.id === 'case')!.explodeOffset,
  fans: EXPLODED_EXTRA_PARTS.fans.explodeOffset,
  glass: EXPLODED_EXTRA_PARTS.glass.explodeOffset,
};

function smoothRange(val: number, start: number, end: number): number {
  if (val <= start) return 0;
  if (val >= end) return 1;
  const t = (val - start) / (end - start);
  return t * t * (3 - 2 * t);
}

export default function PCModel({
  materials,
  rgbConfig,
  glassVisible = true,
  explodeAmount = 0,
  assemblyProgress = 1,
  highlightedComponent = null,
  isolateComponent = null,
  autoRotate = false,
  floatingWhenExploded = true,
  onSelectComponent,
  onHoverComponent,
}: PCModelProps) {
  const { gl } = useThree();
  const isSoftwareGl = useMemo(() => detectSoftwareWebGL(), []);
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);
  const currentExplode = useRef(explodeAmount);
  const focusLightRef = useRef<THREE.PointLight>(null);

  const textures = useMemo(() => {
    const aniso = isSoftwareGl ? 1 : Math.min(4, gl.capabilities.getMaxAnisotropy());
    return createProceduralTextures(aniso);
  }, [gl, isSoftwareGl]);

  const assembly = useMemo(() => {
    return createPCAssembly(materials, textures, isSoftwareGl);
  }, [materials, textures, isSoftwareGl]);

  useEffect(() => {
    return () => {
      assembly.dispose();
    };
  }, [assembly]);

  useEffect(() => {
    return () => {
      textures.dispose();
    };
  }, [textures]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const elapsed = state.clock.getElapsedTime();

    // Smoothly damp exploded view separation
    currentExplode.current = THREE.MathUtils.damp(
      currentExplode.current,
      explodeAmount,
      6.5,
      dt
    );
    const exp = currentExplode.current;

    // Spin all cooling fans & GPU axial fans smoothly when cooling is active
    const coolingVisible = smoothRange(assemblyProgress, 0.56, 0.72);
    const spinSpeed = dt * (4.5 + coolingVisible * 3.5);
    if (rgbConfig.enabled || assemblyProgress > 0.6) {
      for (let i = 0; i < assembly.fanSpinners.length; i++) {
        assembly.fanSpinners[i].rotation.z -= spinSpeed;
      }
    }

    // 10-Scene Scroll Assembly Choreography
    const p = assemblyProgress;
    const caseStage = p >= 0.99 ? 1 : smoothRange(p, 0.08, 0.22);
    const mbStage = p >= 0.99 ? 1 : smoothRange(p, 0.22, 0.35);
    const cpuRamStage = p >= 0.99 ? 1 : smoothRange(p, 0.35, 0.48);
    const gpuStage = p >= 0.99 ? 1 : smoothRange(p, 0.48, 0.61);
    const coolStage = p >= 0.99 ? 1 : smoothRange(p, 0.61, 0.75);
    const glassRgbStage = p >= 0.99 ? 1 : smoothRange(p, 0.75, 0.87);

    // Subtle rotation during hero early scenes or autoRotate mode
    if (autoRotate) {
      assembly.root.rotation.y += dt * 0.22;
    } else if (p < 0.99) {
      // Scene 02 slow rotation + Scene 09 cinematic orbital sweep
      const scene02Spin = smoothRange(p, 0.08, 0.28) * 0.45;
      const scene09Orbit = smoothRange(p, 0.85, 0.98) * Math.PI * 0.42;
      const targetRotY = -0.35 + scene02Spin + scene09Orbit;
      assembly.root.rotation.y = THREE.MathUtils.damp(
        assembly.root.rotation.y,
        targetRotY,
        5,
        dt
      );
    }

    // Helper to position each part combining Assembly slide-in + Exploded View + Float
    const applyPartTransform = (
      id: ComponentId,
      stage: number,
      entryOffset: [number, number, number],
      floatPhase: number
    ) => {
      const grp = assembly.partMap[id];
      const isIsolatedMatch =
        !isolateComponent ||
        isolateComponent === id ||
        (isolateComponent === 'cooling' && id === 'fans');

      grp.visible = stage > 0.01 && isIsolatedMatch && (id !== 'glass' || glassVisible);
      if (!grp.visible) return;

      const invStage = 1 - stage;
      const ev = EXPLODE_VECTORS[id];
      const floatY =
        floatingWhenExploded && exp > 0.05
          ? Math.sin(elapsed * 1.4 + floatPhase) * 0.028 * exp
          : 0;

      grp.position.set(
        entryOffset[0] * invStage + ev[0] * exp,
        entryOffset[1] * invStage + ev[1] * exp + floatY,
        entryOffset[2] * invStage + ev[2] * exp
      );

      // Gentle scale-in during assembly reveal
      if (stage < 1 && !highlightedComponent) {
        const s = 0.88 + 0.12 * stage;
        grp.scale.setScalar(s);
      }
    };

    applyPartTransform('case', caseStage, [0, 0.85, 0], 0.0);
    applyPartTransform('motherboard', mbStage, [-0.95, 0.15, 0], 0.7);
    applyPartTransform('psu', mbStage, [0, -0.75, -0.8], 1.4);
    applyPartTransform('processor', cpuRamStage, [-0.85, 0.3, 0], 2.1);
    applyPartTransform('memory', cpuRamStage, [-0.95, 0.25, 0.25], 2.6);
    applyPartTransform('storage', cpuRamStage, [-0.85, 0.05, 0.1], 3.1);
    applyPartTransform('gpu', gpuStage, [-1.3, -0.1, 0.35], 3.8);
    applyPartTransform('cooling', coolStage, [0, 0.95, 0], 4.5);
    applyPartTransform('fans', coolStage, [0, 0.35, 0.85], 5.1);
    applyPartTransform('glass', glassRgbStage, [-1.4, 0, 0], 5.8);

    // Update RGB lighting (scales cleanly with Stage 07 illumination reveal)
    const effectiveRgb: RGBConfig =
      p < 0.99
        ? {
            ...rgbConfig,
            intensity: rgbConfig.intensity * (0.2 + 0.8 * glassRgbStage),
          }
        : rgbConfig;
    assembly.updateRGB(effectiveRgb, elapsed);

    // Update highlight pulse & focus light
    assembly.setHighlight(highlightedComponent, elapsed);
    if (focusLightRef.current) {
      if (highlightedComponent && assembly.partMap[highlightedComponent]) {
        const target = HARDWARE_COMPONENTS.find((c) => c.id === highlightedComponent);
        if (target) {
          focusLightRef.current.position.set(
            target.cameraTarget.lookAt[0] - 0.35,
            target.cameraTarget.lookAt[1] + 0.15,
            target.cameraTarget.lookAt[2] + 0.35
          );
          focusLightRef.current.intensity = THREE.MathUtils.damp(
            focusLightRef.current.intensity,
            3.2,
            8,
            dt
          );
        }
      } else {
        focusLightRef.current.intensity = THREE.MathUtils.damp(
          focusLightRef.current.intensity,
          0,
          8,
          dt
        );
      }
    }
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (!onSelectComponent) return;
    if (pointerDownPos.current) {
      const dx = e.clientX - pointerDownPos.current.x;
      const dy = e.clientY - pointerDownPos.current.y;
      if (Math.hypot(dx, dy) > 6) return; // Ignore orbit drag releases
    }
    let obj: THREE.Object3D | null = e.object;
    while (obj) {
      if (obj.userData?.componentId) {
        e.stopPropagation();
        onSelectComponent(obj.userData.componentId as ComponentId);
        return;
      }
      obj = obj.parent;
    }
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    if (!onHoverComponent) return;
    let obj: THREE.Object3D | null = e.object;
    while (obj) {
      if (obj.userData?.componentId) {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
        onHoverComponent(obj.userData.componentId as ComponentId);
        return;
      }
      obj = obj.parent;
    }
  };

  const handlePointerOut = () => {
    if (!onHoverComponent) return;
    document.body.style.cursor = '';
    onHoverComponent(null);
  };

  return (
    <group
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <primitive object={assembly.root} />
      <pointLight ref={focusLightRef} color="#C5A5FF" intensity={0} distance={2.2} decay={2} />
    </group>
  );
}
