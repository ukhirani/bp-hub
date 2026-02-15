import bpLogo from "@/assets/white.png";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Terminal, Zap, Cloud, Package, ArrowRight, ChevronDown } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img className="h-8 w-auto" src={bpLogo} alt="Logo" />
            <span className="text-white font-semibold hidden sm:inline">Boilerplate</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-white"
              onClick={() => navigate("/docs")}
            >
              Docs
            </Button>
            <a
              href="https://github.com/ukhirani/boilerplate"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <Button
              variant="outline"
              className="border-gray-700 hover:bg-gray-800"
              onClick={() => navigate("/login")}
            >
              Sign in
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-16">
        <div className="flex flex-col items-center gap-6 max-w-3xl text-center">
          <img className="h-32 w-auto object-contain" src={bpLogo} alt="Logo" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Skip the boilerplate.
            <br />
            <span className="text-gray-500">Start building.</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-xl">
            A CLI tool that lets developers save and reuse file or project templates, 
            including automated setup commands, to quickly generate code structures.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-200 px-8"
              onClick={() => navigate("/login")}
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-gray-700 hover:bg-gray-800"
              onClick={() => navigate("/docs")}
            >
              Read the Docs
            </Button>
          </div>

          {/* Install snippet */}
          <div className="mt-8 bg-[#0f1117] border border-gray-800 rounded-lg p-4 w-full max-w-md">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
              <Terminal className="w-4 h-4" />
              <span>Install with Homebrew</span>
            </div>
            <code className="text-sm text-green-400">brew tap ukhirani/bp && brew install bp</code>
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={scrollToFeatures}
          className="absolute bottom-8 text-gray-500 hover:text-white transition-colors animate-bounce"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Boilerplate?
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Stop rewriting the same code. Save it once, use it everywhere.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={Zap}
              title="Lightning Fast"
              description="Generate project structures in seconds. No more copy-pasting from old projects."
            />
            <FeatureCard
              icon={Package}
              title="Template Anything"
              description="Save any file or directory as a reusable template with a single command."
            />
            <FeatureCard
              icon={Terminal}
              title="Automated Setup"
              description="Run pre and post commands automatically. Install deps, format code, and more."
            />
            <FeatureCard
              icon={Cloud}
              title="Share & Discover"
              description="Browse templates from the community on BP Hub. Share your best work."
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-6 bg-[#0f1117]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Simple. Powerful. Fast.
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Three commands is all you need to master.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              step="1"
              title="Save"
              command="bp add main.go --name starter"
              description="Save any file or directory as a template."
            />
            <StepCard
              step="2"
              title="Generate"
              command="bp gen starter"
              description="Generate code from your templates instantly."
            />
            <StepCard
              step="3"
              title="Share"
              command="bp clone user/template"
              description="Discover and clone templates from BP Hub."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 border-t border-gray-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to stop repeating yourself?
          </h2>
          <p className="text-gray-400 mb-8">
            Join developers who are saving hours every week with Boilerplate.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-200 px-8"
              onClick={() => navigate("/signup")}
            >
              Create Account
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-gray-700 hover:bg-gray-800"
              onClick={() => navigate("/docs")}
            >
              View Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img className="h-6 w-auto" src={bpLogo} alt="Logo" />
            <span className="text-gray-500 text-sm">© 2026 Boilerplate</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <button onClick={() => navigate("/docs")} className="hover:text-white transition-colors">
              Docs
            </button>
            <a
              href="https://github.com/ukhirani/boilerplate"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature card component
function FeatureCard({ icon: Icon, title, description }: { icon: typeof Zap; title: string; description: string }) {
  return (
    <div className="bg-[#0f1117] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
      <div className="p-3 bg-blue-500/10 rounded-lg w-fit mb-4">
        <Icon className="w-6 h-6 text-blue-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

// Step card component
function StepCard({ step, title, command, description }: { step: string; title: string; command: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
        <span className="text-blue-400 font-bold">{step}</span>
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <div className="bg-[#0a0b0f] border border-gray-800 rounded-lg p-3 mb-3">
        <code className="text-sm text-green-400">{command}</code>
      </div>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

export default LandingPage;
