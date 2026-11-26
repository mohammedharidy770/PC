import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { PC_BUILDS, DEFAULT_BUILD } from '../data/builds';
import { HARDWARE_COMPONENTS } from '../data/components';
import { createPCAssembly } from '../components/three/buildPCAssembly';
import { ComponentId } from '../types/hardware';
import { createProceduralTextures, detectSoftwareWebGL } from './webgl';

const componentPreviews: Partial<Record<ComponentId, string>> = {};
const buildPreviews: Record<string, string> = {};
let initialized = false;
let initPromise: Promise<void> | null = null;

function renderSnapshot(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
): string {
  renderer.render(scene, camera);
  return renderer.domElement.toDataURL('image/png');
}

export function getComponentPreview(id: ComponentId): string | undefined {
  return componentPreviews[id];
}

export function getBuildPreview(slug: string): string | undefined {
  return buildPreviews[slug];
}

export async function generateAll3DPreviews(
  onProgress?: (percent: number) => void
): Promise<void> {
  if (initialized) {
    onProgress?.(100);
    return;
  }
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const isSoftwareGl = detectSoftwareWebGL();
    const width = 560;
    const height = 420;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(isSoftwareGl ? 1 : 1.5);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const textures = createProceduralTextures(
      isSoftwareGl ? 1 : Math.min(4, renderer.capabilities.getMaxAnisotropy())
    );

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0B0F16');
    scene.environment = envTex;

    const keyLight = new THREE.DirectionalLight('#fff5eb', 2.1);
    keyLight.position.set(-4, 5, 4);
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight('#c4d8ff', '#111622', 0.85);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight('#C5A5FF', 1.4);
    rimLight.position.set(4, 2, -4);
    scene.add(rimLight);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 30);

    const totalTasks = HARDWARE_COMPONENTS.length + PC_BUILDS.length;
    let completed = 0;

    // 1. Render all 8 Component Previews using the actual procedural PC hardware
    const baseAssembly = createPCAssembly(DEFAULT_BUILD.materials, textures, isSoftwareGl);
    baseAssembly.updateRGB(DEFAULT_BUILD.defaultRGB, 0);
    scene.add(baseAssembly.root);

    for (const comp of HARDWARE_COMPONENTS) {
      // Show only target component (plus fans if cooling)
      (Object.keys(baseAssembly.partMap) as ComponentId[]).forEach((key) => {
        const isTarget =
          key === comp.id || (comp.id === 'cooling' && key === 'fans');
        baseAssembly.partMap[key].visible = isTarget;
      });

      // Compute bounding box of visible component to center & frame it cleanly
      const targetGroup = baseAssembly.partMap[comp.id];
      const box = new THREE.Box3().setFromObject(targetGroup);
      if (comp.id === 'cooling') {
        box.union(new THREE.Box3().setFromObject(baseAssembly.fansGroup));
      }
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      box.getCenter(center);
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z, 0.35);

      const dist = maxDim * 1.95;
      camera.position.set(center.x - dist * 0.85, center.y + dist * 0.35, center.z + dist * 0.78);
      camera.lookAt(center);
      camera.updateProjectionMatrix();

      componentPreviews[comp.id] = renderSnapshot(renderer, scene, camera);
      completed++;
      onProgress?.(Math.round((completed / totalTasks) * 90) + 10);

      // Yield briefly to keep UI responsive
      await new Promise((r) => requestAnimationFrame(r));
    }

    scene.remove(baseAssembly.root);
    baseAssembly.dispose();

    // 2. Render all 5 Featured PC Build Previews
    camera.fov = 38;
    camera.updateProjectionMatrix();

    for (const build of PC_BUILDS) {
      const buildRig = createPCAssembly(build.materials, textures, isSoftwareGl);
      buildRig.updateRGB(build.defaultRGB, 1.2);
      buildRig.root.rotation.y = 0.25;
      scene.add(buildRig.root);

      camera.position.set(-2.95, 0.45, 2.75);
      camera.lookAt(0, 0.02, 0);

      buildPreviews[build.slug] = renderSnapshot(renderer, scene, camera);

      scene.remove(buildRig.root);
      buildRig.dispose();

      completed++;
      onProgress?.(Math.round((completed / totalTasks) * 90) + 10);
      await new Promise((r) => requestAnimationFrame(r));
    }

    // Cleanup offscreen WebGL resources
    envTex.dispose();
    textures.dispose();
    renderer.dispose();
    initialized = true;
    onProgress?.(100);
  })();

  return initPromise;
}
