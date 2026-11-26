import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'HOME' },
  { id: 'components', label: 'COMPONENTS' },
  { id: 'experience', label: 'EXPERIENCE' },
  { id: 'builds', label: 'BUILDS' },
  { id: 'about', label: 'ABOUT' },
] as const;

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string>('home');
  const [mobileOpen, setMobileOpen] = useState(false);

  const isBuildPage = location.pathname.startsWith('/builds/');

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      const ratio = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      setScrollProgress(ratio);

      if (location.pathname === '/') {
        const offsets = NAV_ITEMS.map((item) => {
          const el = document.getElementById(item.id);
          if (!el) return { id: item.id, top: Infinity };
          return { id: item.id, top: Math.abs(el.getBoundingClientRect().top - 120) };
        });
        offsets.sort((a, b) => a.top - b.top);
        if (offsets[0]) setActiveSection(offsets[0].id);
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  const scrollToSection = (id: string) => {
    setMobileOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      window.setTimeout(() => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
      return;
    }
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className="fixed top-0 right-0 left-0 z-40 border-b border-white/10 bg-[#07090D]/92">
      {/* Top Scroll Progress Bar */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 h-[2px] bg-[#C5A5FF] transition-[width] duration-75"
        style={{ width: `${scrollProgress * 100}%` }}
      />

      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-8 px-6 lg:px-10">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => scrollToSection('home')}
          className="font-display shrink-0 cursor-pointer text-base font-semibold tracking-[0.06em] text-[#F5F6F8] whitespace-nowrap transition-colors hover:text-[#C5A5FF] focus-visible:outline-2 focus-visible:outline-[#C5A5FF]"
        >
          PC MASTERPIECE
        </button>

        {/* Zone 2: 5 Single-Line Navigation Links */}
        <nav aria-label="Primary navigation" className="hidden items-center gap-7 md:flex">
          {NAV_ITEMS.map((item) => {
            const isActive =
              (isBuildPage && item.id === 'builds') ||
              (!isBuildPage && activeSection === item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`relative cursor-pointer py-1 text-xs font-medium tracking-[0.12em] whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-[#C5A5FF] ${
                  isActive ? 'text-[#F5F6F8]' : 'text-[#929BA8] hover:text-[#F5F6F8]'
                }`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute right-0 bottom-0 left-0 h-[1.5px] bg-[#C5A5FF] transition-transform duration-200 ${
                    isActive ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action + Mobile Drawer Toggle */}
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => scrollToSection('builds')}
            className="hidden cursor-pointer rounded-md border border-[#C5A5FF]/40 bg-[#C5A5FF]/15 px-4 py-2 text-xs font-medium tracking-wide text-[#F5F6F8] whitespace-nowrap shrink-0 transition-colors hover:border-[#C5A5FF] hover:bg-[#C5A5FF]/25 focus-visible:outline-2 focus-visible:outline-[#C5A5FF] md:inline-flex"
          >
            Explore Builds
          </button>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-white/10 bg-[#10141B] text-[#F5F6F8] md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#07090D] px-6 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive =
                (isBuildPage && item.id === 'builds') ||
                (!isBuildPage && activeSection === item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={`flex min-h-[44px] w-full items-center justify-between rounded-md px-3 text-left text-xs font-medium tracking-[0.12em] ${
                    isActive
                      ? 'bg-[#151A22] text-[#C5A5FF]'
                      : 'text-[#929BA8] hover:bg-[#10141B] hover:text-[#F5F6F8]'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => scrollToSection('builds')}
              className="mt-2 min-h-[44px] w-full rounded-md border border-[#C5A5FF]/40 bg-[#C5A5FF]/15 px-4 py-2 text-xs font-medium tracking-wide text-[#F5F6F8]"
            >
              Explore Builds
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
