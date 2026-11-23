import { useCallback, useEffect, useMemo, useState } from "react";
import { Layout, LayoutContent, LayoutHeader } from "@astryxdesign/core/Layout";
import { HStack, VStack, StackItem } from "@astryxdesign/core/Stack";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@astryxdesign/core/SegmentedControl";
import { Button } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { Icon } from "@astryxdesign/core/Icon";
import { CloudOff, PackageOpen, Plus, Search } from "lucide-react";

import type { Template } from "@/types/Template";
import TemplateTable from "@/components/templates/TemplateTable";
import { API_BASE } from "@/lib/api";
import { templateName, templateOwner } from "@/lib/templates";

type TypeFilter = "all" | "file" | "dir";

function LoadingRows() {
  return (
    <VStack gap={4} padding={4}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <HStack key={i} gap={6} vAlign="center">
          <StackItem size="fill">
            <VStack gap={2}>
              <Skeleton width={i % 2 ? "42%" : "30%"} height={14} index={i} />
              <Skeleton width={i % 2 ? "22%" : "34%"} height={10} index={i} />
            </VStack>
          </StackItem>
          <Skeleton width={72} height={12} index={i} />
          <Skeleton width={56} height={12} index={i} />
        </HStack>
      ))}
    </VStack>
  );
}

export default function Home() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const fetchTemplates = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/getTemplates`, { signal });
      if (!response.ok) throw new Error("The registry did not answer.");
      const data = await response.json();
      setTemplates(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.templates)
            ? data.templates
            : [],
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchTemplates(controller.signal);
    return () => controller.abort();
  }, [fetchTemplates]);

  const filteredTemplates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return templates.filter((t) => {
      if (typeFilter !== "all" && t.Type !== typeFilter) return false;
      if (!query) return true;
      const name = templateName(t).toLowerCase();
      const owner = templateOwner(t).toLowerCase();
      const tags = (t.Tags ?? []).join(" ").toLowerCase();
      return (
        name.includes(query) ||
        owner.includes(query) ||
        `${owner}/${name}`.includes(query) ||
        tags.includes(query)
      );
    });
  }, [templates, searchQuery, typeFilter]);

  const isFiltered = searchQuery.trim() !== "" || typeFilter !== "all";

  let body;
  if (loading) {
    body = <LoadingRows />;
  } else if (error) {
    body = (
      <EmptyState
        icon={<Icon icon={CloudOff} size="lg" color="secondary" />}
        title="Couldn't load templates"
        description={`${error} The free server can take a minute to wake up; try again in a moment.`}
        actions={
          <Button label="Try again" variant="primary" onClick={() => fetchTemplates()} />
        }
      />
    );
  } else if (templates.length === 0) {
    body = (
      <EmptyState
        icon={<Icon icon={PackageOpen} size="lg" color="secondary" />}
        title="No templates yet"
        description="Templates you publish with bp or add here show up for everyone. Be the first."
        actions={
          <Button
            label="Add template"
            variant="primary"
            icon={<Icon icon={Plus} />}
            href="/home/templates/new"
          />
        }
      />
    );
  } else {
    body = (
      <TemplateTable
        templates={filteredTemplates}
        emptyState={
          <EmptyState
            isCompact
            title="No matching templates"
            description="Try a different name, owner or tag, or clear the filters."
            actions={
              <Button
                label="Clear filters"
                onClick={() => {
                  setSearchQuery("");
                  setTypeFilter("all");
                }}
              />
            }
          />
        }
      />
    );
  }

  return (
    <Layout
      height="auto"
      contentWidth={1120}
      header={
        <LayoutHeader padding={6} paddingBlockEnd={4}>
          <VStack gap={4}>
            <HStack gap={3} vAlign="end" wrap="wrap">
              <StackItem size="fill">
                <VStack gap={1}>
                  <Heading level={1}>Templates</Heading>
                  <Text type="body" color="secondary">
                    {loading
                      ? "Loading the registry…"
                      : isFiltered
                        ? `${filteredTemplates.length} of ${templates.length} templates`
                        : `${templates.length} templates from the community, ready to clone with bp`}
                  </Text>
                </VStack>
              </StackItem>
            </HStack>
            <HStack gap={3} vAlign="center" wrap="wrap">
              <StackItem size="fill">
                <TextInput
                  label="Search templates"
                  isLabelHidden
                  type="search"
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search by name, owner or tag"
                  startIcon={Search}
                  hasClear
                  width="100%"
                />
              </StackItem>
              <SegmentedControl
                label="Template type"
                value={typeFilter}
                onChange={(v) => setTypeFilter(v as TypeFilter)}
              >
                <SegmentedControlItem value="all" label="All" />
                <SegmentedControlItem value="file" label="Files" />
                <SegmentedControlItem value="dir" label="Directories" />
              </SegmentedControl>
            </HStack>
          </VStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={6} isScrollable={false}>
          {body}
        </LayoutContent>
      }
    />
  );
}
