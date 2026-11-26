import * as THREE from 'three';
import { BuildMaterials, ComponentId, RGBConfig } from '../../types/hardware';
import { ProceduralTextures } from '../../utils/webgl';

export interface PCAssemblyParts {
  root: THREE.Group;
  caseGroup: THREE.Group;
  motherboardGroup: THREE.Group;
  processorGroup: THREE.Group;
  memoryGroup: THREE.Group;
  storageGroup: THREE.Group;
  gpuGroup: THREE.Group;
  coolingGroup: THREE.Group;
  fansGroup: THREE.Group;
  psuGroup: THREE.Group;
  glassGroup: THREE.Group;
  partMap: Record<ComponentId, THREE.Group>;
  fanSpinners: THREE.Object3D[];
  caseRgbMaterials: THREE.MeshStandardMaterial[];
  fanRgbMaterials: THREE.MeshStandardMaterial[];
  interiorRgbMaterials: THREE.MeshStandardMaterial[];
  casePointLight: THREE.PointLight;
  interiorPointLight: THREE.PointLight;
  updateRGB: (rgb: RGBConfig, elapsed: number) => void;
  setGlassVisible: (visible: boolean) => void;
  setHighlight: (highlighted: ComponentId | null, elapsed: number) => void;
  dispose: () => void;
}

const _colorA = new THREE.Color();
const _colorB = new THREE.Color();
const _tempColor = new THREE.Color();

export function createPCAssembly(
  materialsConfig: BuildMaterials,
  textures: ProceduralTextures,
  isSoftwareGl: boolean
): PCAssemblyParts {
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };

  const root = new THREE.Group();
  root.name = 'pc-masterpiece-root';

  // Core Shared PBR Materials
  const chassisMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: materialsConfig.chassisColor,
      metalness: materialsConfig.chassisMetalness,
      roughness: materialsConfig.chassisRoughness,
      roughnessMap: textures.brushedMetalRoughness,
      anisotropy: isSoftwareGl ? 0 : 0.75,
      clearcoat: 0.15,
      clearcoatRoughness: 0.35,
    })
  );

  const accentMetalMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: materialsConfig.accentMetalColor,
      metalness: 0.88,
      roughness: 0.24,
      roughnessMap: textures.brushedMetalRoughness,
    })
  );

  const darkTrimMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#0c0f15',
      metalness: 0.45,
      roughness: 0.62,
    })
  );

  const copperMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#c97a4b',
      metalness: 0.94,
      roughness: 0.2,
    })
  );

  const nickelMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#d4dae3',
      metalness: 0.95,
      roughness: 0.14,
    })
  );

  const pcbMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: materialsConfig.pcbColor,
      map: textures.pcbMap,
      metalness: 0.22,
      roughness: 0.52,
    })
  );

  const cableMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: materialsConfig.cableColor,
      metalness: 0.12,
      roughness: 0.78,
    })
  );

  const fanBladeMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: materialsConfig.fanBladeColor,
      metalness: 0.25,
      roughness: 0.35,
    })
  );

  const shroudMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: materialsConfig.shroudColor,
      metalness: 0.75,
      roughness: 0.3,
    })
  );

  const meshGrilleMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: materialsConfig.chassisColor,
      metalness: 0.7,
      roughness: 0.4,
      alphaMap: textures.meshAlphaMap,
      transparent: true,
      alphaTest: 0.25,
      side: THREE.DoubleSide,
    })
  );

  const glassMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: materialsConfig.glassTint,
      metalness: 0.05,
      roughness: 0.06,
      transmission: isSoftwareGl ? 0 : 0.65,
      transparent: true,
      opacity: isSoftwareGl ? Math.max(materialsConfig.glassOpacity, 0.26) : 0.92,
      ior: 1.52,
      thickness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      depthWrite: false,
    })
  );

  // Dynamic RGB Emissive Materials (separated by zone for RGB Studio control)
  const makeRgbMat = () =>
    trackMat(
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        emissive: '#C5A5FF',
        emissiveIntensity: 1.8,
        roughness: 0.25,
        metalness: 0.1,
        toneMapped: false,
      })
    );

  const caseRgbMat = makeRgbMat();
  const fanRgbMat = makeRgbMat();
  const interiorRgbMat = makeRgbMat();

  const caseRgbMaterials = [caseRgbMat];
  const fanRgbMaterials = [fanRgbMat];
  const interiorRgbMaterials = [interiorRgbMat];
  const fanSpinners: THREE.Object3D[] = [];

  const tagComponent = (group: THREE.Group, id: ComponentId) => {
    group.userData.componentId = id;
    group.traverse((child) => {
      child.userData.componentId = id;
    });
  };

  // =========================================================================
  // 1. PC CASE CHASSIS (x: [-0.52, 0.52], y: [-1.15, 1.15], z: [-1.08, 1.08])
  // =========================================================================
  const caseGroup = new THREE.Group();
  caseGroup.name = 'case';

  const addBox = (
    parent: THREE.Object3D,
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    mat: THREE.Material,
    castShadow = true
  ) => {
    const mesh = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(w, h, d)), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  // Bottom & Top chassis decks
  addBox(caseGroup, 1.04, 0.06, 2.16, 0, -1.09, 0, chassisMat);
  addBox(caseGroup, 1.04, 0.06, 2.16, 0, 1.12, 0, chassisMat);
  // Top perforated airflow filter inset
  addBox(caseGroup, 0.72, 0.015, 1.62, -0.04, 1.155, -0.02, meshGrilleMat, false);

  // 4 Vertical Corner Pillars (with sleek architectural proportions)
  addBox(caseGroup, 0.065, 2.24, 0.085, -0.49, 0.015, 1.04, chassisMat);
  addBox(caseGroup, 0.065, 2.24, 0.085, 0.49, 0.015, 1.04, chassisMat);
  addBox(caseGroup, 0.065, 2.24, 0.085, -0.49, 0.015, -1.04, chassisMat);
  addBox(caseGroup, 0.065, 2.24, 0.085, 0.49, 0.015, -1.04, chassisMat);

  // Horizontal Top/Bottom Left Window Rails
  addBox(caseGroup, 0.04, 0.06, 2.02, -0.49, 1.07, 0, accentMetalMat);
  addBox(caseGroup, 0.04, 0.06, 2.02, -0.49, -1.04, 0, accentMetalMat);

  // Right Solid Aluminum Side Panel (x = +0.50)
  addBox(caseGroup, 0.03, 2.16, 2.04, 0.505, 0.015, 0, chassisMat);

  // Motherboard Spine Tray (x = +0.26)
  addBox(caseGroup, 0.025, 1.68, 1.68, 0.26, 0.2, -0.16, darkTrimMat);
  // Cable-management grommet collars along front of motherboard tray
  for (let gy = -0.35; gy <= 0.65; gy += 0.34) {
    addBox(caseGroup, 0.04, 0.18, 0.08, 0.255, gy, 0.34, darkTrimMat, false);
  }

  // Lower PSU Shroud Deck (y = -0.68, z = -1.02 to +0.58)
  addBox(caseGroup, 0.74, 0.03, 1.64, -0.11, -0.68, -0.22, chassisMat);
  // PSU Shroud Side Wall with cutaway window for PSU badge
  addBox(caseGroup, 0.025, 0.38, 0.85, -0.47, -0.88, 0.16, chassisMat);
  addBox(caseGroup, 0.025, 0.11, 0.78, -0.47, -0.74, -0.64, chassisMat);

  // Rear Panel Wall (z = -1.05) with I/O cutout & PCIe frame
  addBox(caseGroup, 0.94, 0.38, 0.03, 0, -0.88, -1.05, chassisMat);
  addBox(caseGroup, 0.38, 1.76, 0.03, 0.28, 0.18, -1.05, chassisMat);
  addBox(caseGroup, 0.58, 0.32, 0.03, -0.19, 0.92, -1.05, chassisMat);
  // 7 PCIe Expansion Slot Brackets (rear)
  for (let s = 0; s < 7; s++) {
    addBox(caseGroup, 0.36, 0.038, 0.02, -0.18, -0.02 - s * 0.075, -1.05, accentMetalMat, false);
  }

  // Front Intake Frame & Vertical Mesh Louvers (z = +1.05)
  addBox(caseGroup, 0.92, 0.14, 0.04, 0, 1.02, 1.05, chassisMat);
  addBox(caseGroup, 0.92, 0.18, 0.04, 0, -0.97, 1.05, chassisMat);
  addBox(caseGroup, 0.86, 1.84, 0.015, 0, 0.02, 1.04, meshGrilleMat, false);

  // 4 CNC Machined Aluminum Feet
  const footGeo = trackGeo(new THREE.CylinderGeometry(0.085, 0.095, 0.07, 24));
  const footCoords: [number, number][] = [
    [-0.38, 0.86],
    [0.38, 0.86],
    [-0.38, -0.86],
    [0.38, -0.86],
  ];
  footCoords.forEach(([fx, fz]) => {
    const foot = new THREE.Mesh(footGeo, accentMetalMat);
    foot.position.set(fx, -1.145, fz);
    foot.castShadow = true;
    caseGroup.add(foot);
  });

  // Case Decorative RGB Light Strips (Top inner rail + PSU shroud lip + Front edge)
  addBox(caseGroup, 0.018, 0.018, 1.86, -0.45, 1.05, 0, caseRgbMat, false);
  addBox(caseGroup, 0.018, 0.018, 1.62, -0.47, -0.665, -0.22, caseRgbMat, false);
  addBox(caseGroup, 0.018, 1.92, 0.018, -0.455, 0.02, 1.0, caseRgbMat, false);

  // Instanced Chassis Fastener Screws (24 hex bolts along frame corners)
  const screwGeo = trackGeo(new THREE.CylinderGeometry(0.012, 0.012, 0.016, 6));
  screwGeo.rotateZ(Math.PI / 2);
  const screwCount = 16;
  const screwInst = new THREE.InstancedMesh(screwGeo, nickelMat, screwCount);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < screwCount; i++) {
    const side = i < 8 ? 1 : -1;
    const row = i % 4;
    const col = Math.floor((i % 8) / 4);
    dummy.position.set(-0.495, -0.9 + row * 0.62, side * (0.98 - col * 0.14));
    dummy.updateMatrix();
    screwInst.setMatrixAt(i, dummy.matrix);
  }
  screwInst.instanceMatrix.needsUpdate = true;
  screwInst.computeBoundingSphere();
  caseGroup.add(screwInst);

  tagComponent(caseGroup, 'case');
  root.add(caseGroup);

  // =========================================================================
  // 2. MOTHERBOARD (x: +0.20, y: +0.12, z: -0.34)
  // =========================================================================
  const motherboardGroup = new THREE.Group();
  motherboardGroup.name = 'motherboard';

  // 8-Layer Matte PCB
  addBox(motherboardGroup, 0.022, 1.38, 1.16, 0.21, 0.12, -0.34, pcbMat);
  // Left VRM Heatsink & Rear I/O Armor Block
  addBox(motherboardGroup, 0.085, 0.56, 0.2, 0.16, 0.48, -0.8, accentMetalMat);
  // Top VRM Finned Heatsink
  addBox(motherboardGroup, 0.075, 0.14, 0.44, 0.165, 0.72, -0.45, accentMetalMat);
  // Sculpted Chipset Armor Plate
  addBox(motherboardGroup, 0.04, 0.36, 0.38, 0.18, -0.34, 0.02, shroudMat);
  // Subtle Motherboard RGB Accent Slit on I/O Armor & Chipset
  addBox(motherboardGroup, 0.012, 0.38, 0.022, 0.116, 0.48, -0.78, interiorRgbMat, false);
  addBox(motherboardGroup, 0.012, 0.022, 0.26, 0.158, -0.34, 0.02, interiorRgbMat, false);

  // Dual Steel-Reinforced PCIe x16 Slots
  addBox(motherboardGroup, 0.032, 0.03, 0.42, 0.185, -0.14, -0.56, nickelMat);
  addBox(motherboardGroup, 0.032, 0.03, 0.42, 0.185, -0.38, -0.56, nickelMat);

  // 24-Pin ATX & Dual 8-Pin EPS Power Headers
  addBox(motherboardGroup, 0.045, 0.22, 0.055, 0.18, 0.22, 0.18, darkTrimMat);
  addBox(motherboardGroup, 0.045, 0.06, 0.14, 0.18, 0.76, -0.76, darkTrimMat);

  // Instanced SMD Chokes & Solid Capacitors (24 instances)
  const capGeo = trackGeo(new THREE.CylinderGeometry(0.014, 0.014, 0.028, 12));
  capGeo.rotateZ(Math.PI / 2);
  const capInst = new THREE.InstancedMesh(capGeo, nickelMat, 24);
  for (let i = 0; i < 24; i++) {
    if (i < 12) {
      // Vertical VRM row
      dummy.position.set(0.185, 0.18 + i * 0.042, -0.66);
    } else {
      // Top VRM row
      dummy.position.set(0.185, 0.62, -0.64 + (i - 12) * 0.042);
    }
    dummy.updateMatrix();
    capInst.setMatrixAt(i, dummy.matrix);
  }
  capInst.instanceMatrix.needsUpdate = true;
  capInst.computeBoundingSphere();
  motherboardGroup.add(capInst);

  tagComponent(motherboardGroup, 'motherboard');
  root.add(motherboardGroup);

  // =========================================================================
  // 3. PROCESSOR (CPU) at (x: +0.18, y: +0.40, z: -0.40)
  // =========================================================================
  const processorGroup = new THREE.Group();
  processorGroup.name = 'processor';

  // Socket Retention Frame
  addBox(processorGroup, 0.022, 0.24, 0.24, 0.19, 0.4, -0.4, darkTrimMat);
  // Green/Obsidian Silicon Substrate Wafer
  addBox(processorGroup, 0.014, 0.19, 0.19, 0.178, 0.4, -0.4, trackMat(new THREE.MeshStandardMaterial({ color: '#1b3b2b', roughness: 0.4, metalness: 0.2 })));
  // Nickel-Plated Copper IHS (Stepped bevel silhouette)
  addBox(processorGroup, 0.018, 0.155, 0.155, 0.165, 0.4, -0.4, nickelMat);
  addBox(processorGroup, 0.01, 0.11, 0.11, 0.157, 0.4, -0.4, nickelMat);

  tagComponent(processorGroup, 'processor');
  root.add(processorGroup);

  // =========================================================================
  // 4. MEMORY (4x DDR5 Modules) at (x: +0.14, y: +0.40, z: [-0.08, +0.10])
  // =========================================================================
  const memoryGroup = new THREE.Group();
  memoryGroup.name = 'memory';

  for (let i = 0; i < 4; i++) {
    const mz = -0.07 + i * 0.052;
    // DIMM Slot Base
    addBox(memoryGroup, 0.025, 0.36, 0.022, 0.188, 0.4, mz, darkTrimMat);
    // CNC Fluted Aluminum Heatspreader
    addBox(memoryGroup, 0.125, 0.34, 0.022, 0.13, 0.4, mz, accentMetalMat);
    // Top Frosted Acrylic RGB Diffuser Light Bar
    addBox(memoryGroup, 0.026, 0.33, 0.02, 0.062, 0.4, mz, interiorRgbMat, false);
  }

  tagComponent(memoryGroup, 'memory');
  root.add(memoryGroup);

  // =========================================================================
  // 5. STORAGE (Chronos Gen5 NVMe M.2) at (x: +0.16, y: +0.04, z: -0.34)
  // =========================================================================
  const storageGroup = new THREE.Group();
  storageGroup.name = 'storage';

  // M.2 PCB + Finned Anodized Thermal Shield
  addBox(storageGroup, 0.016, 0.09, 0.36, 0.185, 0.04, -0.34, darkTrimMat);
  addBox(storageGroup, 0.042, 0.085, 0.34, 0.162, 0.04, -0.34, accentMetalMat);
  // Micro-finned ridges along NVMe heatsink
  for (let f = 0; f < 4; f++) {
    addBox(storageGroup, 0.012, 0.012, 0.32, 0.138, 0.015 + f * 0.018, -0.34, nickelMat, false);
  }
  addBox(storageGroup, 0.01, 0.012, 0.14, 0.136, 0.04, -0.28, interiorRgbMat, false);

  tagComponent(storageGroup, 'storage');
  root.add(storageGroup);

  // =========================================================================
  // 6. GRAPHICS CARD (Valkyrie Triple-Axial GPU) at (y: -0.15)
  // =========================================================================
  const gpuGroup = new THREE.Group();
  gpuGroup.name = 'gpu';

  // Top Perforated Brushed Backplate
  addBox(gpuGroup, 0.48, 0.018, 1.38, -0.05, -0.06, -0.22, shroudMat);
  // Main Anodized Chamfered Shroud Body
  addBox(gpuGroup, 0.46, 0.15, 1.36, -0.05, -0.15, -0.22, accentMetalMat);
  // Side Exposed Edge RGB Light Blade
  addBox(gpuGroup, 0.016, 0.026, 1.18, -0.285, -0.125, -0.22, interiorRgbMat, false);

  // Instanced Heatsink Cooling Fins (36 aluminum fins visible between shroud & backplate)
  const finGeo = trackGeo(new THREE.BoxGeometry(0.43, 0.11, 0.012));
  const finInst = new THREE.InstancedMesh(finGeo, nickelMat, 36);
  for (let i = 0; i < 36; i++) {
    dummy.position.set(-0.04, -0.145, -0.84 + i * 0.036);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    finInst.setMatrixAt(i, dummy.matrix);
  }
  finInst.instanceMatrix.needsUpdate = true;
  finInst.computeBoundingSphere();
  gpuGroup.add(finInst);

  // 3 Exposed Copper Heatpipes running along outer GPU spine
  for (let p = 0; p < 3; p++) {
    const pipeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.22, -0.17 + p * 0.026, -0.86),
      new THREE.Vector3(-0.27, -0.17 + p * 0.026, -0.22),
      new THREE.Vector3(-0.22, -0.17 + p * 0.026, 0.42),
    ]);
    const pipeGeo = trackGeo(new THREE.TubeGeometry(pipeCurve, 24, 0.011, 8, false));
    const pipeMesh = new THREE.Mesh(pipeGeo, copperMat);
    gpuGroup.add(pipeMesh);
  }

  // 3 Underside Axial GPU Fans (facing downward -Y)
  const gpuFanRingGeo = trackGeo(new THREE.CylinderGeometry(0.16, 0.16, 0.022, 24, 1, true));
  const gpuHubGeo = trackGeo(new THREE.CylinderGeometry(0.05, 0.05, 0.026, 16));
  for (let f = 0; f < 3; f++) {
    const fz = -0.64 + f * 0.42;
    const fanRing = new THREE.Mesh(gpuFanRingGeo, darkTrimMat);
    fanRing.position.set(-0.05, -0.228, fz);
    gpuGroup.add(fanRing);

    const spinner = new THREE.Group();
    spinner.position.set(-0.05, -0.23, fz);
    const hub = new THREE.Mesh(gpuHubGeo, nickelMat);
    spinner.add(hub);
    for (let b = 0; b < 7; b++) {
      const blade = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.11, 0.008, 0.035)), fanBladeMat);
      const angle = (b / 7) * Math.PI * 2;
      blade.position.set(Math.cos(angle) * 0.085, 0, Math.sin(angle) * 0.085);
      blade.rotation.set(0.35, -angle, 0);
      spinner.add(blade);
    }
    fanSpinners.push(spinner);
    gpuGroup.add(spinner);
  }

  tagComponent(gpuGroup, 'gpu');
  root.add(gpuGroup);

  // =========================================================================
  // 7. LIQUID COOLING SYSTEM (360mm Radiator + Pump + Braided Tubes)
  // =========================================================================
  const coolingGroup = new THREE.Group();
  coolingGroup.name = 'cooling';

  // Top 360mm Radiator Core (y = +1.00)
  addBox(coolingGroup, 0.48, 0.095, 1.56, -0.05, 1.0, -0.02, darkTrimMat);
  // Radiator Aluminum End-Tanks
  addBox(coolingGroup, 0.485, 0.105, 0.12, -0.05, 1.0, 0.72, accentMetalMat);
  addBox(coolingGroup, 0.485, 0.105, 0.12, -0.05, 1.0, -0.76, accentMetalMat);

  // CPU Pump / Cold-Plate Block mounted over CPU (x: +0.10, y: +0.40, z: -0.40)
  const pumpBody = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.135, 0.145, 0.11, 28)),
    shroudMat
  );
  pumpBody.rotation.z = Math.PI / 2;
  pumpBody.position.set(0.1, 0.4, -0.4);
  pumpBody.castShadow = true;
  coolingGroup.add(pumpBody);

  // Copper Cold-Plate Collar
  const coldPlate = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.148, 0.148, 0.025, 28)),
    copperMat
  );
  coldPlate.rotation.z = Math.PI / 2;
  coldPlate.position.set(0.145, 0.4, -0.4);
  coolingGroup.add(coldPlate);

  // Halo RGB Infinity Ring on Pump Face
  const pumpHalo = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(0.105, 0.012, 12, 32)),
    interiorRgbMat
  );
  pumpHalo.rotation.y = Math.PI / 2;
  pumpHalo.position.set(0.042, 0.4, -0.4);
  coolingGroup.add(pumpHalo);

  // Dual Braided EPDM Coolant Tubes curving from Pump to Top-Front Radiator Tank
  const tubeCurve1 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.08, 0.44, -0.28),
    new THREE.Vector3(-0.08, 0.56, 0.08),
    new THREE.Vector3(-0.14, 0.78, 0.42),
    new THREE.Vector3(-0.08, 0.96, 0.68),
  ]);
  const tubeCurve2 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.08, 0.36, -0.28),
    new THREE.Vector3(-0.12, 0.46, 0.12),
    new THREE.Vector3(-0.18, 0.72, 0.48),
    new THREE.Vector3(-0.02, 0.96, 0.71),
  ]);

  [tubeCurve1, tubeCurve2].forEach((curve) => {
    const tube = new THREE.Mesh(
      trackGeo(new THREE.TubeGeometry(curve, 32, 0.024, 12, false)),
      cableMat
    );
    tube.castShadow = true;
    coolingGroup.add(tube);
  });

  tagComponent(coolingGroup, 'cooling');
  root.add(coolingGroup);

  // =========================================================================
  // 8. COOLING FANS (7 x 120mm RGB Static-Pressure Fans)
  // =========================================================================
  const fansGroup = new THREE.Group();
  fansGroup.name = 'fans';

  const create120Fan = (
    x: number,
    y: number,
    z: number,
    rotX: number,
    rotY: number,
    rotZ: number
  ) => {
    const fan = new THREE.Group();
    fan.position.set(x, y, z);
    fan.rotation.set(rotX, rotY, rotZ);

    // Outer Square Frame (4 segments forming housing)
    addBox(fan, 0.46, 0.04, 0.075, 0, 0.21, 0, darkTrimMat, false);
    addBox(fan, 0.46, 0.04, 0.075, 0, -0.21, 0, darkTrimMat, false);
    addBox(fan, 0.04, 0.46, 0.075, 0.21, 0, 0, darkTrimMat, false);
    addBox(fan, 0.04, 0.46, 0.075, -0.21, 0, 0, darkTrimMat, false);

    // Glowing RGB Halo Ring
    const ring = new THREE.Mesh(trackGeo(new THREE.TorusGeometry(0.185, 0.013, 10, 28)), fanRgbMat);
    ring.position.z = 0.026;
    fan.add(ring);

    // Spinning Blade Rotor
    const rotor = new THREE.Group();
    const hub = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 20)),
      accentMetalMat
    );
    hub.rotation.x = Math.PI / 2;
    rotor.add(hub);

    const bladeGeo = trackGeo(new THREE.BoxGeometry(0.14, 0.042, 0.008));
    for (let b = 0; b < 7; b++) {
      const blade = new THREE.Mesh(bladeGeo, fanBladeMat);
      const a = (b / 7) * Math.PI * 2;
      blade.position.set(Math.cos(a) * 0.115, Math.sin(a) * 0.115, 0);
      blade.rotation.set(0.45, 0, a);
      rotor.add(blade);
    }

    fanSpinners.push(rotor);
    fan.add(rotor);
    fansGroup.add(fan);
  };

  // 3 Front Intake Fans (facing +Z / inward -Z)
  create120Fan(-0.04, 0.64, 0.96, 0, 0, 0);
  create120Fan(-0.04, 0.16, 0.96, 0, 0, 0);
  create120Fan(-0.04, -0.32, 0.96, 0, 0, 0);

  // 3 Top Radiator Fans (facing downward into chassis)
  create120Fan(-0.05, 0.91, -0.48, Math.PI / 2, 0, 0);
  create120Fan(-0.05, 0.91, 0.0, Math.PI / 2, 0, 0);
  create120Fan(-0.05, 0.91, 0.48, Math.PI / 2, 0, 0);

  // 1 Rear Exhaust Fan
  create120Fan(-0.08, 0.46, -0.99, 0, 0, 0);

  tagComponent(fansGroup, 'cooling');
  root.add(fansGroup);

  // =========================================================================
  // 9. POWER SUPPLY & SLEEVED CABLE MANAGEMENT (y: -0.89, z: -0.58)
  // =========================================================================
  const psuGroup = new THREE.Group();
  psuGroup.name = 'psu';

  // Main PSU Unit inside lower chamber
  addBox(psuGroup, 0.56, 0.32, 0.72, -0.08, -0.9, -0.62, darkTrimMat);
  // Brushed Side Nameplate Badge visible through shroud cutout
  addBox(psuGroup, 0.015, 0.19, 0.54, -0.365, -0.9, -0.62, accentMetalMat);
  addBox(psuGroup, 0.012, 0.018, 0.42, -0.372, -0.85, -0.62, interiorRgbMat, false);

  // Custom Sleeved 24-Pin ATX Cable Bundle (Tray grommet -> Motherboard 24-pin)
  const atxCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.24, 0.22, 0.34),
    new THREE.Vector3(0.1, 0.22, 0.28),
    new THREE.Vector3(0.14, 0.22, 0.2),
    new THREE.Vector3(0.18, 0.22, 0.18),
  ]);
  const atxCable = new THREE.Mesh(
    trackGeo(new THREE.TubeGeometry(atxCurve, 20, 0.032, 10, false)),
    cableMat
  );
  psuGroup.add(atxCable);

  // Custom Sleeved 16-Pin GPU Power Harness (PSU Shroud -> GPU 12VHPWR)
  const gpuCableCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.14, -0.68, 0.14),
    new THREE.Vector3(-0.32, -0.44, 0.22),
    new THREE.Vector3(-0.28, -0.22, 0.18),
    new THREE.Vector3(-0.22, -0.14, 0.14),
  ]);
  const gpuCable = new THREE.Mesh(
    trackGeo(new THREE.TubeGeometry(gpuCableCurve, 24, 0.022, 10, false)),
    cableMat
  );
  psuGroup.add(gpuCable);

  // Machined Aluminum Cable Combs on GPU & ATX Harnesses
  addBox(psuGroup, 0.056, 0.02, 0.06, -0.3, -0.34, 0.21, nickelMat, false);
  addBox(psuGroup, 0.03, 0.08, 0.08, 0.12, 0.22, 0.26, nickelMat, false);

  tagComponent(psuGroup, 'psu');
  root.add(psuGroup);

  // =========================================================================
  // 10. TEMPERED GLASS PANELS (Left Panoramic Window + Front Glass Bezel)
  // =========================================================================
  const glassGroup = new THREE.Group();
  glassGroup.name = 'glass';

  // Left Side Panoramic Glass Panel (x = -0.51)
  const leftGlass = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.018, 2.08, 2.02)), glassMat);
  leftGlass.position.set(-0.515, 0.015, 0);
  leftGlass.renderOrder = 10;
  glassGroup.add(leftGlass);

  // Ceramic Frit Perimeter Trim on Left Glass
  addBox(glassGroup, 0.022, 0.045, 2.02, -0.515, 1.035, 0, darkTrimMat, false);
  addBox(glassGroup, 0.022, 0.045, 2.02, -0.515, -1.005, 0, darkTrimMat, false);
  addBox(glassGroup, 0.022, 2.04, 0.045, -0.515, 0.015, 0.985, darkTrimMat, false);
  addBox(glassGroup, 0.022, 2.04, 0.045, -0.515, 0.015, -0.985, darkTrimMat, false);

  // 4 Machined Thumbscrew Standoffs
  const thumbGeo = trackGeo(new THREE.CylinderGeometry(0.022, 0.022, 0.028, 16));
  thumbGeo.rotateZ(Math.PI / 2);
  [
    [-0.525, 0.96, 0.92],
    [-0.525, 0.96, -0.92],
    [-0.525, -0.93, 0.92],
    [-0.525, -0.93, -0.92],
  ].forEach(([tx, ty, tz]) => {
    const t = new THREE.Mesh(thumbGeo, nickelMat);
    t.position.set(tx, ty, tz);
    glassGroup.add(t);
  });

  // Front Accent Glass Bezel Strip (leaving airflow perimeter unobstructed)
  const frontGlass = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.84, 1.84, 0.016)), glassMat);
  frontGlass.position.set(0, 0.02, 1.065);
  frontGlass.renderOrder = 10;
  glassGroup.add(frontGlass);

  tagComponent(glassGroup, 'glass');
  root.add(glassGroup);

  // =========================================================================
  // 11. DYNAMIC INTERNAL RGB POINT LIGHTS
  // =========================================================================
  const interiorPointLight = new THREE.PointLight('#C5A5FF', 2.4, 3.2, 1.6);
  interiorPointLight.position.set(-0.18, 0.25, 0.15);
  root.add(interiorPointLight);

  const casePointLight = new THREE.PointLight('#C5A5FF', 1.6, 2.8, 1.6);
  casePointLight.position.set(-0.2, -0.45, 0.55);
  root.add(casePointLight);

  const partMap: Record<ComponentId, THREE.Group> = {
    case: caseGroup,
    motherboard: motherboardGroup,
    processor: processorGroup,
    memory: memoryGroup,
    storage: storageGroup,
    gpu: gpuGroup,
    cooling: coolingGroup,
    fans: fansGroup,
    psu: psuGroup,
    glass: glassGroup,
  };

  const updateRGB = (rgb: RGBConfig, elapsed: number) => {
    if (!rgb.enabled) {
      caseRgbMat.emissiveIntensity = 0;
      fanRgbMat.emissiveIntensity = 0;
      interiorRgbMat.emissiveIntensity = 0;
      casePointLight.intensity = 0;
      interiorPointLight.intensity = 0;
      return;
    }

    if (rgb.spectrumMode) {
      const h1 = (elapsed * 0.12) % 1;
      const h2 = (elapsed * 0.12 + 0.35) % 1;
      const h3 = (elapsed * 0.12 + 0.65) % 1;
      _colorA.setHSL(h1, 0.85, 0.62);
      _colorB.setHSL(h2, 0.85, 0.62);
      _tempColor.setHSL(h3, 0.85, 0.62);
      caseRgbMat.emissive.copy(_colorA);
      fanRgbMat.emissive.copy(_colorB);
      interiorRgbMat.emissive.copy(_tempColor);
      casePointLight.color.copy(_colorA);
      interiorPointLight.color.copy(_colorB);
    } else {
      _colorA.set(rgb.color);
      _colorB.set(rgb.secondaryColor || rgb.color);
      caseRgbMat.emissive.copy(_colorA);
      fanRgbMat.emissive.copy(_colorA);
      interiorRgbMat.emissive.copy(_colorB);
      casePointLight.color.copy(_colorA);
      interiorPointLight.color.copy(_colorB);
    }

    const base = Math.max(0, rgb.intensity);
    caseRgbMat.emissiveIntensity = rgb.caseIllumination ? base * 2.1 : 0;
    fanRgbMat.emissiveIntensity = rgb.fanLighting ? base * 2.0 : 0;
    interiorRgbMat.emissiveIntensity = rgb.interiorLighting ? base * 2.2 : 0;

    casePointLight.intensity = rgb.caseIllumination ? base * 1.6 : 0;
    interiorPointLight.intensity = rgb.interiorLighting ? base * 2.6 : 0;
  };

  const setGlassVisible = (visible: boolean) => {
    glassGroup.visible = visible;
  };

  const setHighlight = (highlighted: ComponentId | null, elapsed: number) => {
    const pulse = 0.25 + Math.sin(elapsed * 4.5) * 0.12;
    (Object.keys(partMap) as ComponentId[]).forEach((key) => {
      const grp = partMap[key];
      const isMatch = highlighted === key || (highlighted === 'cooling' && key === 'fans');
      grp.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (!mat || mat === caseRgbMat || mat === fanRgbMat || mat === interiorRgbMat || mat === glassMat) {
            return;
          }
          if (!mesh.userData._baseEmissiveStored) {
            mesh.userData._baseEmissive = mat.emissive ? mat.emissive.getHex() : 0x000000;
            mesh.userData._baseEmissiveIntensity = mat.emissiveIntensity ?? 0;
            mesh.userData._baseEmissiveStored = true;
          }
          // Note: materials are shared across meshes, so only apply highlight boost when isolated or per-part material
          // To avoid tinting shared materials across other components, we handle highlight via subtle scale lift & point focus!
        }
      });
      if (highlighted) {
        const targetScale = isMatch ? 1.022 + pulse * 0.015 : 1.0;
        grp.scale.setScalar(THREE.MathUtils.lerp(grp.scale.x, targetScale, 0.14));
      } else {
        grp.scale.setScalar(THREE.MathUtils.lerp(grp.scale.x, 1.0, 0.14));
      }
    });
  };

  const dispose = () => {
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
  };

  return {
    root,
    caseGroup,
    motherboardGroup,
    processorGroup,
    memoryGroup,
    storageGroup,
    gpuGroup,
    coolingGroup,
    fansGroup,
    psuGroup,
    glassGroup,
    partMap,
    fanSpinners,
    caseRgbMaterials,
    fanRgbMaterials,
    interiorRgbMaterials,
    casePointLight,
    interiorPointLight,
    updateRGB,
    setGlassVisible,
    setHighlight,
    dispose,
  };
}
