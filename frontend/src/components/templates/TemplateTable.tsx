import type { ReactNode } from "react";
import { Table, pixel, type TableColumn } from "@astryxdesign/core/Table";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { Token } from "@astryxdesign/core/Token";
import { Timestamp } from "@astryxdesign/core/Timestamp";
import { useMediaQuery } from "@astryxdesign/core/hooks";
import type { Template } from "@/types/Template";
import {
  TYPE_LABELS,
  tagColor,
  templateName,
  templateOwner,
  templatePath,
} from "@/lib/templates";

type Row = Template & Record<string, unknown>;

type TemplateTableProps = {
  templates: Template[];
  /** Hide the owner column, e.g. on a profile where every row is theirs. */
  hasOwner?: boolean;
  emptyState?: ReactNode;
};

/** The registry's row view: one template per row, its name opening the detail page. */
export default function TemplateTable({
  templates,
  hasOwner = true,
  emptyState,
}: TemplateTableProps) {
  const isNarrow = useMediaQuery("(max-width: 720px)", false);

  const columns: TableColumn<Row>[] = [
    {
      key: "name",
      header: "Template",
      renderCell: (t) => (
        <VStack gap={0.5}>
          <HStack gap={1} vAlign="center" wrap="wrap">
            {hasOwner && (
              <>
                <Link href={`/home/profile/${templateOwner(t)}`} color="secondary">
                  {templateOwner(t)}
                </Link>
                <Text type="body" color="secondary">
                  /
                </Text>
              </>
            )}
            <Link href={templatePath(t)} weight="semibold">
              {templateName(t)}
            </Link>
          </HStack>
          {t.Description && (
            <Text type="supporting" color="secondary" maxLines={1}>
              {t.Description}
            </Text>
          )}
          {isNarrow && (
            <Text type="supporting" color="secondary">
              {TYPE_LABELS[t.Type] ?? t.Type}
              {t.Tags?.length ? ` · ${t.Tags.slice(0, 3).join(", ")}` : ""}
            </Text>
          )}
        </VStack>
      ),
    },
    ...(isNarrow
      ? []
      : [
          {
            key: "type",
            header: "Type",
            width: pixel(120),
            renderCell: (t: Row) => (
              <Text type="supporting" color="secondary">
                {TYPE_LABELS[t.Type] ?? t.Type}
              </Text>
            ),
          },
          {
            key: "tags",
            header: "Tags",
            width: pixel(260),
            renderCell: (t: Row) =>
              t.Tags?.length ? (
                <HStack gap={1} wrap="wrap">
                  {t.Tags.slice(0, 3).map((tag) => (
                    <Token key={tag} label={tag} size="sm" color={tagColor(tag)} />
                  ))}
                </HStack>
              ) : (
                <Text type="supporting" color="disabled">
                  No tags
                </Text>
              ),
          },
        ]),
    {
      key: "updated",
      header: "Updated",
      width: pixel(isNarrow ? 96 : 140),
      align: "end",
      renderCell: (t) =>
        t.UpdatedAt ? (
          <Timestamp value={t.UpdatedAt} format="relative_short" />
        ) : (
          <Text type="supporting" color="disabled">
            —
          </Text>
        ),
    },
  ];

  return (
    <Table
      data={templates as Row[]}
      columns={columns}
      idKey={(t) => String(t.TemplateID ?? `${templateOwner(t)}/${templateName(t)}`)}
      hasHover
      verticalAlign="middle"
      emptyState={emptyState}
    />
  );
}
