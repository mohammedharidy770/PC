import { useState } from 'react';
import { RGB_PRESETS } from '../../data/builds';
import { PCBuildProject, RGBConfig } from '../../types/hardware';
import PCModel from './PCModel';
import PCScene from './PCScene';

interface RGBLightingControllerProps {
  build: PCBuildProject;
}

export default function RGBLightingController({ build }: RGBLightingControllerProps) {
  const [rgb, setRgb] = useState<RGBConfig>(build.defaultRGB);
  const [activePresetId, setActivePresetId] = useState<string>(
    RGB_PRESETS.find((p) => p.color.toLowerCase() === build.defaultRGB.color.toLowerCase())?.id ??
      'custom'
  );

  const applyPreset = (presetId: string) => {
    const preset = RGB_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setActivePresetId(preset.id);
    setRgb((prev) => ({
      ...prev,
      enabled: true,
      color: preset.color,
      secondaryColor: preset.secondaryColor ?? preset.color,
      spectrumMode: Boolean(preset.spectrumMode),
    }));
  };

  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-white/10 bg-[#10141B] lg:grid-cols-12">
      {/* Live 3D Illumination Stage */}
      <div className="relative h-[460px] bg-[#07090D] lg:col-span-7 lg:h-[580px]">
        <PCScene cameraPreset="perspective" enableOrbit>
          <PCModel
            materials={build.materials}
            rgbConfig={rgb}
            glassVisible
            autoRotate={false}
          />
        </PCScene>

        <div className="pointer-events-none absolute top-5 left-5 rounded-lg border border-white/10 bg-[#07090D]/90 px-4 py-2.5">
          <p className="text-[11px] font-medium tracking-[0.14em] text-[#C5A5FF]">
            REAL-TIME ILLUMINATION
          </p>
          <div className="mt-1 flex items-center gap-2.5">
            <span
              className="h-3 w-3 rounded-full border border-white/25"
              style={{ backgroundColor: rgb.enabled ? rgb.color : '#222' }}
            />
            <span className="font-mono-tech text-xs text-[#F5F6F8]">
              {rgb.enabled ? (rgb.spectrumMode ? 'SPECTRUM WAVE' : rgb.color.toUpperCase()) : 'LIGHTS OFF'}
            </span>
            <span aria-hidden="true" className="text-white/25">
              ·
            </span>
            <span className="font-mono-tech text-xs text-[#929BA8]">
              {Math.round(rgb.intensity * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Studio Controls Panel */}
      <div className="flex flex-col justify-between border-t border-white/10 p-6 lg:col-span-5 lg:border-t-0 lg:border-l lg:p-8">
        <div className="space-y-6">
          <div>
            <p className="text-xs font-medium tracking-[0.14em] text-[#C5A5FF]">
              RGB LIGHTING STUDIO
            </p>
            <h3 className="font-display mt-1 text-2xl font-semibold text-[#F5F6F8]">
              Sculpt Light & Atmosphere
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#929BA8]">
              Tune chassis strips, cooling fan halos, and internal motherboard accents in real time.
            </p>
          </div>

          {/* 5 Preset Lighting Themes */}
          <div>
            <p className="mb-3 text-xs font-medium text-[#F5F6F8]">Preset Lighting Themes</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {RGB_PRESETS.map((preset) => {
                const isSelected = activePresetId === preset.id && !rgb.spectrumMode;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset.id)}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left transition-colors ${
                      isSelected
                        ? 'border-[#C5A5FF] bg-[#151A22]'
                        : 'border-white/10 bg-[#07090D] hover:border-white/25'
                    }`}
                  >
                    <span
                      className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/20"
                      style={{ backgroundColor: preset.color }}
                    />
                    <span className="min-w-0 truncate text-xs font-medium text-[#F5F6F8]">
                      {preset.number}. {preset.name}
                    </span>
                  </button>
                );
              })}

              {/* Spectrum Wave Mode */}
              <button
                type="button"
                onClick={() => {
                  setActivePresetId('spectrum');
                  setRgb((prev) => ({
                    ...prev,
                    enabled: true,
                    spectrumMode: !prev.spectrumMode,
                  }));
                }}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left transition-colors ${
                  rgb.spectrumMode
                    ? 'border-[#C5A5FF] bg-[#151A22]'
                    : 'border-white/10 bg-[#07090D] hover:border-white/25'
                }`}
              >
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/20"
                  style={{
                    background: 'linear-gradient(135deg, #38BDF8, #C5A5FF, #F472B6)',
                  }}
                />
                <span className="min-w-0 truncate text-xs font-medium text-[#F5F6F8]">
                  Spectrum Wave
                </span>
              </button>
            </div>
          </div>

          {/* Custom Color & Intensity */}
          <div className="grid grid-cols-1 gap-5 border-t border-white/10 pt-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`rgb-color-${build.slug}`}
                className="block text-xs font-medium text-[#F5F6F8]"
              >
                Custom Color
              </label>
              <div className="mt-2 flex items-center gap-3 rounded-lg border border-white/10 bg-[#07090D] px-3 py-2">
                <input
                  id={`rgb-color-${build.slug}`}
                  type="color"
                  value={rgb.color}
                  onChange={(e) => {
                    const c = e.target.value;
                    setActivePresetId('custom');
                    setRgb((prev) => ({
                      ...prev,
                      enabled: true,
                      spectrumMode: false,
                      color: c,
                      secondaryColor: c,
                    }));
                  }}
                  className="h-6 w-8 cursor-pointer border-0 bg-transparent p-0"
                />
                <span className="font-mono-tech text-xs text-[#929BA8]">
                  {rgb.color.toUpperCase()}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor={`rgb-intensity-${build.slug}`}
                  className="text-xs font-medium text-[#F5F6F8]"
                >
                  Lighting Intensity
                </label>
                <span className="font-mono-tech text-xs text-[#C5A5FF]">
                  {Math.round(rgb.intensity * 100)}%
                </span>
              </div>
              <input
                id={`rgb-intensity-${build.slug}`}
                type="range"
                min={0}
                max={1.6}
                step={0.05}
                value={rgb.intensity}
                onChange={(e) =>
                  setRgb((prev) => ({
                    ...prev,
                    enabled: true,
                    intensity: parseFloat(e.target.value),
                  }))
                }
                className="pc-slider mt-4 w-full"
              />
            </div>
          </div>

          {/* Zone Illumination Toggles */}
          <div className="border-t border-white/10 pt-5">
            <p className="mb-3 text-xs font-medium text-[#F5F6F8]">Lighting Zones</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {[
                { key: 'caseIllumination' as const, label: 'Case Strips' },
                { key: 'fanLighting' as const, label: 'Fan Halos' },
                { key: 'interiorLighting' as const, label: 'Interior Core' },
              ].map((zone) => {
                const active = rgb[zone.key] && rgb.enabled;
                return (
                  <button
                    key={zone.key}
                    type="button"
                    onClick={() =>
                      setRgb((prev) => ({
                        ...prev,
                        enabled: true,
                        [zone.key]: !prev[zone.key],
                      }))
                    }
                    className={`cursor-pointer rounded-md border px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                      active
                        ? 'border-[#C5A5FF]/60 bg-[#C5A5FF]/15 text-[#F5F6F8]'
                        : 'border-white/10 bg-[#07090D] text-[#929BA8]'
                    }`}
                  >
                    {zone.label}: {active ? 'On' : 'Off'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => setRgb((prev) => ({ ...prev, enabled: !prev.enabled }))}
            className="cursor-pointer text-xs font-medium text-[#929BA8] hover:text-[#F5F6F8]"
          >
            {rgb.enabled ? 'Turn Off All Lighting' : 'Turn On All Lighting'}
          </button>
          <button
            type="button"
            onClick={() => {
              setRgb(build.defaultRGB);
              setActivePresetId(
                RGB_PRESETS.find(
                  (p) => p.color.toLowerCase() === build.defaultRGB.color.toLowerCase()
                )?.id ?? 'custom'
              );
            }}
            className="cursor-pointer text-xs font-medium text-[#C5A5FF] hover:underline"
          >
            Reset to Build Signature
          </button>
        </div>
      </div>
    </div>
  );
}
