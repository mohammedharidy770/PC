import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PC_BUILDS } from '../data/builds';

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

  const jumpTo = (id: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-white/10 bg-[#07090D] py-16">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-lg font-semibold tracking-[0.06em] text-[#F5F6F8]">
              PC MASTERPIECE
            </p>
            <p className="mt-2 text-xs tracking-[0.14em] text-[#C5A5FF]">BUILD YOUR LEGEND.</p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#929BA8]">
              Bespoke custom workstation and gaming PC architecture sculpted from brushed anodized aluminum, tempered glass, and precision liquid cooling.
            </p>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold tracking-[0.1em] text-[#F5F6F8]">
              EXPERIENCE
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[#929BA8]">
              <li>
                <button
                  type="button"
                  onClick={() => jumpTo('home')}
                  className="cursor-pointer transition-colors hover:text-[#F5F6F8]"
                >
                  3D Assembly Showcase
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => jumpTo('experience')}
                  className="cursor-pointer transition-colors hover:text-[#F5F6F8]"
                >
                  Interactive 3D Viewer
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => jumpTo('components')}
                  className="cursor-pointer transition-colors hover:text-[#F5F6F8]"
                >
                  Component Explorer
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => jumpTo('rgb-studio')}
                  className="cursor-pointer transition-colors hover:text-[#F5F6F8]"
                >
                  RGB Lighting Studio
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-xs font-semibold tracking-[0.1em] text-[#F5F6F8]">
              SIGNATURE BUILDS
            </h3>
            <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {PC_BUILDS.map((b) => (
                <li key={b.slug}>
                  <Link
                    to={`/builds/${b.slug}`}
                    className="flex items-center gap-2 text-sm text-[#929BA8] transition-colors hover:text-[#C5A5FF]"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: b.accentColor }}
                    />
                    <span>{b.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs text-[#929BA8] sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} PC MASTERPIECE. All hardware specifications shown are illustrative design profiles.</p>
          <p className="font-mono-tech text-[#929BA8]">REAL-TIME WEBGL SHOWCASE</p>
        </div>
      </div>
    </footer>
  );
}
