import { useState } from 'react';
import { HARDWARE_COMPONENTS } from '../../data/components';
import { ComponentId, PCBuildProject, ViewerMode } from '../../types/hardware';
import PCModel from './PCModel';
import PCScene from './PCScene';

interface ExplodedViewProps {
  build: PCBuildProject;
}

const EXPLODED_LAYERS: { id: ComponentId; label: string }[] = [
  { id: 'case', label: 'PC Case' },
  { id: 'motherboard', label: 'Motherboard' },
  { id: 'gpu', label: 'GPU' },
  { id: 'processor', label: 'CPU' },
  { id: 'memory', label: 'RAM' },
  { id: 'cooling', label: 'Cooling System' },
  { id: 'fans', label: 'Fans' },
  { id: 'storage', label: 'Storage' },
  { id: 'psu', label: 'Power Supply' },
  { id: 'glass', label: 'Glass Panels' },
];

export default function ExplodedView({ build }: ExplodedViewProps) {
  const [mode, setMode] = useState<ViewerMode>('exploded');
  const [explodeSlider, setExplodeSlider] = useState(0.85);
  const [focusedLayer, setFocusedLayer] = useState<ComponentId | null>(null);

  const effectiveExplode =
    mode === 'assembled' ? 0 : mode === 'exploded' ? explodeSlider : 0.92;

  const activeLayerMeta = focusedLayer
    ? EXPLODED_LAYERS.find((l) => l.id === focusedLayer)
    : null;
  const activeComponentDetail = focusedLayer
    ? HARDWARE_COMPONENTS.find((c) => c.id === focusedLayer)
    : null;

  const handleModeSwitch = (nextMode: ViewerMode) => {
    setMode(nextMode);
    if (nextMode === 'assembled') {
      setFocusedLayer(null);
      setExplodeSlider(0);
    } else if (nextMode === 'exploded') {
      setFocusedLayer(null);
      setExplodeSlider((prev) => (prev < 0.2 ? 0.85 : prev));
    } else if (nextMode === 'focus' && !focusedLayer) {
      setFocusedLayer('gpu');
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#10141B]">
      {/* Mode Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-4">
        <div>
          <p className="text-xs font-medium tracking-[0.14em] text-[#C5A5FF]">
            ARCHITECTURAL SEPARATION
          </p>
          <h3 className="font-display mt-0.5 text-lg font-semibold text-[#F5F6F8]">
            Exploded View Presentation
          </h3>
        </div>

        {/* 3-State Mode Switcher */}
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-[#07090D] p-1">
          <button
            type="button"
            onClick={() => handleModeSwitch('assembled')}
            className={`cursor-pointer rounded-md px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
              mode === 'assembled'
                ? 'bg-[#C5A5FF] text-[#07090D]'
                : 'text-[#929BA8] hover:text-[#F5F6F8]'
            }`}
          >
            Complete PC
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch('exploded')}
            className={`cursor-pointer rounded-md px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
              mode === 'exploded'
                ? 'bg-[#C5A5FF] text-[#07090D]'
                : 'text-[#929BA8] hover:text-[#F5F6F8]'
            }`}
          >
            Exploded Presentation
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch('focus')}
            className={`cursor-pointer rounded-md px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
              mode === 'focus'
                ? 'bg-[#C5A5FF] text-[#07090D]'
                : 'text-[#929BA8] hover:text-[#F5F6F8]'
            }`}
          >
            Individual Focus
          </button>
        </div>
      </div>

      {/* Main 3D Exploded Stage */}
      <div className="relative h-[540px] w-full bg-[#07090D] lg:h-[620px]">
        <PCScene
          cameraPreset="perspective"
          focusedComponent={mode === 'focus' ? focusedLayer : null}
          initialCameraPosition={[-3.8, 0.72, 3.35]}
          enableOrbit
        >
          <PCModel
            materials={build.materials}
            rgbConfig={build.defaultRGB}
            explodeAmount={effectiveExplode}
            glassVisible
            floatingWhenExploded
            highlightedComponent={focusedLayer}
            isolateComponent={mode === 'focus' ? focusedLayer : null}
            onSelectComponent={(id) => {
              setFocusedLayer(id);
              setMode('focus');
            }}
          />
        </PCScene>

        {/* Focused Layer Callout */}
        {activeLayerMeta && (
          <div className="absolute top-5 right-5 z-10 max-w-xs rounded-lg border border-[#C5A5FF]/40 bg-[#07090D]/95 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-medium text-[#C5A5FF]">
                {activeLayerMeta.label}
              </span>
              <button
                type="button"
                onClick={() => {
                  setFocusedLayer(null);
                  setMode('exploded');
                }}
                className="cursor-pointer text-[11px] text-[#929BA8] hover:text-[#F5F6F8]"
              >
                Show All
              </button>
            </div>
            <p className="font-display mt-1 text-sm font-semibold text-[#F5F6F8]">
              {activeComponentDetail?.name ?? activeLayerMeta.label}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-[#929BA8]">
              {activeComponentDetail?.shortDescription ??
                'Precision architectural sub-assembly separated cleanly in 3D space.'}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Separation Scrub & 10-Layer Selector */}
      <div className="border-t border-white/10 bg-[#10141B] p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full max-w-sm items-center gap-4">
            <label
              htmlFor={`explode-slider-${build.slug}`}
              className="shrink-0 text-xs font-medium text-[#929BA8]"
            >
              Separation
            </label>
            <input
              id={`explode-slider-${build.slug}`}
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={effectiveExplode}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setExplodeSlider(v);
                setMode(v <= 0.02 ? 'assembled' : 'exploded');
              }}
              className="pc-slider w-full"
            />
            <span className="font-mono-tech w-11 shrink-0 text-right text-xs text-[#F5F6F8]">
              {Math.round(effectiveExplode * 100)}%
            </span>
          </div>

          {/* 10 Exploded Layer Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {EXPLODED_LAYERS.map((layer) => {
              const active = focusedLayer === layer.id;
              return (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => {
                    if (active) {
                      setFocusedLayer(null);
                      setMode('exploded');
                    } else {
                      setFocusedLayer(layer.id);
                      setMode('focus');
                    }
                  }}
                  className={`cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                    active
                      ? 'border-[#C5A5FF] bg-[#C5A5FF] text-[#07090D]'
                      : 'border-white/10 bg-[#151A22] text-[#929BA8] hover:border-white/25 hover:text-[#F5F6F8]'
                  }`}
                >
                  {layer.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
