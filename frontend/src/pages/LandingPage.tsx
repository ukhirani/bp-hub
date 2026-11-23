import { useState } from "react";
import { HStack, VStack, StackItem } from "@astryxdesign/core/Stack";
import { Grid } from "@astryxdesign/core/Grid";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Link } from "@astryxdesign/core/Link";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { CodeBlock } from "@astryxdesign/core/CodeBlock";
import { Code } from "@astryxdesign/core/Code";
import { Icon } from "@astryxdesign/core/Icon";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@astryxdesign/core/SegmentedControl";
import { ArrowRight } from "lucide-react";

import BrandMark from "@/components/BrandMark";
import CloneDemo from "@/components/landing/CloneDemo";
import { useAuth } from "@/context/auth-context";
import "@/styles/blueprint.css";

type Platform = "mac" | "linux" | "windows";

const INSTALL: Record<Platform, string> = {
  mac: "brew install ukhirani/bp/bp",
  linux:
    "curl -fsSL https://raw.githubusercontent.com/ukhirani/boilerplate/main/install.sh | sh",
  windows: "winget install Ukhirani.Bp",
};

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "mac";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("win")) return "windows";
  if (ua.includes("linux") && !ua.includes("android")) return "linux";
  return "mac";
}

const STEPS = [
  {
    verb: "Save",
    command: "bp add main.go --name starter",
    description: "Save any file or directory as a template.",
  },
  {
    verb: "Generate",
    command: "bp gen starter",
    description: "Generate code from your templates instantly.",
  },
  {
    verb: "Share",
    command: "bp clone user/template",
    description: "Discover and clone templates from BP Hub.",
  },
];

const FEATURES = [
  {
    title: "Any file or folder",
    description: "bp copies contents as they are, so any language, config format or binary works.",
  },
  {
    title: "Setup commands included",
    description: "Pre and post commands run around generation: install dependencies, init a module, format the code.",
  },
  {
    title: "Shared on BP Hub",
    description: "Publish a template from the web and anyone can clone it with bp clone owner/name.",
  },
];

const SAMPLE_CONFIG = `# ~/boilerplate/templates/react-app/react-app.toml
Name = "react-app"
IsDir = true
PreCmd = []
PostCmd = ["npm install", "npm run format"]`;

const GITHUB = "https://github.com/ukhirani/boilerplate";

function InstallBox() {
  const [platform, setPlatform] = useState<Platform>(detectPlatform);
  return (
    <Card padding={3} width="100%" maxWidth={560} elevation="high">
      <VStack gap={3}>
        <HStack gap={3} vAlign="center" hAlign="between" wrap="wrap">
          <Text type="label">Install the CLI</Text>
          <SegmentedControl
            label="Operating system"
            size="sm"
            value={platform}
            onChange={(v) => setPlatform(v as Platform)}
          >
            <SegmentedControlItem value="mac" label="macOS" />
            <SegmentedControlItem value="linux" label="Linux" />
            <SegmentedControlItem value="windows" label="Windows" />
          </SegmentedControl>
        </HStack>
        <CodeBlock
          code={INSTALL[platform]}
          language="bash"
          hasLanguageLabel={false}
          width="100%"
          size="sm"
        />
      </VStack>
    </Card>
  );
}

function SiteHeader({ signedIn }: { signedIn: boolean }) {
  return (
    <HStack
      as="header"
      gap={4}
      vAlign="center"
      hAlign="between"
      paddingInline={6}
      paddingBlock={4}
      className="mx-auto w-full max-w-7xl"
    >
      <Link href="/" color="inherit" label="Boilerplate home">
        <HStack gap={2} vAlign="center">
          <BrandMark size={34} label="" />
          <Text type="body" weight="semibold" color="inherit">
            Boilerplate
          </Text>
        </HStack>
      </Link>
      <HStack as="nav" gap={1} vAlign="center" aria-label="Site">
        <Button label="Docs" variant="ghost" href="/docs" className="bp-btn-onfield" />
        <Button
          label="GitHub"
          variant="ghost"
          href={GITHUB}
          target="_blank"
          rel="noopener noreferrer"
          className="bp-btn-onfield max-sm:hidden"
        />
        <Button
          label={signedIn ? "Open BP Hub" : "Sign in"}
          href={signedIn ? "/home" : "/login"}
          className="bp-btn-light"
        />
      </HStack>
    </HStack>
  );
}

export default function LandingPage() {
  const { token } = useAuth();
  const signedIn = !!token;
  const start = signedIn ? "/home" : "/signup";

  return (
    <VStack gap={0} minHeight="100dvh">
      {/* Hero: the blueprint field, the offer, the install, and the product at work */}
      <VStack className="bp-field min-h-svh" gap={0}>
        <SiteHeader signedIn={signedIn} />
        <Grid
          columns={{ minWidth: 440, max: 2, repeat: "fit" }}
          gap={10}
          align="center"
          className="mx-auto w-full max-w-7xl flex-1 px-6 pt-10 pb-0 lg:pt-16 xl:grid-cols-[minmax(0,1fr)_640px]"
        >
          <VStack gap={8} paddingBlockEnd={10} className="bp-enter">
            <VStack gap={5}>
              <Heading level={1} color="inherit" className="bp-display text-5xl sm:text-6xl xl:text-[4.25rem]">
                Skip the boilerplate. Start building.
              </Heading>
              <Text type="large" color="inherit" className="bp-ink-2 max-w-xl" textWrap="pretty">
                bp is a CLI that saves any file or project as a template, setup commands
                included, and generates it again in one line. BP Hub is where you share them.
              </Text>
            </VStack>
            <InstallBox />
            <HStack gap={3} wrap="wrap">
              <Button
                label={signedIn ? "Browse templates" : "Create an account"}
                size="lg"
                href={start}
                className="bp-btn-light"
                endContent={<Icon icon={ArrowRight} />}
              />
              <Button label="Read the docs" size="lg" variant="ghost" href="/docs" className="bp-btn-onfield" />
            </HStack>
          </VStack>
          <StackItem className="w-full self-end">
            <CloneDemo />
          </StackItem>
        </Grid>
      </VStack>

      {/* The workflow, set as a drawing's title block */}
      <VStack as="section" gap={8} className="mx-auto w-full max-w-7xl px-6 py-20 lg:py-28" aria-labelledby="workflow">
        <VStack gap={2}>
          <Heading level={2} id="workflow" type="display-3">
            Three commands cover the whole workflow
          </Heading>
          <Text type="large" color="secondary">
            Save a file or folder once, generate it in any project, and clone what others share.
          </Text>
        </VStack>
        <VStack gap={0} className="border-t border-strong">
          {STEPS.map((step) => (
            <Grid
              key={step.verb}
              columns={{ minWidth: 220, max: 3, repeat: "fit" }}
              gap={4}
              align="center"
              className="border-b border-border py-6"
            >
              <Text type="display-3" as="h3" weight="semibold">
                {step.verb}
              </Text>
              <Code>{`$ ${step.command}`}</Code>
              <Text type="body" color="secondary">
                {step.description}
              </Text>
            </Grid>
          ))}
        </VStack>
      </VStack>

      {/* What it does, shown on a real template config */}
      <VStack as="section" gap={0} className="border-t border-border bg-surface" aria-labelledby="why">
        <Grid
          columns={{ minWidth: 400, max: 2, repeat: "fit" }}
          gap={10}
          className="mx-auto w-full max-w-7xl px-6 py-20 lg:py-28"
        >
          <VStack gap={8}>
            <VStack gap={2}>
              <Heading level={2} id="why" type="display-3">
                Templates that set themselves up
              </Heading>
              <Text type="large" color="secondary">
                Stop rewriting the same code. Save it once, use it everywhere.
              </Text>
            </VStack>
            <VStack gap={0}>
              {FEATURES.map((f, i) => (
                <VStack key={f.title} gap={1} paddingBlock={4} className={i ? "border-t border-border" : ""}>
                  <Heading level={3}>{f.title}</Heading>
                  <Text type="body" color="secondary">
                    {f.description}
                  </Text>
                </VStack>
              ))}
            </VStack>
          </VStack>
          <VStack gap={3} vAlign="center">
            <CodeBlock
              code={SAMPLE_CONFIG}
              language="toml"
              title="react-app.toml"
              width="100%"
              hasLineNumbers
            />
            <Text type="supporting" color="secondary">
              Every template carries its own setup. <Code>bp gen react-app</Code> copies the
              files, then runs <Code>npm install</Code> and <Code>npm run format</Code> for you.
            </Text>
          </VStack>
        </Grid>
      </VStack>

      {/* Close on the field again */}
      <VStack as="section" className="bp-field" gap={0} aria-labelledby="cta">
        <VStack gap={6} hAlign="center" className="mx-auto w-full max-w-3xl px-6 py-24 text-center">
          <Heading level={2} id="cta" color="inherit" justify="center" className="bp-display text-4xl sm:text-5xl">
            Your next project can start from the last one
          </Heading>
          <Text type="large" color="inherit" justify="center" className="bp-ink-2">
            Install bp, run bp add on the folder you keep copying, and generate it next time.
          </Text>
          <HStack gap={3} wrap="wrap" hAlign="center">
            <Button
              label={signedIn ? "Open BP Hub" : "Create an account"}
              size="lg"
              href={start}
              className="bp-btn-light"
              endContent={<Icon icon={ArrowRight} />}
            />
            <Button label="Read the docs" size="lg" variant="ghost" href="/docs" className="bp-btn-onfield" />
          </HStack>
        </VStack>
      </VStack>

      <VStack as="footer" gap={0} className="border-t border-border">
        <HStack
          gap={4}
          vAlign="center"
          hAlign="between"
          wrap="wrap"
          className="mx-auto w-full max-w-7xl px-6 py-8"
        >
          <HStack gap={2} vAlign="center">
            <BrandMark size={24} label="" />
            <Text type="supporting" color="secondary">
              © 2026 Boilerplate
            </Text>
          </HStack>
          <HStack gap={6}>
            <Link href="/docs" type="supporting" color="secondary">
              Docs
            </Link>
            <Link href={GITHUB} type="supporting" color="secondary" isExternalLink>
              GitHub
            </Link>
          </HStack>
        </HStack>
      </VStack>
    </VStack>
  );
}
