import { useState } from "react";
import { Card } from "@astryxdesign/core/Card";
import { VStack } from "@astryxdesign/core/Stack";
import { TabList, Tab } from "@astryxdesign/core/TabList";
import { TextArea } from "@astryxdesign/core/TextArea";
import { Markdown } from "@astryxdesign/core/Markdown";
import { Text } from "@astryxdesign/core/Text";

type MarkdownEditorProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
  placeholder?: string;
  isRequired?: boolean;
};

/** A markdown field with a Write / Preview switch, like a pull request comment box. */
export default function MarkdownEditor({
  label,
  value,
  onChange,
  description = "Markdown is supported.",
  placeholder = "Write something about yourself.",
  isRequired,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<"write" | "preview">("write");

  return (
    <VStack gap={2}>
      <TabList value={mode} onChange={(v) => setMode(v as typeof mode)} size="sm">
        <Tab value="write" label="Write" />
        <Tab value="preview" label="Preview" />
      </TabList>
      {mode === "write" ? (
        <TextArea
          label={label}
          description={description}
          value={value}
          onChange={onChange}
          rows={8}
          placeholder={placeholder}
          isRequired={isRequired}
          width="100%"
        />
      ) : (
        <VStack gap={1}>
          <Text type="label">{label}</Text>
          <Card variant="muted" minHeight={180}>
            {value.trim() ? (
              <Markdown density="compact" headingLevelStart={3}>
                {value}
              </Markdown>
            ) : (
              <Text type="body" color="secondary">
                Nothing to preview yet.
              </Text>
            )}
          </Card>
        </VStack>
      )}
    </VStack>
  );
}
