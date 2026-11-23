import type { ReactNode } from "react";
import { Center } from "@astryxdesign/core/Center";
import { HStack, VStack, StackItem } from "@astryxdesign/core/Stack";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Link } from "@astryxdesign/core/Link";
import { useMediaQuery } from "@astryxdesign/core/hooks";

import BrandMark from "@/components/BrandMark";
import "@/styles/blueprint.css";

const COMMANDS: [string, string][] = [
  ["bp add main.go --name starter", "save"],
  ["bp gen starter", "generate"],
  ["bp clone user/template", "share"],
];

/** The blueprint panel beside the auth forms on wide screens. */
function FieldPanel() {
  return (
    <VStack
      className="bp-field"
      height="100%"
      padding={10}
      hAlign="stretch"
      vAlign="between"
    >
      <Link href="/" color="inherit" label="Boilerplate home">
        <HStack gap={3} vAlign="center">
          <BrandMark size={40} label="" />
          <Text type="large" weight="semibold" color="inherit">
            Boilerplate
          </Text>
        </HStack>
      </Link>
      <VStack gap={8}>
        <Heading level={2} accessibilityLevel={2} color="inherit" className="bp-display text-4xl xl:text-5xl">
          Save it once. Use it everywhere.
        </Heading>
        <VStack gap={0}>
          {COMMANDS.map(([cmd, verb]) => (
            <HStack
              key={cmd}
              gap={4}
              vAlign="center"
              paddingBlock={3}
              className="border-t border-white/20 last:border-b"
            >
              <StackItem size="fill">
                <Text type="code" color="inherit">
                  {cmd}
                </Text>
              </StackItem>
              <Text type="supporting" color="inherit" className="bp-ink-3">
                {verb}
              </Text>
            </HStack>
          ))}
        </VStack>
      </VStack>
      <Text type="supporting" color="inherit" className="bp-ink-3">
        A CLI for file and project templates, with setup commands that run for you.
      </Text>
    </VStack>
  );
}

export default function AuthFrame({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const isWide = useMediaQuery("(min-width: 960px)", true);

  const form = (
    <Center axis="both" padding={6} minHeight="100dvh">
      <VStack gap={8} width="100%" maxWidth={380}>
        {!isWide && (
          <Link href="/" color="inherit" label="Boilerplate home">
            <HStack gap={2} vAlign="center">
              <BrandMark size={32} label="" />
              <Text type="body" weight="semibold">
                Boilerplate
              </Text>
            </HStack>
          </Link>
        )}
        <VStack gap={2}>
          <Heading level={1}>{title}</Heading>
          {description && (
            <Text type="body" color="secondary">
              {description}
            </Text>
          )}
        </VStack>
        {children}
        {footer}
      </VStack>
    </Center>
  );

  if (!isWide) return <main>{form}</main>;

  return (
    <HStack as="main" height="100dvh" gap={0} vAlign="stretch">
      <StackItem size="fill">{form}</StackItem>
      <StackItem className="w-130 shrink-0">
        <FieldPanel />
      </StackItem>
    </HStack>
  );
}
