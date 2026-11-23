import { useEffect, useState, type ReactNode } from "react";
import { AppShell } from "@astryxdesign/core/AppShell";
import { TopNav, TopNavHeading, TopNavItem } from "@astryxdesign/core/TopNav";
import {
  SideNav,
  SideNavItem,
  SideNavSection,
} from "@astryxdesign/core/SideNav";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Code } from "@astryxdesign/core/Code";
import { CodeBlock as AstryxCodeBlock } from "@astryxdesign/core/CodeBlock";
import { List, ListItem } from "@astryxdesign/core/List";
import { Banner } from "@astryxdesign/core/Banner";
import { Link } from "@astryxdesign/core/Link";
import { Table, pixel } from "@astryxdesign/core/Table";
import { Divider } from "@astryxdesign/core/Divider";
import { Button } from "@astryxdesign/core/Button";
import {
  AlertTriangle,
  Book,
  Cloud,
  Settings,
  Terminal,
  type LucideIcon,
} from "lucide-react";

import BrandMark from "@/components/BrandMark";
import { useAuth } from "@/context/AuthContext";

type DocsChapter = {
  id: string;
  title: string;
  icon: LucideIcon;
  sections: { id: string; title: string }[];
};

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

function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  return (
    <AstryxCodeBlock
      code={code}
      language={language}
      hasLanguageLabel={false}
      width="100%"
    />
  );
}

function DocSection({ id, children }: { id: string; children: ReactNode }) {
  return (
    <section id={id} data-section className="scroll-mt-20">
      <VStack gap={4}>{children}</VStack>
    </section>
  );
}

function ChapterHeading({ title, description }: { title: string; description: string }) {
  return (
    <VStack gap={1} paddingBlockEnd={2}>
      <Heading level={2} type="display-3">
        {title}
      </Heading>
      <Text type="large" color="secondary">
        {description}
      </Text>
    </VStack>
  );
}

function SectionHeading({ id, children }: { id: string; children: ReactNode }) {
  return (
    <Heading level={3} id={id} className="mt-4">
      {children}
    </Heading>
  );
}

function SubHeading({ children }: { children: ReactNode }) {
  return (
    <Heading level={4} className="mt-2">
      {children}
    </Heading>
  );
}

function P({ children }: { children: ReactNode }) {
  return (
    <Text as="p" type="body" display="block" textWrap="pretty" color="secondary">
      {children}
    </Text>
  );
}

/** Renders `backticked` spans as inline code. */
function withCode(text: string) {
  return text.split(/(`[^`]+`)/g).map((part, i) =>
    part.startsWith("`") ? <Code key={i}>{part.slice(1, -1)}</Code> : part,
  );
}

function List_({ items }: { items: string[] }) {
  return (
    <List density="compact" listStyle="disc">
      {items.map((item) => (
        <ListItem key={item} label={<>{withCode(item)}</>} />
      ))}
    </List>
  );
}

const CONFIG_FIELDS = [
  { field: "Name", type: "string", description: "Template identifier" },
  { field: "IsDir", type: "boolean", description: "True for directory templates" },
  { field: "PreCmd", type: "string[]", description: "Commands to run before generation" },
  { field: "PostCmd", type: "string[]", description: "Commands to run after generation" },
];

function ConfigFieldsTable() {
  return (
    <Table
      data={CONFIG_FIELDS}
      idKey="field"
      columns={[
        { key: "field", header: "Field", width: pixel(140), renderCell: (r) => <Code>{r.field}</Code> },
        { key: "type", header: "Type", width: pixel(120), renderCell: (r) => <Code color="secondary">{r.type}</Code> },
        { key: "description", header: "Description" },
      ]}
    />
  );
}

export default function Docs() {
  const { token } = useAuth();
  const [activeSection, setActiveSection] = useState("getting-started-introduction");

  const goTo = (chapterId: string, sectionId: string) => {
    const id = `${chapterId}-${sectionId}`;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    history.replaceState(null, "", `#${id}`);
    setActiveSection(id);
  };

  // Follow the reader: the section nearest the top of the viewport is current.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-80px 0px -75% 0px" },
    );
    document.querySelectorAll("[data-section]").forEach((el) => observer.observe(el));
    const hash = window.location.hash.slice(1);
    if (hash) document.getElementById(hash)?.scrollIntoView();
    return () => observer.disconnect();
  }, []);

  const sideNav = (
    <SideNav aria-label="Documentation">
      {docsChapters.map((chapter) => (
        <SideNavSection key={chapter.id} title={chapter.title}>
          {chapter.sections.map((section) => {
            const id = `${chapter.id}-${section.id}`;
            return (
              <SideNavItem
                key={id}
                label={section.title}
                href={`#${id}`}
                isSelected={activeSection === id}
                onClick={(e) => {
                  e.preventDefault();
                  goTo(chapter.id, section.id);
                }}
              />
            );
          })}
        </SideNavSection>
      ))}
    </SideNav>
  );

  const topNav = (
    <TopNav
      label="Site"
      heading={
        <TopNavHeading
          logo={<BrandMark size={28} label="" />}
          heading="Boilerplate"
          headingHref="/"
          subheading="Documentation"
        />
      }
      endContent={
        <HStack gap={2} vAlign="center">
          <TopNavItem label="GitHub" href="https://github.com/ukhirani/boilerplate" />
          {token ? (
            <Button label="Open BP Hub" variant="primary" size="sm" href="/home" />
          ) : (
            <Button label="Sign in" size="sm" href="/login" />
          )}
        </HStack>
      }
    />
  );

  return (
    <AppShell height="auto" topNav={topNav} sideNav={sideNav} variant="surface">
      <VStack gap={10} paddingInline={6} paddingBlock={10} maxWidth={820}>
        <VStack gap={2}>
          <Heading level={1} type="display-2">
            Boilerplate documentation
          </Heading>
          <Text type="large" color="secondary" textWrap="pretty">
            Install bp, save your first template, and share it on BP Hub.
          </Text>
        </VStack>
        {/* Getting Started */}
        <DocSection id="getting-started-introduction">
          <ChapterHeading title="Getting Started" description="Learn how to install and use Boilerplate CLI" />

          <P>
            Boilerplate (bp) is a CLI tool that lets developers save and reuse
            file or project templates, including automated setup commands, to
            quickly generate code structures and eliminate repetitive work.
          </P>

          <List density="compact" listStyle="disc">
            <ListItem label={<><Text weight="semibold">Template everything.</Text> Save any file or directory as a reusable template.</>} />
            <ListItem label={<><Text weight="semibold">Automated setup.</Text> Run pre and post commands automatically after generation.</>} />
            <ListItem label={<><Text weight="semibold">Share and discover.</Text> Share templates with the community via BP Hub.</>} />
          </List>
        </DocSection>

        <DocSection id="getting-started-installation">
          <SectionHeading id="installation">Installation</SectionHeading>

          <SubHeading>Using Homebrew (macOS)</SubHeading>
          <P>The recommended way to install Boilerplate on macOS:</P>
          <CodeBlock code={`brew install ukhirani/bp/bp`} />

          <SubHeading>Linux</SubHeading>
          <P>Install using the install script:</P>
          <CodeBlock
            code={`curl -fsSL https://raw.githubusercontent.com/ukhirani/boilerplate/main/install.sh | sh`}
          />

          <SubHeading>Windows</SubHeading>
          <P>Install using winget on Windows:</P>
          <CodeBlock
            code={`winget install Ukhirani.Bp`}
          />

          <SubHeading>Using Go</SubHeading>
          <P>If you have Go installed:</P>
          <CodeBlock
            code={`go install github.com/ukhirani/boilerplate/bp@latest`}
          />

          <SubHeading>Verify Installation</SubHeading>
          <P>After installation, verify that bp is installed correctly:</P>
          <CodeBlock code={`bp --version`} />
        </DocSection>

        <DocSection id="getting-started-quick-start">
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
        </DocSection>

        {/* Usage */}
        <DocSection id="usage-basic-commands">
          <ChapterHeading title="Usage" description="Complete command reference" />

          <SectionHeading id="basic-commands">Basic Commands</SectionHeading>

          <VStack gap={6}>
            <VStack gap={2}>
              <SubHeading>Help</SubHeading>
              <P>Display help information and available commands:</P>
              <CodeBlock
                code={`bp --help
bp -h`}
              />
            </VStack>

            <VStack gap={2}>
              <SubHeading>Version</SubHeading>
              <P>Check the current version:</P>
              <CodeBlock code={`bp --version`} />
            </VStack>

            <VStack gap={2}>
              <SubHeading>List Templates</SubHeading>
              <P>Show all available templates:</P>
              <CodeBlock
                code={`bp list
bp ls`}
              />
            </VStack>
          </VStack>
        </DocSection>

        <DocSection id="usage-adding-templates">
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

          <Banner status="info" title="Tip" description="Template names should be short and memorable. Use lowercase with hyphens for multi-word names." />
        </DocSection>

        <DocSection id="usage-generating-code">
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
        </DocSection>

        <DocSection id="usage-previewing">
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
            The <Code>--config</Code> flag shows
            additional metadata including pre/post commands.
          </P>
        </DocSection>

        <DocSection id="usage-configuration">
          <SectionHeading id="configuration">Configuration</SectionHeading>

          <P>Edit template configuration in your default editor:</P>

          <CodeBlock
            code={`# Open config in default editor (VS Code)
bp config <template-name>

# Use a specific editor
bp config <template-name> --editor vim
bp config <template-name> -e nano`}
          />
        </DocSection>

        {/* BP Hub */}
        <DocSection id="bp-hub-overview">
          <ChapterHeading title="BP Hub" description="Share and discover templates" />

          <SectionHeading id="bp-hub-overview-heading">
            Overview
          </SectionHeading>

          <P>
            BP Hub is the community platform for sharing and discovering
            templates. Browse templates created by other developers, clone
            them to your local machine, and share your own creations with the
            world.
          </P>

          <List_
            items={[
              "Browse templates from the community",
              "Clone templates directly from the CLI",
              "Share your templates with others",
              "Star and track popular templates",
            ]}
          />
        </DocSection>

        <DocSection id="bp-hub-cloning-templates">
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
        </DocSection>

        <DocSection id="bp-hub-sharing-templates">
          <SectionHeading id="sharing-templates">
            Sharing Templates
          </SectionHeading>

          <P>
            To share templates on BP Hub, visit the web platform and create an
            account. You can then add templates through the web interface,
            including file templates with code or directory templates linked
            to GitHub repositories.
          </P>

          <Banner
            status="info"
            title="Share from the web"
            description={<>Create an account on <Link href="/signup">BP Hub</Link> to start sharing templates.</>}
          />
        </DocSection>

        {/* Advanced */}
        <DocSection id="advanced-pre-post-commands">
          <ChapterHeading title="Advanced" description="Power user features" />

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

          <SubHeading>Run Commands Without Generation</SubHeading>
          <P>
            Use <Code>bp work</Code> to run template
            pre/post commands without generating any files.
          </P>
          <CodeBlock
            code={`# Run the pre and post command of any template (without generating the template)
bp work <template> # By default runs pre and post commands both (sequentially)
bp work <template> --pre # Runs only the pre commands
bp work <template> --post # Runs only the post commands`}
          />
        </DocSection>

        <DocSection id="advanced-template-structure">
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
        </DocSection>

        <DocSection id="advanced-toml-config">
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
          <ConfigFieldsTable />
        </DocSection>

        {/* Troubleshooting */}
        <DocSection id="troubleshooting-common-issues">
          <ChapterHeading title="Troubleshooting" description="Common issues and solutions" />

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
          <List_
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
          <List_
            items={[
              "Check your internet connection",
              "Verify the template exists on BP Hub",
              "Try with the full username/template format",
            ]}
          />
        </DocSection>

        <DocSection id="troubleshooting-faq">
          <SectionHeading id="faq">FAQ</SectionHeading>

          <VStack gap={6}>
            <VStack gap={2}>
              <SubHeading>Where are templates stored?</SubHeading>
              <P>
                Templates are stored in{" "}
                <Code>$HOME/boilerplate/templates/</Code>
              </P>
            </VStack>

            <VStack gap={2}>
              <SubHeading>Can I use bp without an account?</SubHeading>
              <P>
                Yes. The CLI works completely offline for local templates. You
                only need an account to use BP Hub features like cloning and
                sharing templates.
              </P>
            </VStack>

            <VStack gap={2}>
              <SubHeading>How do I update bp?</SubHeading>
              <CodeBlock
                code={`# Using Homebrew
brew upgrade bp

# Using Go
go install github.com/ukhirani/boilerplate/bp@latest


# Using install script
curl -fsSL https://raw.githubusercontent.com/ukhirani/boilerplate/main/install.sh | sh


# Using winget on Windows
winget upgrade Ukhirani.Bp
`}
              />
            </VStack>

            <VStack gap={2}>
              <SubHeading>Can I backup my templates?</SubHeading>
              <P>
                Yes: back up the{" "}
                <Code>~/boilerplate/templates/</Code>{" "}
                directory. You can also version control it with Git.
              </P>
            </VStack>

            <VStack gap={2}>
              <SubHeading>What file types are supported?</SubHeading>
              <P>
                Any file type. Boilerplate doesn't process file contents: it
                copies them as they are. You can template any programming language,
                config format, or binary file.
              </P>
            </VStack>
          </VStack>
        </DocSection>

        <Divider />
        <HStack hAlign="between" vAlign="center" wrap="wrap" gap={3}>
          <Text type="supporting" color="secondary">
            © 2026 Boilerplate
          </Text>
          <Link href="https://github.com/ukhirani/boilerplate" isExternalLink type="supporting">
            Source on GitHub
          </Link>
        </HStack>
      </VStack>
    </AppShell>
  );
}
