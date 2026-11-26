import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown } from 'lucide-react';
import { DEFAULT_BUILD } from '../../data/builds';
import { PCBuildProject } from '../../types/hardware';
import { prefersReducedMotion } from '../../utils/webgl';
import PCModel from '../three/PCModel';
import PCScene from '../three/PCScene';

gsap.registerPlugin(ScrollTrigger);

interface SceneChapter {
  number: string;
  title: string;
  description: string;
}

const ASSEMBLY_SCENES: SceneChapter[] = [
  {
    number: '01',
    title: 'Studio Atmosphere',
    description: 'Calibrated dark aluminum showcase environment.',
  },
  {
    number: '02',
    title: 'Chassis Foundation',
    description: 'Brushed anodized aluminum frame enters the stage.',
  },
  {
    number: '03',
    title: 'Motherboard Architecture',
    description: '8-layer matte PCB and modular power core align.',
  },
  {
    number: '04',
    title: 'Processor & Memory Array',
    description: 'Compute silicon, quad DDR5 modules, and NVMe storage seat cleanly.',
  },
  {
    number: '05',
    title: 'Graphics Accelerator',
    description: 'Triple-axial GPU and custom sleeved harnesses integrate.',
  },
  {
    number: '06',
    title: 'Liquid Cooling & Airflow',
    description: '360mm radiator, braided coolant tubes, and 7 PWM fans engage.',
  },
  {
    number: '07',
    title: 'Tempered Glass & Illumination',
    description: 'Optical glazing encloses the rig as precision RGB lighting ignites.',
  },
  {
    number: '08',
    title: 'Complete System Integration',
    description: 'Every mechanical and thermal layer locked into unified harmony.',
  },
  {
    number: '09',
    title: 'Orbital Presentation',
    description: 'Cinematic 360-degree sweep around the finished masterpiece.',
  },
  {
    number: '10',
    title: 'Hardware Exploration',
    description: 'Continue downward to inspect individual components in real-time 3D.',
  },
];

interface HeroAssemblySectionProps {
  build?: PCBuildProject;
}

export default function HeroAssemblySection({ build = DEFAULT_BUILD }: HeroAssemblySectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(prefersReducedMotion() ? 1 : 0.14);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      setProgress(1);
      return;
    }

    const ctx = gsap.context(() => {
      const stateObj = { value: 0.14 };
      gsap.to(stateObj, {
        value: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.55,
          onUpdate: (self) => {
            setProgress(self.progress);
          },
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const sceneIndex = Math.min(
    ASSEMBLY_SCENES.length - 1,
    Math.max(0, Math.floor(progress * ASSEMBLY_SCENES.length))
  );
  const currentScene = ASSEMBLY_SCENES[sceneIndex];

  const scrollToExplorer = () => {
    document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative h-[400vh] w-full bg-[#07090D]"
      aria-label="Hero 3D PC Assembly Sequence"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Full-Viewport Interactive 3D Assembly Canvas */}
        <div className="absolute inset-0">
          <PCScene
            enableOrbit={false}
            cameraPreset="perspective"
            initialCameraPosition={[-3.35, 0.55, 2.95]}
          >
            <PCModel
              materials={build.materials}
              rgbConfig={build.defaultRGB}
              assemblyProgress={progress}
              glassVisible
            />
          </PCScene>
        </div>

        {/* Left Gradient Scrim for Guaranteed Contrast */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-full max-w-2xl bg-gradient-to-r from-[#07090D]/85 via-[#07090D]/40 to-transparent"
        />

        {/* Editorial Headline & Primary CTA (Top-Left, Unobstructed Center) */}
        <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[1440px] flex-col justify-between px-6 pt-24 pb-10 lg:px-10">
          <div className="pointer-events-auto max-w-lg">
            <p className="text-xs font-medium tracking-[0.22em] text-[#C5A5FF]">
              PC MASTERPIECE
            </p>
            <h1 className="font-display mt-3 text-[clamp(2.4rem,4.5vw,4rem)] leading-[1.04] font-semibold tracking-tight text-[#F5F6F8]">
              BUILD YOUR LEGEND.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#929BA8] sm:text-base">
              Scroll to witness bespoke hardware architecture assemble layer by layer inside a brushed aluminum and tempered glass chassis.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={scrollToExplorer}
                className="cursor-pointer rounded-md border border-[#C5A5FF]/50 bg-[#C5A5FF] px-5 py-2.5 text-xs font-semibold tracking-wide text-[#07090D] whitespace-nowrap transition-colors hover:bg-[#d8c3ff] focus-visible:outline-2 focus-visible:outline-[#C5A5FF]"
              >
                Explore Hardware
              </button>
              <a
                href="#builds"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('builds')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-[#10141B]/90 px-4 py-2.5 text-xs font-medium text-[#F5F6F8] whitespace-nowrap transition-colors hover:border-[#C5A5FF]/50"
              >
                View 5 Builds
              </a>
            </div>
          </div>

          {/* Bottom Assembly Sequence Readout */}
          <div className="pointer-events-auto flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-5 sm:flex-row sm:items-end">
            <div className="max-w-md">
              <div className="flex items-center gap-3 text-xs">
                <span className="font-mono-tech font-medium text-[#C5A5FF]">
                  SCENE {currentScene.number} / 10
                </span>
                <span aria-hidden="true" className="text-white/25">
                  ·
                </span>
                <span className="font-medium text-[#F5F6F8]">{currentScene.title}</span>
              </div>
              <p className="mt-1.5 text-xs text-[#929BA8] sm:text-sm">
                {currentScene.description}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Step tick marks */}
              <div className="hidden items-center gap-1.5 md:flex" aria-hidden="true">
                {ASSEMBLY_SCENES.map((s, idx) => (
                  <span
                    key={s.number}
                    className={`h-1 transition-all duration-200 ${
                      idx <= sceneIndex ? 'w-5 bg-[#C5A5FF]' : 'w-2 bg-white/15'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#929BA8]">
                <span>Scroll to Assemble</span>
                <ArrowDown className="h-3.5 w-3.5 text-[#C5A5FF]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
