import { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff, Layers, RotateCcw, Sun } from 'lucide-react';
import { HARDWARE_COMPONENTS } from '../../data/components';
import {
  CameraPreset,
  ComponentId,
  PCBuildProject,
  RGBConfig,
} from '../../types/hardware';
import PCModel from './PCModel';
import PCScene from './PCScene';

interface BuildViewerProps {
  build: PCBuildProject;
  title?: string;
  subtitle?: string;
}

const CAMERA_PRESETS: { id: CameraPreset; label: string }[] = [
  { id: 'perspective', label: 'Perspective' },
  { id: 'front', label: 'Front' },
  { id: 'side', label: 'Side' },
  { id: 'interior', label: 'Interior' },
];

export default function BuildViewer({
  build,
  title = 'Interactive 3D PC Viewer',
  subtitle = 'Drag to orbit, scroll to zoom, switch camera angles, or click any component inside the chassis.',
}: BuildViewerProps) {
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('perspective');
  const [glassVisible, setGlassVisible] = useState(true);
  const [rgbEnabled, setRgbEnabled] = useState(build.defaultRGB.enabled);
  const [exploded, setExploded] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<ComponentId | null>(null);
  const [hoveredComponent, setHoveredComponent] = useState<ComponentId | null>(null);
  const [dockCollapsed, setDockCollapsed] = useState(false);

  const activeRgb: RGBConfig = {
    ...build.defaultRGB,
    enabled: rgbEnabled,
  };

  const selectedInfo = selectedComponent
    ? HARDWARE_COMPONENTS.find((c) => c.id === selectedComponent)
    : null;
  const hoveredInfo = hoveredComponent
    ? HARDWARE_COMPONENTS.find((c) => c.id === hoveredComponent)
    : null;

  const handleReset = () => {
    setSelectedComponent(null);
    setCameraPreset('perspective');
    setExploded(false);
    setGlassVisible(true);
    setRgbEnabled(build.defaultRGB.enabled);
  };

  return (
    <div className="relative h-[640px] w-full overflow-hidden rounded-xl border border-white/10 bg-[#07090D] lg:h-[720px]">
      {/* Live 3D Viewport */}
      <PCScene
        cameraPreset={cameraPreset}
        focusedComponent={selectedComponent}
        enableOrbit
      >
        <PCModel
          materials={build.materials}
          rgbConfig={activeRgb}
          glassVisible={glassVisible}
          explodeAmount={exploded ? 0.92 : 0}
          highlightedComponent={selectedComponent ?? hoveredComponent}
          onSelectComponent={(id) =>
            setSelectedComponent((prev) => (prev === id ? null : id))
          }
          onHoverComponent={setHoveredComponent}
        />
      </PCScene>

      {/* Top-Left Minimal Viewer Heading */}
      <div className="pointer-events-none absolute top-5 left-5 z-10 max-w-sm rounded-lg border border-white/10 bg-[#07090D]/90 px-4 py-3">
        <p className="text-[11px] font-medium tracking-[0.14em] text-[#C5A5FF]">
          {build.number} · {build.name}
        </p>
        <h3 className="font-display mt-0.5 text-base font-semibold text-[#F5F6F8]">
          {title}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-[#929BA8]">{subtitle}</p>
      </div>

      {/* Top-Right Hover / Selected Component Readout */}
      {(selectedInfo || hoveredInfo) && (
        <div className="absolute top-5 right-5 z-10 w-68 rounded-lg border border-[#C5A5FF]/35 bg-[#0B0E14]/95 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-medium text-[#C5A5FF]">
                {(selectedInfo ?? hoveredInfo)!.number}. {(selectedInfo ?? hoveredInfo)!.category}
              </p>
              <h4 className="font-display mt-0.5 text-sm font-semibold text-[#F5F6F8]">
                {(selectedInfo ?? hoveredInfo)!.name}
              </h4>
            </div>
            {selectedInfo && (
              <button
                type="button"
                onClick={() => setSelectedComponent(null)}
                className="cursor-pointer rounded px-2 py-0.5 text-[11px] text-[#929BA8] hover:bg-white/10 hover:text-[#F5F6F8]"
              >
                Clear
              </button>
            )}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#929BA8]">
            {(selectedInfo ?? hoveredInfo)!.shortDescription}
          </p>
        </div>
      )}

      {/* Collapsible Bottom Control Dock (Zero Viewport Occlusion) */}
      <div
        className={`absolute bottom-5 left-1/2 z-20 w-[min(920px,94%)] -translate-x-1/2 transition-transform duration-300 ${
          dockCollapsed ? 'translate-y-[calc(100%-36px)]' : 'translate-y-0'
        }`}
      >
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setDockCollapsed((v) => !v)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-t-lg border border-b-0 border-white/10 bg-[#10141B]/95 px-3.5 py-1.5 text-[11px] font-medium text-[#929BA8] transition-colors hover:text-[#F5F6F8]"
          >
            {dockCollapsed ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                <span>Show Controls</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                <span>Hide Controls</span>
              </>
            )}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#10141B]/95 px-4 py-3">
          {/* Camera Angle Switcher */}
          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-[#07090D] p-1">
            {CAMERA_PRESETS.map((p) => {
              const active = !selectedComponent && cameraPreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedComponent(null);
                    setCameraPreset(p.id);
                  }}
                  className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-[#C5A5FF] text-[#07090D]'
                      : 'text-[#929BA8] hover:text-[#F5F6F8]'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Hardware State Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setGlassVisible((v) => !v)}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                glassVisible
                  ? 'border-white/15 bg-[#151A22] text-[#F5F6F8]'
                  : 'border-[#C5A5FF]/40 bg-[#C5A5FF]/15 text-[#C5A5FF]'
              }`}
            >
              {glassVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              <span>{glassVisible ? 'Glass On' : 'Glass Off'}</span>
            </button>

            <button
              type="button"
              onClick={() => setRgbEnabled((v) => !v)}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                rgbEnabled
                  ? 'border-[#C5A5FF]/40 bg-[#C5A5FF]/15 text-[#F5F6F8]'
                  : 'border-white/15 bg-[#151A22] text-[#929BA8]'
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
              <span>{rgbEnabled ? 'RGB On' : 'RGB Off'}</span>
            </button>

            <button
              type="button"
              onClick={() => setExploded((v) => !v)}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                exploded
                  ? 'border-[#C5A5FF] bg-[#C5A5FF] text-[#07090D]'
                  : 'border-white/15 bg-[#151A22] text-[#F5F6F8] hover:border-white/30'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>{exploded ? 'Exploded Mode' : 'Assembled Mode'}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              aria-label="Reset 3D Viewer"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-white/10 bg-[#07090D] px-3 py-1.5 text-xs font-medium text-[#929BA8] whitespace-nowrap transition-colors hover:border-white/25 hover:text-[#F5F6F8]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
