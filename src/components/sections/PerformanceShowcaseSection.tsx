import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { PC_BUILDS } from '../../data/builds';

const METRIC_LABELS: {
  key: keyof (typeof PC_BUILDS)[0]['performance']['ratings'];
  label: string;
}[] = [
  { key: 'graphicsHeadroom', label: 'Graphics Thermal Headroom (Illustrative Index)' },
  { key: 'thermalDissipation', label: 'Liquid & Airflow Dissipation (Illustrative Index)' },
  { key: 'acousticRefinement', label: 'Acoustic Damping Refinement (Illustrative Index)' },
  { key: 'memoryBandwidth', label: 'Memory Channel Bandwidth Tier (Illustrative Index)' },
  { key: 'storageThroughput', label: 'Gen5 NVMe Lane Architecture (Illustrative Index)' },
];

export default function PerformanceShowcaseSection() {
  const [selectedSlug, setSelectedSlug] = useState(PC_BUILDS[0].slug);
  const activeBuild = PC_BUILDS.find((b) => b.slug === selectedSlug) ?? PC_BUILDS[0];

  return (
    <section className="border-t border-white/10 bg-[#10141B] py-24">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.16em] text-[#C5A5FF]">
              ARCHITECTURAL IDENTITY
            </p>
            <h2 className="font-display mt-2 text-[clamp(1.75rem,3vw,2.75rem)] font-semibold tracking-tight text-[#F5F6F8]">
              Visual Performance Profiles
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#929BA8]">
              Compare the illustrative engineering balance across all five builds. Values below represent relative architectural design emphasis rather than measured real-world benchmark scores.
            </p>
          </div>

          {/* Interactive Build Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-white/10 bg-[#07090D] p-1">
            {PC_BUILDS.map((b) => {
              const active = b.slug === activeBuild.slug;
              return (
                <button
                  key={b.slug}
                  type="button"
                  onClick={() => setSelectedSlug(b.slug)}
                  className={`cursor-pointer rounded-md px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-[#C5A5FF] text-[#07090D]'
                      : 'text-[#929BA8] hover:text-[#F5F6F8]'
                  }`}
                >
                  {b.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Animated Architectural Index Bars */}
          <div className="rounded-xl border border-white/10 bg-[#151A22] p-6 lg:col-span-7 lg:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <p className="text-xs text-[#929BA8]">
                  {activeBuild.number} · Illustrative Specification Profile
                </p>
                <h3 className="font-display mt-1 text-xl font-semibold text-[#F5F6F8]">
                  {activeBuild.name} — {activeBuild.subtitle}
                </h3>
              </div>
              <Link
                to={`/builds/${activeBuild.slug}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#C5A5FF] hover:underline"
              >
                <span>Open Full Build</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-6 space-y-5">
              {METRIC_LABELS.map((metric) => {
                const value = activeBuild.performance.ratings[metric.key];
                return (
                  <div key={metric.key}>
                    <div className="flex items-center justify-between gap-4 text-xs">
                      <span className="text-[#F5F6F8]">{metric.label}</span>
                      <span className="font-mono-tech text-[#C5A5FF]">{value} / 100</span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-sm bg-[#07090D]">
                      <div
                        className="h-full transition-all duration-500 ease-out"
                        style={{
                          width: `${value}%`,
                          backgroundColor: activeBuild.accentColor,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4 Capability Pillars + Hardware Spec Summary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-5">
            <div className="rounded-xl border border-white/10 bg-[#151A22] p-5">
              <p className="text-[11px] font-medium text-[#C5A5FF]">GAMING CATEGORY</p>
              <h4 className="font-display mt-1.5 text-base font-semibold text-[#F5F6F8]">
                {activeBuild.performance.gamingCategory}
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-[#929BA8]">
                Tuned around high-resolution frame pacing and sustained thermal stability.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#151A22] p-5">
              <p className="text-[11px] font-medium text-[#C5A5FF]">GRAPHICS ARCHITECTURE</p>
              <h4 className="font-display mt-1.5 text-base font-semibold text-[#F5F6F8]">
                {activeBuild.performance.graphicsArchitecture}
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-[#929BA8]">
                Triple-axial vapor chamber chassis clearance with direct intake airflow.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#151A22] p-5">
              <p className="text-[11px] font-medium text-[#C5A5FF]">COOLING DESIGN</p>
              <h4 className="font-display mt-1.5 text-base font-semibold text-[#F5F6F8]">
                {activeBuild.performance.coolingArchitecture}
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-[#929BA8]">
                Balanced front-to-top laminar airflow across a 360mm liquid radiator.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#151A22] p-5">
              <p className="text-[11px] font-medium text-[#C5A5FF]">STORAGE TECHNOLOGY</p>
              <h4 className="font-display mt-1.5 text-base font-semibold text-[#F5F6F8]">
                {activeBuild.performance.storageTechnology}
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-[#929BA8]">
                Micro-finned M.2 thermal shield mounted directly to primary CPU lanes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
