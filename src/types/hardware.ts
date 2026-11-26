export type ComponentId =
  | 'processor'
  | 'gpu'
  | 'motherboard'
  | 'memory'
  | 'storage'
  | 'cooling'
  | 'psu'
  | 'case'
  | 'fans'
  | 'glass';

export type CameraPreset = 'perspective' | 'front' | 'side' | 'interior';

export type ViewerMode = 'assembled' | 'exploded' | 'focus';

export interface RGBConfig {
  color: string;
  secondaryColor?: string;
  intensity: number;
  enabled: boolean;
  caseIllumination: boolean;
  fanLighting: boolean;
  interiorLighting: boolean;
  spectrumMode?: boolean;
}

export interface RGBPreset {
  id: string;
  number: string;
  name: string;
  color: string;
  secondaryColor?: string;
  spectrumMode?: boolean;
}

export interface ComponentSpec {
  label: string;
  value: string;
}

export interface HardwareComponentInfo {
  id: ComponentId;
  number: string;
  name: string;
  category: string;
  shortDescription: string;
  materialFinish: string;
  specs: ComponentSpec[];
  cameraTarget: {
    position: [number, number, number];
    lookAt: [number, number, number];
  };
  explodeOffset: [number, number, number];
}

export interface BuildMaterials {
  chassisColor: string;
  chassisMetalness: number;
  chassisRoughness: number;
  chassisFinishName: string;
  accentMetalColor: string;
  pcbColor: string;
  glassTint: string;
  glassOpacity: number;
  cableColor: string;
  shroudColor: string;
  fanBladeColor: string;
}

export interface BuildPerformanceProfile {
  gamingCategory: string;
  graphicsArchitecture: string;
  coolingArchitecture: string;
  storageTechnology: string;
  ratings: {
    graphicsHeadroom: number;
    thermalDissipation: number;
    acousticRefinement: number;
    memoryBandwidth: number;
    storageThroughput: number;
  };
}

export interface PCBuildProject {
  slug: string;
  number: string;
  name: string;
  subtitle: string;
  shortDescription: string;
  fullDescription: string;
  visualTheme: string;
  accentColor: string;
  defaultRGB: RGBConfig;
  materials: BuildMaterials;
  materialNotes: {
    title: string;
    finish: string;
    detail: string;
  }[];
  specs: {
    category: string;
    component: string;
    detail: string;
  }[];
  performance: BuildPerformanceProfile;
}
