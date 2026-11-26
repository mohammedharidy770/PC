export default function AboutSection() {
  const pillars = [
    {
      index: '01',
      title: 'CNC Anodized Aluminum',
      detail:
        'Structural chassis rails, VRM heatsinks, and GPU shrouds are sculpted from brushed alloy with directional grain finishes that catch studio light without plastic glare.',
    },
    {
      index: '02',
      title: 'Optical Tempered Glazing',
      detail:
        '4mm tempered glass panels with ceramic frit borders frame internal components cleanly while preserving unobstructed thermal pathways.',
    },
    {
      index: '03',
      title: 'Dual-Chamber Cable Architecture',
      detail:
        'Custom-length sleeved power harnesses route directly through recessed motherboard grommets with billet aluminum combs for zero clutter.',
    },
    {
      index: '04',
      title: 'Thermal & Acoustic Harmony',
      detail:
        'Top-exhaust 360mm liquid radiators pair with front intake static-pressure fans to maintain calm acoustic profiles under sustained workloads.',
    },
  ];

  return (
    <section id="about" className="border-t border-white/10 bg-[#07090D] py-24">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-xs font-medium tracking-[0.16em] text-[#C5A5FF]">
              DESIGN PHILOSOPHY
            </p>
            <h2 className="font-display mt-2 text-[clamp(1.75rem,3vw,2.75rem)] font-semibold tracking-tight text-[#F5F6F8]">
              Engineered as Industrial Sculpture
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#929BA8] sm:text-base">
              PC MASTERPIECE treats custom desktop hardware with the rigor of precision industrial design. Every bevel, heatpipe bend, and light guide exists to unify mechanical performance with architectural poise.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-7">
            {pillars.map((pillar) => (
              <div
                key={pillar.index}
                className="rounded-xl border border-white/10 bg-[#10141B] p-6"
              >
                <span className="font-mono-tech text-xs font-medium text-[#C5A5FF]">
                  {pillar.index}
                </span>
                <h3 className="font-display mt-2 text-lg font-semibold text-[#F5F6F8]">
                  {pillar.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#929BA8]">
                  {pillar.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
