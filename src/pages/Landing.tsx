
import { Button } from "@/components/ui/button";
import { Play, Music, Search, Users } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: <Music className="w-7 h-7 text-primary mb-2 animate-bounce" />,
    title: "Audio Analysis",
    description: "Detect, split, and manage samples with powerful AI-powered audio analysis.",
  },
  {
    icon: <Search className="w-7 h-7 text-secondary mb-2 animate-pulse" />,
    title: "Fast Sample Search",
    description: "Instantly search and filter your samples and libraries from any device.",
  },
  {
    icon: <Users className="w-7 h-7 text-accent mb-2 animate-bounce" />,
    title: "Collaborate",
    description: "Save and share your sample libraries and work as a team.",
  },
];

const Landing = () => {
  return (
    <div className="flex flex-col min-h-screen justify-between items-center bg-gradient-to-tr from-background via-card to-[#18171e] animate-fade-in">
      {/* Header */}
      <header className="w-full px-4 pt-6 flex items-center justify-between max-w-6xl mx-auto">
        <span className="text-xl font-bold text-primary font-playfair tracking-tight">Audio Alchemist</span>
        <Link to="/" className="ml-2">
          <Button variant="outline" size="sm">
            Go to App
          </Button>
        </Link>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col flex-1 w-full items-center justify-center px-4 py-10 md:pt-24 animate-fade-in">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text animate-fade-in">
            Turn Your Audio Into Magic
          </h1>
          <p className="mt-6 mb-8 text-lg md:text-xl text-muted-foreground">
            The easy way to detect, split, tag, and manage all your audio samples using next-gen AI, right in your browser.
          </p>
          <Link to="/">
            <Button size="lg" className="shadow-lg px-8 py-5 animate-scale-in">
              <Play className="mr-2 h-5 w-5" />
              Open the App
            </Button>
          </Link>
        </div>

        {/* Animated Features */}
        <div className="mt-10 md:mt-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-10 w-full max-w-5xl">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="bg-card border border-border backdrop-blur-lg rounded-2xl p-6 flex flex-col items-center text-center shadow-xl animate-fade-in hover:scale-105 transition-transform duration-300"
              style={{ animationDelay: `${idx * 0.1 + 0.3}s` }}
            >
              {f.icon}
              <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full pb-6 pt-6 flex items-center justify-center text-xs text-muted-foreground">
        <span>
          &copy; {new Date().getFullYear()} Audio Alchemist. Built with <span className="text-primary">audio sorcery</span>.
        </span>
      </footer>
    </div>
  );
};

export default Landing;
