import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { HARDWARE_COMPONENTS } from '../../data/components';
import { CameraPreset, ComponentId } from '../../types/hardware';
import { createProceduralTextures, detectSoftwareWebGL } from '../../utils/webgl';

interface CameraRigProps {
  preset: CameraPreset;
  focusedComponent?: ComponentId | null;
  enableOrbit: boolean;
  isSoftwareGl: boolean;
}

const PRESET_VIEWS: Record<
  CameraPreset,
  { pos: [number, number, number]; target: [number, number, number] }
> = {
  perspective: { pos: [-3.15, 0.55, 2.85], target: [0, 0.02, 0] },
  front: { pos: [0.0, 0.15, 3.65], target: [0, 0.02, 0] },
  side: { pos: [-3.65, 0.1, 0.0], target: [0, 0.02, 0] },
  interior: { pos: [-1.85, 0.25, 1.35], target: [0.05, 0.08, -0.15] },
};

const _targetPos = new THREE.Vector3();
const _targetLook = new THREE.Vector3();

function StudioEnvironment({ isSoftwareGl }: { isSoftwareGl: boolean }) {
  const { gl, scene } = useThree();

  const textures = useMemo(() => {
    const aniso = isSoftwareGl ? 1 : Math.min(4, gl.capabilities.getMaxAnisotropy());
    return createProceduralTextures(aniso);
  }, [gl, isSoftwareGl]);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    pmrem.dispose();

    return () => {
      scene.environment = null;
      env.dispose();
    };
  }, [gl, scene]);

  useEffect(() => {
    return () => {
      textures.dispose();
    };
  }, [textures]);

  return (
    <>
      <color attach="background" args={['#07090D']} />
      <fog attach="fog" args={['#07090D', 6.5, 16]} />

      {/* Warm Key Light + Tight Shadow Frustum */}
      <directionalLight
        position={[-4.5, 6.2, 4.8]}
        intensity={1.95}
        color="#fff4e8"
        castShadow={!isSoftwareGl}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={16}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />

      {/* Cool Studio Hemisphere Fill */}
      <hemisphereLight args={['#b8d0ff', '#0b0e14', 0.72]} />

      {/* Rim Backlight to carve brushed aluminum silhouettes */}
      <directionalLight position={[4.5, 2.5, -4.5]} intensity={1.35} color="#C5A5FF" />

      {/* Grounded Studio Contact Shadow + Reflective Floor Disc */}
      <mesh position={[0, -1.19, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[3.8, 48]} />
        <meshStandardMaterial color="#0b0e15" roughness={0.68} metalness={0.3} />
      </mesh>
      <mesh position={[0, -1.175, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.2, 3.2]} />
        <meshBasicMaterial
          map={textures.contactShadowMap}
          transparent
          opacity={0.75}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

function CameraRig({ preset, focusedComponent, enableOrbit, isSoftwareGl }: CameraRigProps) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const animating = useRef(false);
  const lastKey = useRef('');

  const key = focusedComponent ? `comp:${focusedComponent}` : `preset:${preset}`;
  useEffect(() => {
    if (key !== lastKey.current) {
      lastKey.current = key;
      animating.current = true;
    }
  }, [key]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (!animating.current) return;

    const comp = focusedComponent
      ? HARDWARE_COMPONENTS.find((c) => c.id === focusedComponent)
      : null;

    if (comp) {
      _targetPos.set(...comp.cameraTarget.position);
      _targetLook.set(...comp.cameraTarget.lookAt);
    } else {
      const view = PRESET_VIEWS[preset];
      _targetPos.set(...view.pos);
      _targetLook.set(...view.target);
    }

    camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetPos.x, 5.2, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, _targetPos.y, 5.2, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, _targetPos.z, 5.2, dt);

    if (controlsRef.current) {
      controlsRef.current.target.x = THREE.MathUtils.damp(
        controlsRef.current.target.x,
        _targetLook.x,
        5.5,
        dt
      );
      controlsRef.current.target.y = THREE.MathUtils.damp(
        controlsRef.current.target.y,
        _targetLook.y,
        5.5,
        dt
      );
      controlsRef.current.target.z = THREE.MathUtils.damp(
        controlsRef.current.target.z,
        _targetLook.z,
        5.5,
        dt
      );
      controlsRef.current.update();
    } else {
      camera.lookAt(_targetLook);
    }

    if (camera.position.distanceTo(_targetPos) < 0.02) {
      animating.current = false;
    }
  });

  if (!enableOrbit) return null;

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping={!isSoftwareGl}
      dampingFactor={0.06}
      enablePan={false}
      minDistance={1.45}
      maxDistance={6.8}
      minPolarAngle={0.25}
      maxPolarAngle={Math.PI * 0.52}
      onStart={() => {
        // Cancel scripted transition immediately when user interacts
        animating.current = false;
      }}
    />
  );
}

interface PCSceneProps {
  children: ReactNode;
  cameraPreset?: CameraPreset;
  focusedComponent?: ComponentId | null;
  enableOrbit?: boolean;
  className?: string;
  initialCameraPosition?: [number, number, number];
}

export default function PCScene({
  children,
  cameraPreset = 'perspective',
  focusedComponent = null,
  enableOrbit = true,
  className = '',
  initialCameraPosition = [-3.15, 0.55, 2.85],
}: PCSceneProps) {
  const isSoftwareGl = useMemo(() => detectSoftwareWebGL(), []);
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [contextLost, setContextLost] = useState(false);

  // Pause rendering when scrolled off-screen to preserve GPU budget across sections
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        setInView(entries[0]?.isIntersecting ?? true);
      },
      { rootMargin: '200px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-[#07090D] ${className}`}
    >
      {contextLost ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="font-display text-lg font-semibold text-[#F5F6F8]">
            3D Viewport Recovering
          </p>
          <p className="max-w-sm text-sm text-[#929BA8]">
            WebGL graphics context was interrupted. Restore the scene to continue inspecting the hardware.
          </p>
          <button
            type="button"
            onClick={() => setContextLost(false)}
            className="rounded-lg border border-white/10 bg-[#151A22] px-4 py-2 text-xs font-medium text-[#F5F6F8] hover:border-[#C5A5FF]/50"
          >
            Reload Viewport
          </button>
        </div>
      ) : (
        <Canvas
          shadows={!isSoftwareGl}
          dpr={isSoftwareGl ? 1 : [1, 2]}
          frameloop={inView ? 'always' : 'demand'}
          camera={{
            position: initialCameraPosition,
            fov: 38,
            near: 0.1,
            far: 40,
          }}
          gl={{
            antialias: !isSoftwareGl,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.12,
          }}
          onCreated={({ gl }) => {
            gl.outputColorSpace = THREE.SRGBColorSpace;
            const canvas = gl.domElement;
            canvas.addEventListener('webglcontextlost', (e) => {
              e.preventDefault();
              setContextLost(true);
            });
            canvas.addEventListener('webglcontextrestored', () => {
              setContextLost(false);
            });
          }}
        >
          <StudioEnvironment isSoftwareGl={isSoftwareGl} />
          <CameraRig
            preset={cameraPreset}
            focusedComponent={focusedComponent}
            enableOrbit={enableOrbit}
            isSoftwareGl={isSoftwareGl}
          />
          {children}
        </Canvas>
      )}
    </div>
  );
}
