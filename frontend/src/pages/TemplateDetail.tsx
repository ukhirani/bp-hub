import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Layout, LayoutContent, LayoutPanel } from "@astryxdesign/core/Layout";
import { HStack, VStack, StackItem } from "@astryxdesign/core/Stack";
import { Breadcrumbs, BreadcrumbItem } from "@astryxdesign/core/Breadcrumbs";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Link } from "@astryxdesign/core/Link";
import { Token } from "@astryxdesign/core/Token";
import { Badge } from "@astryxdesign/core/Badge";
import { CodeBlock } from "@astryxdesign/core/CodeBlock";
import { Markdown } from "@astryxdesign/core/Markdown";
import { MetadataList, MetadataListItem } from "@astryxdesign/core/MetadataList";
import { Timestamp } from "@astryxdesign/core/Timestamp";
import { Divider } from "@astryxdesign/core/Divider";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { Button } from "@astryxdesign/core/Button";
import { Icon } from "@astryxdesign/core/Icon";
import { useMediaQuery } from "@astryxdesign/core/hooks";
import { FileQuestion } from "lucide-react";

import type { Template } from "@/types/Template";
import TechMark from "@/components/TechMark";
import { API_BASE } from "@/lib/api";
import { TYPE_LABELS, codeLanguage, tagColor } from "@/lib/templates";

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <VStack gap={3}>
      <VStack gap={1}>
        <Heading level={2} id={id}>
          {title}
        </Heading>
        {description && (
          <Text type="body" color="secondary">
            {description}
          </Text>
        )}
      </VStack>
      {children}
    </VStack>
  );
}

function DetailSkeleton() {
  return (
    <VStack gap={6} padding={6}>
      <Skeleton width={220} height={12} />
      <Skeleton width="45%" height={28} />
      <Skeleton width="60%" height={14} />
      <Skeleton width="100%" height={56} />
      <Skeleton width="100%" height={240} />
    </VStack>
  );
}

export default function TemplateDetail() {
  const { username, templateName } = useParams();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isWide = useMediaQuery("(min-width: 1024px)", true);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchTemplate() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE}/getTemplates`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("The registry did not answer.");
        const data: Template[] = await response.json();
        const found = data.find(
          (t) => t.Username === username && t.TemplateName === templateName,
        );
        if (!found) throw new Error("Template not found");
        setTemplate(found);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    fetchTemplate();
    return () => controller.abort();
  }, [username, templateName]);

  if (loading) return <DetailSkeleton />;

  if (error || !template) {
    return (
      <EmptyState
        icon={<Icon icon={FileQuestion} size="lg" color="secondary" />}
        title={error === "Template not found" ? "Template not found" : "Couldn't load this template"}
        description={
          error === "Template not found"
            ? `There's no template called ${username}/${templateName}. It may have been renamed or removed.`
            : `${error ?? ""} Try again in a moment.`
        }
        actions={<Button label="Back to templates" variant="primary" href="/home" />}
      />
    );
  }

  const primaryTag = template.Tags?.[0];
  const cloneCommand = `bp clone ${template.Username}/${template.TemplateName} --alias <alias-name>`;
  const hasPre = template.PreCmds?.length > 0;
  const hasPost = template.PostCmds?.length > 0;

  const usage = (
    <VStack gap={2}>
      <CodeBlock code={cloneCommand} language="bash" width="100%" hasLanguageLabel={false} />
      <Text type="supporting" color="secondary">
        Clone it under an alias, then generate it anywhere with{" "}
        <Text type="code">bp gen &lt;alias-name&gt;</Text>.
      </Text>
    </VStack>
  );

  const details = (
    <VStack gap={5}>
      <Heading level={2}>About</Heading>
      <MetadataList label={{ position: "start", width: 96 }}>
        <MetadataListItem label="Owner">
          <Link href={`/home/profile/${template.Username}`}>{template.Username}</Link>
        </MetadataListItem>
        <MetadataListItem label="Type">
          {TYPE_LABELS[template.Type] ?? template.Type}
        </MetadataListItem>
        {template.CreatedAt && (
          <MetadataListItem label="Created">
            <Timestamp value={template.CreatedAt} format="date" type="body" color="primary" />
          </MetadataListItem>
        )}
        {template.UpdatedAt && (
          <MetadataListItem label="Updated">
            <Timestamp value={template.UpdatedAt} format="relative" type="body" color="primary" />
          </MetadataListItem>
        )}
        {template.GithubRepoLink && (
          <MetadataListItem label="Source">
            <Link href={template.GithubRepoLink} isExternalLink>
              GitHub
            </Link>
          </MetadataListItem>
        )}
      </MetadataList>
    </VStack>
  );

  const main = (
    <VStack gap={8}>
      <VStack gap={3}>
        <Breadcrumbs variant="supporting">
          <BreadcrumbItem href="/home">Templates</BreadcrumbItem>
          <BreadcrumbItem href={`/home/profile/${template.Username}`}>
            {template.Username}
          </BreadcrumbItem>
          <BreadcrumbItem isCurrent>{template.TemplateName}</BreadcrumbItem>
        </Breadcrumbs>
        <HStack gap={3} vAlign="center" wrap="wrap">
          <TechMark tags={template.Tags} size={28} />
          <Heading level={1} wordBreak="break-word">
            {template.TemplateName}
          </Heading>
          <Badge label={TYPE_LABELS[template.Type] ?? template.Type} />
        </HStack>
        {template.Description && (
          <Text type="large" color="secondary" textWrap="pretty">
            {template.Description}
          </Text>
        )}
        {template.Tags?.length > 0 && (
          <HStack gap={1} wrap="wrap">
            {template.Tags.map((tag) => (
              <Token key={tag} label={tag} size="sm" color={tagColor(tag)} />
            ))}
          </HStack>
        )}
        {usage}
      </VStack>

      {!isWide && (
        <>
          <Divider />
          {details}
        </>
      )}

      {template.Type === "file" && template.Code && (
        <Section
          id="source"
          title="Source"
          description="The file bp writes when you generate this template."
        >
          <CodeBlock
            code={template.Code}
            language={codeLanguage(primaryTag)}
            title={template.FileName || `main.${primaryTag || "txt"}`}
            hasLineNumbers
            isCollapsible
            collapsibleThreshold={40}
            maxHeight={560}
            width="100%"
          />
        </Section>
      )}

      {template.Type === "dir" && template.GithubRepoLink && (
        <Section
          id="repository"
          title="Repository"
          description="bp copies this repository's files when you generate the template."
        >
          <HStack gap={2} vAlign="center">
            <Link href={template.GithubRepoLink} isExternalLink>
              {template.GithubRepoLink}
            </Link>
          </HStack>
        </Section>
      )}

      {(hasPre || hasPost) && (
        <Section
          id="commands"
          title="Setup commands"
          description="bp runs these in your shell around generation, in this order."
        >
          <VStack gap={4}>
            {hasPre && (
              <CodeBlock
                title="Before generating"
                hasLanguageLabel={false}
                code={template.PreCmds.join("\n")}
                language="bash"
                width="100%"
              />
            )}
            {hasPost && (
              <CodeBlock
                title="After generating"
                hasLanguageLabel={false}
                code={template.PostCmds.join("\n")}
                language="bash"
                width="100%"
              />
            )}
          </VStack>
        </Section>
      )}

      {template.Documentation && (
        <Section id="documentation" title="Documentation">
          <Markdown headingLevelStart={3}>{template.Documentation}</Markdown>
        </Section>
      )}
    </VStack>
  );

  return (
    <Layout
      height="auto"
      contentWidth={1120}
      content={
        <LayoutContent padding={6} isScrollable={false}>
          {main}
        </LayoutContent>
      }
      end={
        isWide ? (
          <LayoutPanel width={340} padding={6} isScrollable={false} label="Template details">
            <StackItem>{details}</StackItem>
          </LayoutPanel>
        ) : undefined
      }
    />
  );
}
