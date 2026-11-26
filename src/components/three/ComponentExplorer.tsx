import { useState } from 'react';
import { ArrowUpRight, Focus, Layers } from 'lucide-react';
import { DEFAULT_BUILD } from '../../data/builds';
import { HARDWARE_COMPONENTS } from '../../data/components';
import { ComponentId, PCBuildProject } from '../../types/hardware';
import { getComponentPreview } from '../../utils/previewRenderer';
import PCModel from './PCModel';
import PCScene from './PCScene';

interface ComponentExplorerProps {
  build?: PCBuildProject;
  previewsReady?: boolean;
}

export default function ComponentExplorer({
  build = DEFAULT_BUILD,
  previewsReady = true,
}: ComponentExplorerProps) {
  const [selectedId, setSelectedId] = useState<ComponentId>('gpu');
  const [isolateMode, setIsolateMode] = useState(false);

  const activeComponent =
    HARDWARE_COMPONENTS.find((c) => c.id === selectedId) ?? HARDWARE_COMPONENTS[0];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
      {/* Sticky Live 3D Focus Stage */}
      <div className="lg:sticky lg:top-24 lg:col-span-5">
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#10141B]">
          <div className="relative h-[420px] w-full bg-[#07090D] sm:h-[480px]">
            <PCScene
              cameraPreset="perspective"
              focusedComponent={selectedId}
              enableOrbit
            >
              <PCModel
                materials={build.materials}
                rgbConfig={build.defaultRGB}
                glassVisible={false}
                highlightedComponent={selectedId}
                isolateComponent={isolateMode ? selectedId : null}
                onSelectComponent={(id) => setSelectedId(id)}
              />
            </PCScene>

            <div className="absolute right-4 bottom-4 left-4 flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#07090D]/92 px-3.5 py-2.5">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-[#C5A5FF]">
                  {activeComponent.number}. {activeComponent.category}
                </p>
                <p className="truncate font-display text-sm font-semibold text-[#F5F6F8]">
                  {activeComponent.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsolateMode((v) => !v)}
                className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  isolateMode
                    ? 'border-[#C5A5FF] bg-[#C5A5FF] text-[#07090D]'
                    : 'border-white/15 bg-[#151A22] text-[#F5F6F8] hover:border-[#C5A5FF]/50'
                }`}
              >
                {isolateMode ? (
                  <>
                    <Layers className="h-3.5 w-3.5" />
                    <span>Show Full Rig</span>
                  </>
                ) : (
                  <>
                    <Focus className="h-3.5 w-3.5" />
                    <span>Isolate Part</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Active Component Material & Spec Summary */}
          <div className="border-t border-white/10 p-5">
            <p className="text-xs text-[#929BA8]">{activeComponent.materialFinish}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {activeComponent.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="rounded-lg border border-white/10 bg-[#151A22] px-3 py-2.5"
                >
                  <p className="text-[11px] text-[#929BA8]">{spec.label}</p>
                  <p className="font-mono-tech mt-0.5 text-xs font-medium text-[#F5F6F8]">
                    {spec.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 8 Component Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-7">
        {HARDWARE_COMPONENTS.map((comp) => {
          const isSelected = selectedId === comp.id;
          const previewSrc = previewsReady ? getComponentPreview(comp.id) : undefined;
          return (
            <article
              key={comp.id}
              className={`group flex flex-col justify-between overflow-hidden rounded-xl border transition-colors duration-200 ${
                isSelected
                  ? 'border-[#C5A5FF]/70 bg-[#151A22]'
                  : 'border-white/10 bg-[#10141B] hover:border-white/25'
              }`}
            >
              <div>
                {/* Genuine 3D Rendered Preview */}
                <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-white/10 bg-[#0B0F16]">
                  {previewSrc ? (
                    <img
                      src={previewSrc}
                      alt={`${comp.name} 3D hardware render`}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#10141B] to-[#07090D] p-6">
                      <span className="font-display text-sm font-medium text-[#929BA8]">
                        {comp.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Copy (Zero-Pill Clean Metadata) */}
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-[#929BA8]">
                    <span className="font-mono-tech text-[#C5A5FF]">{comp.number}</span>
                    <span aria-hidden="true">·</span>
                    <span>{comp.category}</span>
                  </div>

                  <h3 className="font-display mt-1.5 text-lg font-semibold text-[#F5F6F8]">
                    {comp.name}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-[#929BA8]">
                    {comp.shortDescription}
                  </p>

                  <dl className="mt-4 space-y-1.5 border-t border-white/10 pt-3">
                    {comp.specs.slice(0, 2).map((s) => (
                      <div key={s.label} className="flex items-center justify-between gap-3 text-xs">
                        <dt className="text-[#929BA8]">{s.label}</dt>
                        <dd className="font-mono-tech text-right text-[#F5F6F8]">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              <div className="px-5 pb-5">
                <button
                  type="button"
                  onClick={() => setSelectedId(comp.id)}
                  className={`inline-flex w-full cursor-pointer items-center justify-between rounded-md border px-4 py-2.5 text-xs font-medium transition-colors ${
                    isSelected
                      ? 'border-[#C5A5FF] bg-[#C5A5FF] text-[#07090D]'
                      : 'border-white/15 bg-[#151A22] text-[#F5F6F8] hover:border-[#C5A5FF]/50'
                  }`}
                >
                  <span>{isSelected ? 'Focused in 3D Stage' : 'Explore Component'}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
