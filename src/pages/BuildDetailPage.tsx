import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getBuildBySlug, PC_BUILDS } from '../data/builds';
import BuildViewer from '../components/three/BuildViewer';
import ComponentExplorer from '../components/three/ComponentExplorer';
import ExplodedView from '../components/three/ExplodedView';
import PCModel from '../components/three/PCModel';
import PCScene from '../components/three/PCScene';
import RGBLightingController from '../components/three/RGBLightingController';

interface BuildDetailPageProps {
  previewsReady: boolean;
}

export default function BuildDetailPage({ previewsReady }: BuildDetailPageProps) {
  const { slug } = useParams<{ slug: string }>();
  const currentIndex = Math.max(
    0,
    PC_BUILDS.findIndex((b) => b.slug === slug)
  );
  const build = getBuildBySlug(slug);
  const prevBuild = PC_BUILDS[(currentIndex - 1 + PC_BUILDS.length) % PC_BUILDS.length];
  const nextBuild = PC_BUILDS[(currentIndex + 1) % PC_BUILDS.length];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [slug]);

  return (
    <div key={build.slug} className="bg-[#07090D]">
      {/* 1. Full-Screen 3D PC Hero */}
      <section className="relative h-screen min-h-[680px] w-full overflow-hidden">
        <div className="absolute inset-0">
          <PCScene cameraPreset="perspective" enableOrbit>
            <PCModel
              materials={build.materials}
              rgbConfig={build.defaultRGB}
              glassVisible
              autoRotate
            />
          </PCScene>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-full max-w-2xl bg-gradient-to-r from-[#07090D]/88 via-[#07090D]/45 to-transparent"
        />

        <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[1440px] flex-col justify-between px-6 pt-24 pb-12 lg:px-10">
          <div className="pointer-events-auto max-w-xl">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-[#929BA8] transition-colors hover:text-[#F5F6F8]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to All Builds</span>
            </Link>

            <div className="mt-6 flex items-center gap-2 text-xs text-[#929BA8]">
              <span className="font-mono-tech font-medium" style={{ color: build.accentColor }}>
                {build.number}
              </span>
              <span aria-hidden="true">·</span>
              <span>{build.visualTheme}</span>
            </div>

            <h1 className="font-display mt-3 text-[clamp(2.5rem,5vw,4.25rem)] leading-[1.02] font-semibold tracking-tight text-[#F5F6F8]">
              {build.name}
            </h1>
            <p className="mt-3 text-base font-medium text-[#C5A5FF]">{build.subtitle}</p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#929BA8]">
              {build.shortDescription}
            </p>
          </div>

          <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
            <p className="text-xs text-[#929BA8]">
              Drag anywhere on the 3D rig to orbit · Scroll below for interactive breakdown
            </p>
            <a
              href="#build-viewer"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('build-viewer')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="rounded-md border border-white/15 bg-[#10141B]/90 px-4 py-2 text-xs font-medium text-[#F5F6F8] hover:border-[#C5A5FF]"
            >
              Inspect Hardware
            </a>
          </div>
        </div>
      </section>

      {/* 2. Build Description */}
      <section className="border-t border-white/10 bg-[#10141B] py-20">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="text-xs font-medium tracking-[0.16em] text-[#C5A5FF]">
                EDITION BRIEF
              </p>
              <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-[#F5F6F8]">
                {build.name} Architecture
              </h2>
            </div>
            <div className="lg:col-span-7">
              <p className="text-base leading-relaxed text-[#F5F6F8]">
                {build.fullDescription}
              </p>
              <div className="mt-8 grid grid-cols-1 gap-4 border-t border-white/10 pt-6 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-[#929BA8]">Chassis Surface</p>
                  <p className="mt-1 text-sm font-medium text-[#F5F6F8]">
                    {build.materials.chassisFinishName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#929BA8]">Gaming Profile</p>
                  <p className="mt-1 text-sm font-medium text-[#F5F6F8]">
                    {build.performance.gamingCategory}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#929BA8]">Cooling Topology</p>
                  <p className="mt-1 text-sm font-medium text-[#F5F6F8]">
                    {build.performance.coolingArchitecture}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive 3D Viewer */}
      <section id="build-viewer" className="border-t border-white/10 bg-[#07090D] py-24">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-medium tracking-[0.16em] text-[#C5A5FF]">
              REAL-TIME 3D VIEWPORT
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-[#F5F6F8]">
              Interactive {build.name} Viewer
            </h2>
          </div>
          <BuildViewer build={build} title={`${build.name} Interactive Viewer`} />
        </div>
      </section>

      {/* 4. Component Visualization */}
      <section className="border-t border-white/10 bg-[#10141B] py-24">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-medium tracking-[0.16em] text-[#C5A5FF]">
              SUBSYSTEM BREAKDOWN
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-[#F5F6F8]">
              Component Visualization
            </h2>
          </div>
          <ComponentExplorer build={build} previewsReady={previewsReady} />
        </div>
      </section>

      {/* 5. Exploded View */}
      <section className="border-t border-white/10 bg-[#07090D] py-24">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-medium tracking-[0.16em] text-[#C5A5FF]">
              SPATIAL DISSECTION
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-[#F5F6F8]">
              {build.name} Exploded View
            </h2>
          </div>
          <ExplodedView build={build} />
        </div>
      </section>

      {/* 6. RGB Lighting Studio */}
      <section className="border-t border-white/10 bg-[#10141B] py-24">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-medium tracking-[0.16em] text-[#C5A5FF]">
              CUSTOM LIGHTING
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-[#F5F6F8]">
              {build.name} RGB Studio
            </h2>
          </div>
          <RGBLightingController build={build} />
        </div>
      </section>

      {/* 7. Materials and Finish Presentation */}
      <section className="border-t border-white/10 bg-[#07090D] py-24">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-medium tracking-[0.16em] text-[#C5A5FF]">
              SURFACE ENGINEERING
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-[#F5F6F8]">
              Materials & Finishes
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {build.materialNotes.map((mat, idx) => (
              <div
                key={mat.title}
                className="rounded-xl border border-white/10 bg-[#10141B] p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono-tech text-xs text-[#C5A5FF]">0{idx + 1}</span>
                  <span
                    className="h-4 w-8 rounded-sm border border-white/15"
                    style={{
                      backgroundColor:
                        idx === 0
                          ? build.materials.chassisColor
                          : idx === 1
                            ? build.materials.glassTint
                            : build.materials.cableColor,
                    }}
                  />
                </div>
                <h3 className="font-display mt-4 text-lg font-semibold text-[#F5F6F8]">
                  {mat.title}
                </h3>
                <p className="mt-1 text-xs font-medium text-[#C5A5FF]">{mat.finish}</p>
                <p className="mt-3 text-sm leading-relaxed text-[#929BA8]">{mat.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Technical Specifications */}
      <section className="border-t border-white/10 bg-[#10141B] py-24">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-medium tracking-[0.16em] text-[#C5A5FF]">
                ILLUSTRATIVE CONFIGURATION
              </p>
              <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-[#F5F6F8]">
                Technical Specifications
              </h2>
            </div>
            <p className="text-xs text-[#929BA8]">
              All configuration labels represent illustrative design specifications.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#151A22]">
            <dl className="divide-y divide-white/10">
              {build.specs.map((row) => (
                <div
                  key={row.category}
                  className="grid grid-cols-1 gap-2 px-6 py-4 sm:grid-cols-12 sm:items-center"
                >
                  <dt className="text-xs font-medium text-[#929BA8] sm:col-span-3">
                    {row.category}
                  </dt>
                  <dd className="font-display text-sm font-semibold text-[#F5F6F8] sm:col-span-4">
                    {row.component}
                  </dd>
                  <dd className="font-mono-tech text-xs text-[#929BA8] sm:col-span-5 sm:text-right">
                    {row.detail}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* 9. Cinematic Final Presentation */}
      <section className="border-t border-white/10 bg-[#07090D] py-24">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          <div className="relative h-[520px] overflow-hidden rounded-xl border border-white/10 bg-[#07090D]">
            <PCScene cameraPreset="perspective" enableOrbit>
              <PCModel
                materials={build.materials}
                rgbConfig={build.defaultRGB}
                glassVisible
                autoRotate
              />
            </PCScene>
            <div className="pointer-events-none absolute right-0 bottom-0 left-0 bg-gradient-to-t from-[#07090D] via-[#07090D]/70 to-transparent p-8">
              <p className="text-xs font-medium tracking-[0.18em] text-[#C5A5FF]">
                {build.number} · {build.name}
              </p>
              <h2 className="font-display mt-1 text-2xl font-semibold text-[#F5F6F8] sm:text-3xl">
                BUILD YOUR LEGEND.
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Previous and Next Build Navigation */}
      <section className="border-t border-white/10 bg-[#10141B] py-14">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Link
              to={`/builds/${prevBuild.slug}`}
              className="group flex items-center justify-between rounded-xl border border-white/10 bg-[#151A22] p-6 transition-colors hover:border-[#C5A5FF]/60"
            >
              <div>
                <p className="flex items-center gap-2 text-xs text-[#929BA8]">
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
                  <span>Previous Build</span>
                </p>
                <p className="font-display mt-1.5 text-xl font-semibold text-[#F5F6F8]">
                  {prevBuild.name}
                </p>
                <p className="mt-1 text-xs text-[#929BA8]">{prevBuild.visualTheme}</p>
              </div>
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: prevBuild.accentColor }}
              />
            </Link>

            <Link
              to={`/builds/${nextBuild.slug}`}
              className="group flex items-center justify-between rounded-xl border border-white/10 bg-[#151A22] p-6 text-right transition-colors hover:border-[#C5A5FF]/60"
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: nextBuild.accentColor }}
              />
              <div>
                <p className="flex items-center justify-end gap-2 text-xs text-[#929BA8]">
                  <span>Next Build</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </p>
                <p className="font-display mt-1.5 text-xl font-semibold text-[#F5F6F8]">
                  {nextBuild.name}
                </p>
                <p className="mt-1 text-xs text-[#929BA8]">{nextBuild.visualTheme}</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
