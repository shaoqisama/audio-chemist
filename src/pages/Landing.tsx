
import { Button } from "@/components/ui/button";
import { Flame, Zap, Skull, FlaskConical } from "lucide-react";
import { Link } from "react-router-dom";

// Breaking Bad-style green glow effect and chemistry-esque icons.
const features = [
  {
    icon: <FlaskConical className="w-8 h-8 text-[#c1f065] mb-3 animate-bounce drop-shadow-glow" />,
    title: "Sample Chemistry",
    description: "Analyze and split musical elements like a true audio alchemist.",
  },
  {
    icon: <Zap className="w-8 h-8 text-[#ffe600] mb-3 animate-pulse drop-shadow-glow" />,
    title: "Instant Results",
    description: "Lightning-fast AI lets you scan, tag and transform with a single click.",
  },
  {
    icon: <Flame className="w-8 h-8 text-[#ff9400] mb-3 animate-wiggle drop-shadow-glow" />,
    title: "Fiery Inspiration",
    description: "Ignite creativity with seamless collab and sample wizardry.",
  },
  {
    icon: <Skull className="w-8 h-8 text-[#b9ffb2] mb-3 animate-spin-slow drop-shadow-glow" />,
    title: "Ultimate Control",
    description: "Master your sound, kill the noise, and take charge – Heisenberg style.",
  },
];

const Landing = () => {
  return (
    <div className="relative flex flex-col min-h-screen justify-between items-center overflow-x-hidden bg-gradient-to-tr from-[#202f1e] via-[#18381d] to-[#222] animate-fade-in">
      {/* Animated Grunge Overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-50 mix-blend-overlay bg-[url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center"></div>
      {/* "Meth" vaporic mist effect (subtle) */}
      <div className="pointer-events-none absolute inset-0 z-10 opacity-30 bg-gradient-to-br from-[#aeea62]/25 via-[#2e4e1c]/15 to-transparent animate-fade-in"></div>

      {/* Header */}
      <header className="relative z-20 w-full px-4 pt-7 flex items-center justify-between max-w-6xl mx-auto">
        <span className="flex items-center space-x-1 text-2xl font-bold tracking-tighter font-playfair text-[#caff70] drop-shadow-glow">
          <span className="bg-[#234c20] px-2 rounded-md text-[#e1fe82] border-2 border-[#afe62c] mr-2 shadow-lg">Au</span>
          <span>AUDIO</span>
          <span className="ml-2 bg-[#234c20] px-2 rounded-md text-[#e1fe82] border-2 border-[#afe62c] shadow-lg">Al</span>
          <span>CHEMIST</span>
        </span>
        <Link to="/" className="ml-2">
          <Button variant="outline" size="sm" className="!bg-[#232] !text-[#caff70] border-[#b4e762] hover:!bg-[#2c521d] hover:border-[#ffe600] shadow-md">
            Enter Lab
          </Button>
        </Link>
      </header>

      {/* Hero Section */}
      <section className="relative z-20 flex flex-col flex-1 w-full items-center justify-center px-4 py-10 md:pt-24 animate-fade-in">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-[#cbff6c] via-[#ffe600] to-[#6ee7b7] text-transparent bg-clip-text animate-fade-in mb-3 drop-shadow-glow uppercase">
            <span className="inline-block transform hover:scale-110 transition-transform">BREAK THE <span className="inline bg-[#1e3d23] px-3 rounded-md text-[#ffe600] border-2 border-[#d3ff6d] shadow-2xl">AUDIO</span></span>
          </h1>
          <p className="mt-7 mb-12 text-lg md:text-2xl text-[#cedfc2] font-light drop-shadow-md">
            Rule your sample empire. <span className="text-[#e1fe82] font-bold">Detect</span>, <span className="text-[#ffe600] font-bold">split</span>, 
            and <span className="text-[#ffb129] font-bold">unleash</span> your tracks with chemistry-level precision.<br/>
            No compromises. No limits. No half measures.
          </p>
          <Link to="/">
            <Button size="lg" className="shadow-xl animate-scale-in px-8 py-5 text-xl border-2 border-[#d3ff6d] bg-[#202f1e] text-[#ffe600] hover:bg-[#232f1e] hover:text-[#61e752] drop-shadow-glow transition-all duration-200 font-bold uppercase">
              <Flame className="mr-2 h-6 w-6 animate-wiggle" />
              Enter the Lab
            </Button>
          </Link>
        </div>

        {/* Responsive Features grid */}
        <div className="mt-12 md:mt-20 grid gap-5 w-full max-w-6xl xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          {features.map((f, idx) => (
            <div
              key={f.title}
              className="bg-[#212e1f]/80 border border-[#80bf1f]/30 rounded-2xl p-7 flex flex-col items-center text-center shadow-2xl backdrop-blur-[1.5px] animate-scale-in hover:scale-105 transition-transform duration-300 mb-4 min-h-[170px]"
              style={{
                animationDelay: `${idx * 0.13 + 0.4}s`
              }}
            >
              {f.icon}
              <h3 className="font-semibold text-lg tracking-wide text-[#caff70] mb-1">{f.title}</h3>
              <p className="text-md text-[#b2cac4]">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 w-full pb-8 pt-8 flex items-center justify-center text-xs text-[#bde597] tracking-wide">
        <span>
          &copy; {new Date().getFullYear()} Audio Chemist. 
          <span className="ml-1 text-[#ffe600] font-black">Say my name.</span>
        </span>
      </footer>

      {/* Extra: Grunge green shadow */}
      <div className="pointer-events-none fixed inset-0 z-10 opacity-25 blur-[2px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#cbff6c]/40 via-transparent to-transparent"></div>
      <style>
        {`
          .drop-shadow-glow {
            filter: drop-shadow(0 0 7px #aef752aa);
          }
          @media (max-width: 600px) {
            .font-playfair, .text-4xl, .text-5xl, .text-6xl {
              font-size: 1.7rem !important;
              line-height: 2.3rem !important;
            }
            .md\\:pt-24 {
              padding-top: 1rem !important;
            }
            .max-w-2xl, .max-w-6xl {
              max-width: 98vw !important;
              padding: 0 0.2rem !important;
            }
            section > div {
              margin-top: 2rem !important;
              margin-bottom: 2rem !important;
            }
          }
          @keyframes wiggle {
            0%, 100% { transform: rotate(-7deg);}
            50% { transform: rotate(7deg);}
          }
          .animate-wiggle {
            animation: wiggle 1.8s ease-in-out infinite;
          }
          @keyframes spin-slow {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
          .animate-spin-slow {
            animation: spin-slow 8s linear infinite;
          }
        `}
      </style>
    </div>
  );
};

export default Landing;
