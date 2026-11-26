import * as THREE from 'three';

let cachedSoftwareGl: boolean | null = null;

export function detectSoftwareWebGL(): boolean {
  if (cachedSoftwareGl !== null) return cachedSoftwareGl;
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) {
      cachedSoftwareGl = true;
      return true;
    }
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    cachedSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    return cachedSoftwareGl;
  } catch {
    cachedSoftwareGl = true;
    return true;
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export interface ProceduralTextures {
  brushedMetalRoughness: THREE.CanvasTexture;
  pcbMap: THREE.CanvasTexture;
  meshAlphaMap: THREE.CanvasTexture;
  contactShadowMap: THREE.CanvasTexture;
  dispose: () => void;
}

export function createProceduralTextures(maxAnisotropy = 4): ProceduralTextures {
  // 1. Brushed metal grain roughness map (linear data texture)
  const metalCanvas = document.createElement('canvas');
  metalCanvas.width = 512;
  metalCanvas.height = 512;
  const mCtx = metalCanvas.getContext('2d')!;
  mCtx.fillStyle = '#808080';
  mCtx.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y++) {
    const v = 108 + Math.floor((Math.sin(y * 0.7) * 0.5 + Math.random() * 0.5) * 48);
    mCtx.fillStyle = `rgb(${v},${v},${v})`;
    mCtx.fillRect(0, y, 512, 1);
  }
  const brushedMetalRoughness = new THREE.CanvasTexture(metalCanvas);
  brushedMetalRoughness.wrapS = THREE.RepeatWrapping;
  brushedMetalRoughness.wrapT = THREE.RepeatWrapping;
  brushedMetalRoughness.repeat.set(2, 2);
  brushedMetalRoughness.anisotropy = maxAnisotropy;

  // 2. Motherboard PCB trace & silkscreen texture (sRGB)
  const pcbCanvas = document.createElement('canvas');
  pcbCanvas.width = 512;
  pcbCanvas.height = 512;
  const pCtx = pcbCanvas.getContext('2d')!;
  pCtx.fillStyle = '#0e1118';
  pCtx.fillRect(0, 0, 512, 512);

  // Subtle circuit trace lines
  pCtx.strokeStyle = 'rgba(130, 145, 170, 0.18)';
  pCtx.lineWidth = 1.5;
  for (let i = 0; i < 42; i++) {
    const x0 = 20 + ((i * 37) % 460);
    const y0 = 20 + ((i * 53) % 460);
    pCtx.beginPath();
    pCtx.moveTo(x0, y0);
    pCtx.lineTo(x0 + 40, y0);
    pCtx.lineTo(x0 + 65, y0 + 25);
    pCtx.lineTo(x0 + 115, y0 + 25);
    pCtx.stroke();
  }
  // Silkscreen alignment crosses and technical markings
  pCtx.strokeStyle = 'rgba(220, 230, 245, 0.25)';
  pCtx.lineWidth = 1;
  for (let gx = 64; gx < 512; gx += 128) {
    for (let gy = 64; gy < 512; gy += 128) {
      pCtx.beginPath();
      pCtx.moveTo(gx - 6, gy);
      pCtx.lineTo(gx + 6, gy);
      pCtx.moveTo(gx, gy - 6);
      pCtx.lineTo(gx, gy + 6);
      pCtx.stroke();
    }
  }
  // Copper solder pads
  pCtx.fillStyle = 'rgba(198, 165, 110, 0.35)';
  for (let i = 0; i < 80; i++) {
    const px = (i * 73) % 490 + 10;
    const py = (i * 97) % 490 + 10;
    pCtx.beginPath();
    pCtx.arc(px, py, 2, 0, Math.PI * 2);
    pCtx.fill();
  }
  const pcbMap = new THREE.CanvasTexture(pcbCanvas);
  pcbMap.colorSpace = THREE.SRGBColorSpace;
  pcbMap.anisotropy = maxAnisotropy;

  // 3. Perforated airflow grille alpha/pattern texture
  const meshCanvas = document.createElement('canvas');
  meshCanvas.width = 128;
  meshCanvas.height = 128;
  const gCtx = meshCanvas.getContext('2d')!;
  gCtx.fillStyle = '#ffffff';
  gCtx.fillRect(0, 0, 128, 128);
  gCtx.fillStyle = '#181818';
  const step = 16;
  for (let y = 0; y < 128; y += step) {
    for (let x = 0; x < 128; x += step) {
      const offset = (y / step) % 2 === 0 ? 0 : step / 2;
      gCtx.beginPath();
      gCtx.arc((x + offset) % 128, y + step / 2, 4.5, 0, Math.PI * 2);
      gCtx.fill();
    }
  }
  const meshAlphaMap = new THREE.CanvasTexture(meshCanvas);
  meshAlphaMap.wrapS = THREE.RepeatWrapping;
  meshAlphaMap.wrapT = THREE.RepeatWrapping;
  meshAlphaMap.repeat.set(8, 14);
  meshAlphaMap.anisotropy = maxAnisotropy;

  // 4. Radial contact shadow texture for grounded studio presentation
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 256;
  shadowCanvas.height = 256;
  const sCtx = shadowCanvas.getContext('2d')!;
  const grad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 124);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.78)');
  grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.35)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  sCtx.fillStyle = grad;
  sCtx.fillRect(0, 0, 256, 256);
  const contactShadowMap = new THREE.CanvasTexture(shadowCanvas);

  return {
    brushedMetalRoughness,
    pcbMap,
    meshAlphaMap,
    contactShadowMap,
    dispose: () => {
      brushedMetalRoughness.dispose();
      pcbMap.dispose();
      meshAlphaMap.dispose();
      contactShadowMap.dispose();
    },
  };
}
