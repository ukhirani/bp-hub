import { useState, useEffect, useRef, useMemo } from "react";
import DocsSidebar, { type DocsChapter } from "@/components/layout/DocsSidebar";
import {
  Terminal,
  Cloud,
  AlertTriangle,
  Book,
  Zap,
  Package,
  Settings,
  Copy,
  Check,
} from "lucide-react";
import Prism from "prismjs";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-json";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-go";
import "prismjs/components/prism-toml";
import "prismjs/themes/prism-tomorrow.css";

// Define documentation chapters and sections
const docsChapters: DocsChapter[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Book,
    sections: [
      { id: "introduction", title: "Introduction" },
      { id: "installation", title: "Installation" },
      { id: "quick-start", title: "Quick Start" },
    ],
  },
  {
    id: "usage",
    title: "Usage",
    icon: Terminal,
    sections: [
      { id: "basic-commands", title: "Basic Commands" },
      { id: "adding-templates", title: "Adding Templates" },
      { id: "generating-code", title: "Generating Code" },
      { id: "previewing", title: "Previewing Templates" },
      { id: "configuration", title: "Configuration" },
    ],
  },
  {
    id: "bp-hub",
    title: "BP Hub",
    icon: Cloud,
    sections: [
      { id: "overview", title: "Overview" },
      { id: "cloning-templates", title: "Cloning Templates" },
      { id: "sharing-templates", title: "Sharing Templates" },
    ],
  },
  {
    id: "advanced",
    title: "Advanced",
    icon: Settings,
    sections: [
      { id: "pre-post-commands", title: "Pre & Post Commands" },
      { id: "template-structure", title: "Template Structure" },
      { id: "toml-config", title: "TOML Configuration" },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    icon: AlertTriangle,
    sections: [
      { id: "common-issues", title: "Common Issues" },
      { id: "faq", title: "FAQ" },
    ],
  },
];

// Code block component
function CodeBlock({
  code,
  language = "bash",
}: {
  code: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);
  const highlighted = useMemo(() => {
    const grammar = Prism.languages[language] || Prism.languages.bash;
    return Prism.highlight(code, grammar, language);
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <div className="relative my-4">
      <pre className="bg-gray-900 border border-gray-800 rounded p-4 pr-24 overflow-x-auto">
        <code
          className={`language-${language} text-sm leading-relaxed block`}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-2 top-2 inline-flex items-center gap-1.5 rounded bg-gray-800 border border-gray-700 px-2.5 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-700 hover:border-gray-600 transition-colors"
        aria-label="Copy code"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-green-400" />
            <span className="text-green-400">Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>Copy</span>
          </>
        )}
      </button>
    </div>
  );
}

// Section heading component
function SectionHeading({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h2 id={id} className="text-2xl font-bold text-white mb-4 pt-8 scroll-mt-8">
      {children}
    </h2>
  );
}

// Subsection heading component
function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-semibold text-white mb-3 mt-6">{children}</h3>
  );
}

// Paragraph component
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-400 mb-4 leading-relaxed">{children}</p>;
}

// List component
function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc list-inside space-y-2 text-gray-400 mb-4">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

// Feature card component
function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Zap;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-[#0f1117] border border-gray-800 rounded p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-500/10 rounded border border-blue-500/20">
          <Icon className="w-5 h-5 text-blue-400" />
        </div>
        <h4 className="font-semibold text-white">{title}</h4>
      </div>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

export default function Docs() {
  const [activeSection, setActiveSection] = useState(
    "getting-started-introduction",
  );
  const contentRef = useRef<HTMLDivElement>(null);

  const handleSectionClick = (chapterId: string, sectionId: string) => {
    const element = document.getElementById(`${chapterId}-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(`${chapterId}-${sectionId}`);
    }
  };

  // Update active section on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -80% 0px" },
    );

    const sections = document.querySelectorAll("[data-section]");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0b0f] flex">
      <DocsSidebar
        chapters={docsChapters}
        activeSection={activeSection}
        onSectionClick={handleSectionClick}
      />

      {/* Main content */}
      <main className="flex-1 lg:ml-72">
        <div ref={contentRef} className="max-w-4xl mx-auto px-6 py-12">
          {/* Getting Started */}
          <section
            id="getting-started-introduction"
            data-section
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded border border-blue-500/20">
                <Book className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Getting Started
                </h1>
                <p className="text-gray-500">
                  Learn how to install and use Boilerplate CLI
                </p>
              </div>
            </div>

            <P>
              Boilerplate (bp) is a CLI tool that lets developers save and reuse
              file or project templates, including automated setup commands, to
              quickly generate code structures and eliminate repetitive work.
            </P>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
              <FeatureCard
                icon={Zap}
                title="Lightning Fast"
                description="Generate project structures in seconds, not minutes."
              />
              <FeatureCard
                icon={Package}
                title="Template Everything"
                description="Save any file or directory as a reusable template."
              />
              <FeatureCard
                icon={Terminal}
                title="Automated Setup"
                description="Run pre and post commands automatically after generation."
              />
              <FeatureCard
                icon={Cloud}
                title="Share & Discover"
                description="Share templates with the community via BP Hub."
              />
            </div>
          </section>

          <section
            id="getting-started-installation"
            data-section
            className="mb-16"
          >
            <SectionHeading id="installation">Installation</SectionHeading>

            <SubHeading>Using Homebrew (macOS)</SubHeading>
            <P>The recommended way to install Boilerplate on macOS:</P>
            <CodeBlock code={`brew install ukhirani/bp/bp`} />

            <SubHeading>Linux</SubHeading>
            <P>Install using the install script:</P>
            <CodeBlock
              code={`curl -fsSL https://raw.githubusercontent.com/ukhirani/boilerplate/main/install.sh | sh`}
            />

            <SubHeading>Using Go</SubHeading>
            <P>If you have Go installed:</P>
            <CodeBlock
              code={`go install github.com/ukhirani/boilerplate/bp@latest`}
            />

            <SubHeading>Verify Installation</SubHeading>
            <P>After installation, verify that bp is installed correctly:</P>
            <CodeBlock code={`bp --version`} />
          </section>

          <section
            id="getting-started-quick-start"
            data-section
            className="mb-16"
          >
            <SectionHeading id="quick-start">Quick Start</SectionHeading>

            <P>Get started with Boilerplate in just a few steps:</P>

            <SubHeading>1. Create your first template</SubHeading>
            <CodeBlock
              code={`# Save a file as a template
bp add main.go --name go-starter

# Save a directory as a template
bp add ./my-project --name react-app`}
            />

            <SubHeading>2. Generate from template</SubHeading>
            <CodeBlock
              code={`# Generate with default name
bp gen go-starter

# Generate with custom name
bp gen go-starter app.go`}
            />

            <SubHeading>3. List your templates</SubHeading>
            <CodeBlock code={`bp list`} />
          </section>

          {/* Usage */}
          <section id="usage-basic-commands" data-section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500/10 rounded border border-green-500/20">
                <Terminal className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Usage</h1>
                <p className="text-gray-500">Complete command reference</p>
              </div>
            </div>

            <SectionHeading id="basic-commands">Basic Commands</SectionHeading>

            <div className="space-y-6">
              <div>
                <SubHeading>Help</SubHeading>
                <P>Display help information and available commands:</P>
                <CodeBlock
                  code={`bp --help
bp -h`}
                />
              </div>

              <div>
                <SubHeading>Version</SubHeading>
                <P>Check the current version:</P>
                <CodeBlock code={`bp --version`} />
              </div>

              <div>
                <SubHeading>List Templates</SubHeading>
                <P>Show all available templates:</P>
                <CodeBlock
                  code={`bp list
bp ls`}
                />
              </div>
            </div>
          </section>

          <section id="usage-adding-templates" data-section className="mb-16">
            <SectionHeading id="adding-templates">
              Adding Templates
            </SectionHeading>

            <P>Save files or directories as reusable templates:</P>

            <CodeBlock
              code={`# Add a file with its filename as template name
bp add main.cpp

# Add with a custom template name
bp add main.cpp --name cpp-starter

# Add a directory
bp add ./my-react-app --name react-template`}
            />

            <div className="bg-blue-500/10 border border-blue-500/30 rounded p-4 mt-4">
              <p className="text-sm text-blue-300">
                <strong>Tip:</strong> Template names should be short and
                memorable. Use lowercase with hyphens for multi-word names.
              </p>
            </div>
          </section>

          <section id="usage-generating-code" data-section className="mb-16">
            <SectionHeading id="generating-code">
              Generating Code
            </SectionHeading>

            <P>Generate code from your saved templates:</P>

            <CodeBlock
              code={`# Generate with default name
bp gen <template-name>

# Generate with custom filename (for file templates)
bp gen <template-name> <custom-name>

# Generate to a specific directory
bp gen <template-name> --dir ./src/components`}
            />

            <SubHeading>Examples</SubHeading>
            <CodeBlock
              code={`# Generate a Go file
bp gen go-starter main.go

# Generate a React component in a specific folder
bp gen react-component --dir ./src/components`}
            />
          </section>

          <section id="usage-previewing" data-section className="mb-16">
            <SectionHeading id="previewing">
              Previewing Templates
            </SectionHeading>

            <P>Preview template contents before generating:</P>

            <CodeBlock
              code={`# Preview template content
bp preview <template-name>

# Preview with configuration details
bp preview <template-name> --config`}
            />

            <P>
              The <code className="text-blue-400">--config</code> flag shows
              additional metadata including pre/post commands.
            </P>
          </section>

          <section id="usage-configuration" data-section className="mb-16">
            <SectionHeading id="configuration">Configuration</SectionHeading>

            <P>Edit template configuration in your default editor:</P>

            <CodeBlock
              code={`# Open config in default editor (VS Code)
bp config <template-name>

# Use a specific editor
bp config <template-name> --editor vim
bp config <template-name> -e nano`}
            />
          </section>

          {/* BP Hub */}
          <section id="bp-hub-overview" data-section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/10 rounded border border-purple-500/20">
                <Cloud className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">BP Hub</h1>
                <p className="text-gray-500">Share and discover templates</p>
              </div>
            </div>

            <SectionHeading id="bp-hub-overview-heading">
              Overview
            </SectionHeading>

            <P>
              BP Hub is the community platform for sharing and discovering
              templates. Browse templates created by other developers, clone
              them to your local machine, and share your own creations with the
              world.
            </P>

            <List
              items={[
                "Browse templates from the community",
                "Clone templates directly from the CLI",
                "Share your templates with others",
                "Star and track popular templates",
              ]}
            />
          </section>

          <section id="bp-hub-cloning-templates" data-section className="mb-16">
            <SectionHeading id="cloning-templates">
              Cloning Templates
            </SectionHeading>

            <P>Clone templates from BP Hub to your local machine:</P>

            <CodeBlock
              code={`# Clone a template
bp clone <username>/<template-name>

# Clone with a custom local alias
bp clone <username>/<template-name> --alias my-template`}
            />

            <SubHeading>Example</SubHeading>
            <CodeBlock
              code={`# Clone the cpp template from umanghirani
bp clone umanghirani/cpp --alias cpp-starter

# Now use it like any local template
bp gen cpp-starter`}
            />
          </section>

          <section id="bp-hub-sharing-templates" data-section className="mb-16">
            <SectionHeading id="sharing-templates">
              Sharing Templates
            </SectionHeading>

            <P>
              To share templates on BP Hub, visit the web platform and create an
              account. You can then add templates through the web interface,
              including file templates with code or directory templates linked
              to GitHub repositories.
            </P>

            <div className="bg-gray-800/50 border border-gray-700 rounded p-4 mt-4">
              <p className="text-sm text-gray-300">
                Visit{" "}
                <a href="/" className="text-blue-400 hover:underline">
                  bp-hub
                </a>{" "}
                to create an account and start sharing templates.
              </p>
            </div>
          </section>

          {/* Advanced */}
          <section
            id="advanced-pre-post-commands"
            data-section
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-500/10 rounded border border-orange-500/20">
                <Settings className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Advanced</h1>
                <p className="text-gray-500">Power user features</p>
              </div>
            </div>

            <SectionHeading id="pre-post-commands">
              Pre & Post Commands
            </SectionHeading>

            <P>
              Templates can include commands that run automatically before and
              after code generation. This is useful for installing dependencies,
              formatting code, or running build scripts.
            </P>

            <SubHeading>Pre Commands</SubHeading>
            <P>Run before the template is generated:</P>
            <CodeBlock
              code={`# Example: Install dependencies before generating
PreCmd = ["npm init -y"]`}
              language="toml"
            />

            <SubHeading>Post Commands</SubHeading>
            <P>Run after the template is generated:</P>
            <CodeBlock
              code={`# Example: Install and format after generating
PostCmd = ["npm install", "npm run format"]`}
              language="toml"
            />
          </section>

          <section
            id="advanced-template-structure"
            data-section
            className="mb-16"
          >
            <SectionHeading id="template-structure">
              Template Structure
            </SectionHeading>

            <P>Templates are stored in your home directory:</P>

            <CodeBlock
              code={`$HOME/boilerplate/templates/
├── react-component/
│   ├── react-component.toml    # Configuration file
│   └── Component.tsx           # Template file
├── go-server/
│   ├── go-server.toml          # Configuration file
│   ├── main.go                 # Multiple files...
│   ├── handler.go
│   └── Makefile
└── ...`}
            />
          </section>

          <section id="advanced-toml-config" data-section className="mb-16">
            <SectionHeading id="toml-config">TOML Configuration</SectionHeading>

            <P>
              Each template has a TOML configuration file with the following
              structure:
            </P>

            <CodeBlock
              code={`Name = "react-component"
IsDir = false
PreCmd = []
PostCmd = ["npm run format"]`}
              language="toml"
            />

            <SubHeading>Configuration Fields</SubHeading>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-gray-400 border-b border-gray-800">
                  <tr>
                    <th className="px-4 py-3">Field</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Description</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-gray-800">
                    <td className="px-4 py-3">
                      <code className="text-blue-400">Name</code>
                    </td>
                    <td className="px-4 py-3">string</td>
                    <td className="px-4 py-3">Template identifier</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="px-4 py-3">
                      <code className="text-blue-400">IsDir</code>
                    </td>
                    <td className="px-4 py-3">boolean</td>
                    <td className="px-4 py-3">True for directory templates</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="px-4 py-3">
                      <code className="text-blue-400">PreCmd</code>
                    </td>
                    <td className="px-4 py-3">string[]</td>
                    <td className="px-4 py-3">
                      Commands to run before generation
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <code className="text-blue-400">PostCmd</code>
                    </td>
                    <td className="px-4 py-3">string[]</td>
                    <td className="px-4 py-3">
                      Commands to run after generation
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Troubleshooting */}
          <section
            id="troubleshooting-common-issues"
            data-section
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-500/10 rounded border border-red-500/20">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Troubleshooting
                </h1>
                <p className="text-gray-500">Common issues and solutions</p>
              </div>
            </div>

            <SectionHeading id="common-issues">Common Issues</SectionHeading>

            <SubHeading>Command not found</SubHeading>
            <P>If you get "command not found" after installation:</P>
            <CodeBlock
              code={`# Add Go bin to your PATH
export PATH=$PATH:$(go env GOPATH)/bin

# Or for homebrew on Apple Silicon
export PATH=$PATH:/opt/homebrew/bin`}
            />

            <SubHeading>Template not found</SubHeading>
            <P>If a template isn't showing up:</P>
            <List
              items={[
                "Check if the template exists with `bp list`",
                "Verify the template name is spelled correctly",
                "Check the templates directory: `ls ~/boilerplate/templates/`",
              ]}
            />

            <SubHeading>Permission denied</SubHeading>
            <P>If you get permission errors:</P>
            <CodeBlock
              code={`# Fix permissions on templates directory
chmod -R 755 ~/boilerplate/templates/`}
            />

            <SubHeading>Clone fails from BP Hub</SubHeading>
            <P>If cloning templates fails:</P>
            <List
              items={[
                "Check your internet connection",
                "Verify the template exists on BP Hub",
                "Try with the full username/template format",
              ]}
            />
          </section>

          <section id="troubleshooting-faq" data-section className="mb-16">
            <SectionHeading id="faq">FAQ</SectionHeading>

            <div className="space-y-6">
              <div>
                <SubHeading>Where are templates stored?</SubHeading>
                <P>
                  Templates are stored in{" "}
                  <code className="text-blue-400">
                    $HOME/boilerplate/templates/
                  </code>
                </P>
              </div>

              <div>
                <SubHeading>Can I use bp without an account?</SubHeading>
                <P>
                  Yes! The CLI works completely offline for local templates. You
                  only need an account to use BP Hub features like cloning and
                  sharing templates.
                </P>
              </div>

              <div>
                <SubHeading>How do I update bp?</SubHeading>
                <CodeBlock
                  code={`# Using Homebrew
brew upgrade bp

# Using Go
go install github.com/ukhirani/boilerplate/bp@latest`}
                />
              </div>

              <div>
                <SubHeading>Can I backup my templates?</SubHeading>
                <P>
                  Yes, simply backup the{" "}
                  <code className="text-blue-400">
                    ~/boilerplate/templates/
                  </code>{" "}
                  directory. You can also version control it with Git.
                </P>
              </div>

              <div>
                <SubHeading>What file types are supported?</SubHeading>
                <P>
                  Any file type! Boilerplate doesn't process file contents - it
                  simply copies them. You can template any programming language,
                  config format, or binary file.
                </P>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="border-t border-gray-800 pt-8 mt-16">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <p>Made for developers</p>
              <a
                href="https://github.com/ukhirani/boilerplate"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Star on GitHub
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
