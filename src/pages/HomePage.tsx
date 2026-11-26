import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DEFAULT_BUILD } from '../data/builds';
import { prefersReducedMotion } from '../utils/webgl';
import AboutSection from '../components/sections/AboutSection';
import FeaturedBuildsSection from '../components/sections/FeaturedBuildsSection';
import HeroAssemblySection from '../components/sections/HeroAssemblySection';
import PerformanceShowcaseSection from '../components/sections/PerformanceShowcaseSection';
import BuildViewer from '../components/three/BuildViewer';
import ComponentExplorer from '../components/three/ComponentExplorer';
import ExplodedView from '../components/three/ExplodedView';
import RGBLightingController from '../components/three/RGBLightingController';

gsap.registerPlugin(ScrollTrigger);

interface HomePageProps {
  previewsReady: boolean;
}

export default function HomePage({ previewsReady }: HomePageProps) {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 86%',
              once: true,
            },
          }
        );
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} className="bg-[#07090D]">
      {/* Section 2: 400vh Scroll-Driven PC Assembly Hero */}
      <HeroAssemblySection build={DEFAULT_BUILD} />

      {/* Section 3: Interactive 3D PC Viewer */}
      <section id="experience" className="border-t border-white/10 bg-[#07090D] py-24">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          <div data-reveal className="mb-10 max-w-2xl">
            <p className="text-xs font-medium tracking-[0.16em] text-[#C5A5FF]">
              REAL-TIME 3D STUDIO
            </p>
            <h2 className="font-display mt-2 text-[clamp(1.75rem,3vw,2.75rem)] font-semibold tracking-tight text-[#F5F6F8]">
              Interactive 3D PC Viewer
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#929BA8]">
              Inspect every surface in real time. Switch camera angles, remove the tempered glass panels, toggle RGB lighting, or trigger exploded mode from the bottom control dock.
            </p>
          </div>

          <BuildViewer build={DEFAULT_BUILD} />
        </div>
      </section>

      {/* Section 4: Component Explorer (8 Categories + Synchronized 3D Focus) */}
      <section id="components" className="border-t border-white/10 bg-[#10141B] py-24">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          <div data-reveal className="mb-12 max-w-2xl">
            <p className="text-xs font-medium tracking-[0.16em] text-[#C5A5FF]">
              HARDWARE ARCHITECTURE
            </p>
            <h2 className="font-display mt-2 text-[clamp(1.75rem,3vw,2.75rem)] font-semibold tracking-tight text-[#F5F6F8]">
              Component Explorer
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#929BA8]">
              Explore all eight primary hardware subsystems. Selecting any card highlights its geometry inside the 3D chassis and transitions the camera directly into position.
            </p>
          </div>

          <ComponentExplorer build={DEFAULT_BUILD} previewsReady={previewsReady} />
        </div>
      </section>

      {/* Section 5: Exploded View Experience */}
      <section id="exploded" className="border-t border-white/10 bg-[#07090D] py-24">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          <div data-reveal className="mb-10 max-w-2xl">
            <p className="text-xs font-medium tracking-[0.16em] text-[#C5A5FF]">
              DIMENSIONAL PRESENTATION
            </p>
            <h2 className="font-display mt-2 text-[clamp(1.75rem,3vw,2.75rem)] font-semibold tracking-tight text-[#F5F6F8]">
              Exploded View Experience
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#929BA8]">
              Separate the entire custom rig across three-dimensional space to examine internal layout spacing, cable geometry, and thermal layering.
            </p>
          </div>

          <ExplodedView build={DEFAULT_BUILD} />
        </div>
      </section>

      {/* Section 6: RGB Lighting Studio */}
      <section id="rgb-studio" className="border-t border-white/10 bg-[#10141B] py-24">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          <div data-reveal className="mb-10 max-w-2xl">
            <p className="text-xs font-medium tracking-[0.16em] text-[#C5A5FF]">
              ILLUMINATION ENGINE
            </p>
            <h2 className="font-display mt-2 text-[clamp(1.75rem,3vw,2.75rem)] font-semibold tracking-tight text-[#F5F6F8]">
              RGB Lighting Studio
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#929BA8]">
              Apply calibrated signature presets or sculpt custom wavelengths across chassis strips, cooling fan halos, and interior hardware zones.
            </p>
          </div>

          <RGBLightingController build={DEFAULT_BUILD} />
        </div>
      </section>

      {/* Section 7: Five Featured PC Builds */}
      <FeaturedBuildsSection previewsReady={previewsReady} />

      {/* Section 9: Visual Performance Showcase */}
      <PerformanceShowcaseSection />

      {/* About & Craftsmanship */}
      <AboutSection />
    </div>
  );
}
