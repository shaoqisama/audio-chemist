
import { Button } from "@/components/ui/button";
import { FlaskConical, Atom, TestTubeDiagonal, Beaker } from "lucide-react";
import { Link } from "react-router-dom";

// Enhanced Breaking Bad-style green/yellow palette and chemistry details
const features = [
  {
    icon: <FlaskConical className="w-9 h-9 text-[#cdfc5d] mb-3 animate-bounce drop-shadow-glow" />,
    title: "Sample Chemistry",
    description: "Analyze and split musical elements like a true audio alchemist.",
  },
  {
    icon: <Atom className="w-9 h-9 text-[#ffe600] mb-3 animate-pulse drop-shadow-glow" />,
    title: "Instant Results",
    description: "Lightning-fast AI lets you scan, tag and transform with a single click.",
  },
  {
    icon: <TestTubeDiagonal className="w-9 h-9 text-[#e1fe82] mb-3 animate-wiggle drop-shadow-glow" />,
    title: "Fiery Inspiration",
    description: "Ignite creativity with seamless collab and sample wizardry.",
  },
  {
    icon: <Beaker className="w-9 h-9 text-[#c0ffa8] mb-3 animate-spin-slow drop-shadow-glow" />,
    title: "Ultimate Control",
    description: "Master your sound, kill the noise, and take charge – Heisenberg style.",
  },
];

const Landing = () => {
  return (
    <div className="relative flex flex-col min-h-screen justify-between items-center overflow-x-hidden bg-gradient-to-br from-[#23390d] via-[#284b1c] to-[#161f11] animate-fade-in">

      {/* Chemistry Grunge & Animated Atoms, Flasks */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-50 mix-blend-overlay bg-[url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center"></div>
      <div className="pointer-events-none absolute inset-0 z-10 opacity-30 bg-gradient-to-br from-[#c1f065]/25 via-[#25431e]/20 to-transparent animate-fade-in"></div>
      {/* floating animated chemistry props, low opacities */}
      <Atom className="pointer-events-none absolute -top-8 left-[6vw] md:left-[13vw] z-20 opacity-30 w-32 h-32 animate-slow-spin" />
      <FlaskConical className="pointer-events-none absolute bottom-8 left-[min(75vw,80%)] z-20 opacity-20 w-20 h-20 animate-jiggle" />
      <TestTubeDiagonal className="pointer-events-none absolute top-1/2 left-[65vw] z-20 opacity-20 w-20 h-20 animate-pulse-fast" />
      <Beaker className="pointer-events-none absolute bottom-12 right-8 opacity-20 w-16 h-16 animate-updown" />

      {/* Header */}
      <header className="relative z-30 w-full px-4 pt-7 flex items-center justify-between max-w-6xl mx-auto">
        <span className="flex items-center space-x-1 text-2xl sm:text-3xl font-extrabold tracking-tight font-playfair text-[#cdfc5d] drop-shadow-glow uppercase">
          <span className="bg-[#234c20] px-2 rounded-md text-[#e7ff92] border-2 border-[#d5ff35] mr-2 shadow-lg">Au</span>
          <span>AUDIO</span>
          <span className="ml-2 bg-[#234c20] px-2 rounded-md text-[#e7ff92] border-2 border-[#d5ff35] shadow-lg">Al</span>
          <span>CHEMIST</span>
        </span>
        <Link to="/" className="ml-2">
          <Button
            variant="outline"
            size="sm"
            className="!bg-[#264111]/80 !text-[#cdfc5d] border-[#c1f065] hover:!bg-[#1d310b] hover:border-[#ffe600] shadow-lg ring-2 ring-[#afdf34]/40"
          >
            Enter Lab
          </Button>
        </Link>
      </header>

      {/* Hero Section */}
      <section className="relative z-30 flex flex-col flex-1 w-full items-center justify-center px-4 py-10 md:pt-24 animate-fade-in">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-[2.3rem] xs:text-4xl sm:text-5xl md:text-6xl font-black tracking-[.05em] bg-gradient-to-br from-[#cdfc5d] via-[#ffe600] to-[#cdf068] text-transparent bg-clip-text animate-glow-title mb-2.5 uppercase drop-shadow-heavy">
            <span className="inline-block px-2 py-1 transition-transform hover:scale-110 duration-200">
              BREAK THE{" "}
              <span className="inline bg-[#1e3d23] px-3 rounded-md text-[#ffe600] border-2 border-[#c1f065] shadow-2xl">
                AUDIO
              </span>
            </span>
          </h1>
          <p className="mt-7 mb-12 text-lg md:text-2xl text-[#c1f065] font-light drop-shadow-md tracking-wide">
            Rule your sample empire. <span className="text-[#e1fe82] font-semibold">Detect</span>,
            <span className="text-[#ffe600] font-bold"> split</span>, and
            <span className="text-[#ffb129] font-bold"> unleash</span> your tracks with chemistry-level precision.
            <br />No compromises. No limits. No half measures.
          </p>
          <Link to="/">
            <Button
              size="lg"
              className="shadow-xl animate-scale-in px-8 py-5 text-xl border-2 border-[#d3ff6d] bg-[#1f3820] text-[#ffe600] hover:bg-[#203211] hover:text-[#61e752] drop-shadow-glow transition-all duration-200 font-extrabold uppercase tracking-wider"
            >
              <FlaskConical className="mr-3 h-7 w-7 animate-wiggle" />
              Enter the Lab
            </Button>
          </Link>
        </div>

        {/* Responsive Features grid */}
        <div className="mt-12 md:mt-20 grid gap-6 w-full max-w-6xl xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          {features.map((f, idx) => (
            <div
              key={f.title}
              className="group bg-gradient-to-br from-[#1f3917]/80 via-[#2e4e1c]/90 to-[#222721]/60 border-4 border-[#cdfc5d]/25 rounded-2xl p-7 flex flex-col items-center text-center shadow-2xl backdrop-blur min-h-[180px] animate-scale-in hover:-translate-y-1 hover:scale-105 transition-all duration-300 ring-1 ring-[#c1f065]/25"
              style={{
                animationDelay: `${idx * 0.13 + 0.4}s`
              }}
            >
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-16 h-2 bg-[#caff70]/60 blur-lg rounded-lg opacity-50 group-hover:scale-110 transition-transform"></div>
              {f.icon}
              <h3 className="font-bold text-lg tracking-wide text-[#cdfc5d] mb-1 uppercase drop-shadow-glow">{f.title}</h3>
              <p className="text-sm text-[#e1fe82]/80">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-30 w-full pb-8 pt-8 flex items-center justify-center text-xs text-[#d5ff35] tracking-wide font-mono border-t border-[#cdfc5d]/10 bg-gradient-to-t from-[#223315]/70 via-transparent to-transparent">
        <span>
          &copy; {new Date().getFullYear()} Audio Chemist.
          <span className="ml-1 text-[#ffe600] font-black">Say my name.</span>
        </span>
      </footer>

      {/* Chemistry Glow */}
      <div className="pointer-events-none fixed inset-0 z-20 opacity-35 blur-[3px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#cbff6c]/50 via-transparent to-transparent"></div>

      <style>
        {`
          .drop-shadow-glow {
            filter: drop-shadow(0 0 7px #caff70b2);
          }
          .drop-shadow-heavy {
            filter: drop-shadow(0 6px 22px #d5ff358c);
          }
          @keyframes wiggle {
            0%, 100% { transform: rotate(-7deg);}
            50% { transform: rotate(7deg);}
          }
          .animate-wiggle {
            animation: wiggle 2.2s ease-in-out infinite;
          }
          @keyframes spin-slow {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
          .animate-spin-slow {
            animation: spin-slow 10s linear infinite;
          }
          @keyframes updown {
            0%,100%{transform:translateY(0);}
            50%{transform:translateY(-22px);}
          }
          .animate-updown{animation:updown 3.8s ease-in-out infinite;}
          @keyframes jiggle{
            0%,100%{transform:rotate(-15deg);}
            40%{transform:rotate(10deg);}
            70%{transform:rotate(3deg);}
            80%{transform:rotate(-2deg);}
            90%{transform:rotate(5deg);}
          }
          .animate-jiggle{animation:jiggle 7s cubic-bezier(.7,.09,0,.99) infinite;}
          @keyframes slow-spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}
          .animate-slow-spin{animation:slow-spin 22s linear infinite;}
          @keyframes pulse-fast{0%,100%{opacity:.5;}50%{opacity:1;}}
          .animate-pulse-fast{animation:pulse-fast 1.5s cubic-bezier(.4,0,.6,1) infinite;}
          @keyframes glow-title{0%,100%{text-shadow:0 0 16px #cdfc5d3b,0 0 8px #c1f06561;}50%{text-shadow:0 0 32px #e2fc8b,0 0 18px #ffe600;}}
          .animate-glow-title{animation:glow-title 2.5s infinite alternate;}
          /* Responsiveness for breaking bad style */
          @media (max-width: 700px) {
            .font-playfair, .text-4xl, .text-5xl, .text-6xl {
              font-size: 2.1rem !important;
              line-height: 2.36rem !important;
            }
            .md\\:pt-24 { padding-top: 1rem !important; }
            .max-w-2xl, .max-w-6xl { max-width: 98vw !important; padding: 0 0.2rem !important; }
            section > div { margin-top: 1.5rem !important; margin-bottom: 1.5rem !important; }
          }
          @media (max-width: 480px) {
            .text-4xl,.text-5xl,.text-6xl { font-size: 1.5rem !important; }
            section { padding: 0.2rem !important; }
          }
        `}
      </style>
    </div>
  );
};

export default Landing;
