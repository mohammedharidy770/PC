import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { PC_BUILDS } from '../../data/builds';
import { getBuildPreview } from '../../utils/previewRenderer';

interface FeaturedBuildsSectionProps {
  previewsReady?: boolean;
}

export default function FeaturedBuildsSection({
  previewsReady = true,
}: FeaturedBuildsSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollTrack = (direction: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el) return;
    const step = Math.min(480, el.clientWidth * 0.78);
    el.scrollBy({ left: direction === 'left' ? -step : step, behavior: 'smooth' });
  };

  return (
    <section id="builds" className="border-t border-white/10 bg-[#07090D] py-24">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <p className="text-xs font-medium tracking-[0.16em] text-[#C5A5FF]">
              CURATED EDITIONS
            </p>
            <h2 className="font-display mt-2 text-[clamp(1.75rem,3vw,2.75rem)] font-semibold tracking-tight text-[#F5F6F8]">
              Five Signature PC Builds
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#929BA8]">
              Five distinct material palettes and illumination architectures. Open any build to inspect its independent 3D showcase, exploded assembly, and lighting studio.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Scroll builds left"
              onClick={() => scrollTrack('left')}
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-white/10 bg-[#10141B] text-[#F5F6F8] transition-colors hover:border-[#C5A5FF]/50"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Scroll builds right"
              onClick={() => scrollTrack('right')}
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-white/10 bg-[#10141B] text-[#F5F6F8] transition-colors hover:border-[#C5A5FF]/50"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Project Gallery */}
        <div
          ref={trackRef}
          className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6"
        >
          {PC_BUILDS.map((build) => {
            const previewSrc = previewsReady ? getBuildPreview(build.slug) : undefined;
            return (
              <article
                key={build.slug}
                className="group flex w-[84vw] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-[#10141B] transition-colors duration-200 hover:border-[#C5A5FF]/60 sm:w-[390px] lg:w-[410px]"
              >
                <div>
                  <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-white/10 bg-[#0B0F16]">
                    {previewSrc ? (
                      <img
                        src={previewSrc}
                        alt={`${build.name} custom PC 3D render`}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#151A22] to-[#07090D]">
                        <span className="font-display text-lg font-semibold text-[#F5F6F8]">
                          {build.name}
                        </span>
                      </div>
                    )}
                    <div
                      aria-hidden="true"
                      className="absolute right-0 bottom-0 left-0 h-0.5"
                      style={{ backgroundColor: build.accentColor }}
                    />
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-[#929BA8]">
                      <span className="font-mono-tech font-medium" style={{ color: build.accentColor }}>
                        {build.number}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{build.visualTheme}</span>
                    </div>

                    <h3 className="font-display mt-2 text-2xl font-semibold tracking-tight text-[#F5F6F8]">
                      {build.name}
                    </h3>

                    <p className="mt-2.5 text-sm leading-relaxed text-[#929BA8]">
                      {build.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <Link
                    to={`/builds/${build.slug}`}
                    className="inline-flex w-full items-center justify-between rounded-md border border-white/15 bg-[#151A22] px-4 py-2.5 text-xs font-semibold text-[#F5F6F8] transition-colors hover:border-[#C5A5FF] hover:bg-[#C5A5FF] hover:text-[#07090D]"
                  >
                    <span>Explore Build</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
