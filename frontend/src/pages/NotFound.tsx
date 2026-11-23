import { useLocation } from "react-router-dom";
import { Center } from "@astryxdesign/core/Center";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { CodeBlock } from "@astryxdesign/core/CodeBlock";

import BrandMark from "@/components/BrandMark";
import { useAuth } from "@/context/auth-context";

export default function NotFound() {
  const { pathname } = useLocation();
  const { token } = useAuth();

  return (
    <Center axis="both" padding={6} minHeight="100dvh">
      <VStack gap={6} maxWidth={520} width="100%">
        <BrandMark size={72} label="" />
        <VStack gap={2}>
          <Heading level={1}>Nothing at this path</Heading>
          <Text type="body" color="secondary">
            No page or template lives here. The link may be old, or the template was renamed.
          </Text>
        </VStack>
        <CodeBlock
          code={`$ bp gen ${pathname.replace(/^\//, "") || "page"}\nerror: template not found`}
          language="bash"
          hasCopyButton={false}
          hasLanguageLabel={false}
          width="100%"
        />
        <HStack gap={3} wrap="wrap">
          <Button
            label={token ? "Browse templates" : "Go to the home page"}
            variant="primary"
            href={token ? "/home" : "/"}
          />
          <Button label="Read the docs" variant="ghost" href="/docs" />
        </HStack>
      </VStack>
    </Center>
  );
}
