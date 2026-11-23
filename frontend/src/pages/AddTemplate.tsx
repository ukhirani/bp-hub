import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, LayoutContent, LayoutHeader, LayoutPanel } from "@astryxdesign/core/Layout";
import { HStack, VStack, StackItem } from "@astryxdesign/core/Stack";
import { FormLayout } from "@astryxdesign/core/FormLayout";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { TextArea } from "@astryxdesign/core/TextArea";
import { FileInput } from "@astryxdesign/core/FileInput";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@astryxdesign/core/SegmentedControl";
import { Button } from "@astryxdesign/core/Button";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Token } from "@astryxdesign/core/Token";
import { List, ListItem } from "@astryxdesign/core/List";
import { CodeBlock } from "@astryxdesign/core/CodeBlock";
import { Divider } from "@astryxdesign/core/Divider";
import { Icon } from "@astryxdesign/core/Icon";
import { Code } from "@astryxdesign/core/Code";
import { useMediaQuery } from "@astryxdesign/core/hooks";
import { FileCode2, FolderGit2, X } from "lucide-react";

import Snackbar, { type SnackbarNotice } from "@/components/ui/snackbar";
import { useAuth } from "@/context/AuthContext";
import { postJSON } from "@/lib/api";
import { tagColor } from "@/lib/templates";

type TemplateType = "file" | "dir";

type TemplateCreateResponse = {
  template_name: string;
  template_id: string;
  username: string;
};

const tagSeparator = /[\s,]+/;

function CommandField({
  label,
  description,
  placeholder,
  commands,
  onChange,
}: {
  label: string;
  description: string;
  placeholder: string;
  commands: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...commands, trimmed]);
    setDraft("");
  };

  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="end">
        <StackItem size="fill">
          <TextInput
            label={label}
            description={description}
            isOptional
            value={draft}
            onChange={setDraft}
            onEnter={add}
            placeholder={placeholder}
            width="100%"
          />
        </StackItem>
        <Button label="Add" onClick={add} isDisabled={!draft.trim()} />
      </HStack>
      {commands.length > 0 && (
        <List density="compact" hasDividers edge="flush">
          {commands.map((cmd, index) => (
            <ListItem
              key={`${cmd}-${index}`}
              label={<Code>{cmd}</Code>}
              startContent={
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {index + 1}
                </Text>
              }
              endContent={
                <IconButton
                  label={`Remove ${cmd}`}
                  icon={<Icon icon={X} />}
                  variant="ghost"
                  size="sm"
                  onClick={() => onChange(commands.filter((_, i) => i !== index))}
                />
              }
            />
          ))}
        </List>
      )}
    </VStack>
  );
}

export default function AddTemplate() {
  const { token, username } = useAuth();
  const navigate = useNavigate();
  const isWide = useMediaQuery("(min-width: 1100px)", true);

  const [templateName, setTemplateName] = useState("");
  const [templateType, setTemplateType] = useState<TemplateType>("file");
  const [file, setFile] = useState<File | null>(null);
  const [code, setCode] = useState("");
  const [fileName, setFileName] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [preCmds, setPreCmds] = useState<string[]>([]);
  const [postCmds, setPostCmds] = useState<string[]>([]);
  const [notice, setNotice] = useState<SnackbarNotice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (!token) navigate("/login", { replace: true });
  }, [token, navigate]);

  const handleTypeChange = (next: TemplateType) => {
    setTemplateType(next);
    if (next === "dir") {
      setFile(null);
      setFileName("");
      setCode("");
    } else {
      setGithubLink("");
    }
  };

  const handleFile = (value: File | File[] | null) => {
    const picked = Array.isArray(value) ? (value[0] ?? null) : value;
    setFile(picked);
    if (!picked) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCode(String(reader.result ?? ""));
      setFileName(picked.name);
    };
    reader.readAsText(picked);
  };

  const addTags = (value: string) => {
    const next = value
      .split(tagSeparator)
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);
    if (!next.length) return;
    setTags((prev) => Array.from(new Set([...prev, ...next])));
    setTagInput("");
  };

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!templateName.trim()) e.name = "Give your template a name.";
    if (templateType === "file") {
      if (!fileName.trim()) e.fileName = "Add the file name bp should write, like main.go.";
      if (!code.trim()) e.code = "Paste the file's contents or upload the file.";
    } else if (!githubLink.trim().startsWith("http")) {
      e.github = "Add the repository's https:// link.";
    }
    return e;
  }, [templateName, templateType, fileName, code, githubLink]);

  const statusFor = (key: string) =>
    attempted && errors[key]
      ? { type: "error" as const, message: errors[key] }
      : undefined;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setAttempted(true);
    setNotice(null);
    if (Object.keys(errors).length > 0) {
      setNotice({
        title: "A few fields need attention",
        message: Object.values(errors)[0],
        tone: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await postJSON<TemplateCreateResponse>(
        "/addTemplate",
        {
          idToken: token,
          template_name: templateName,
          type: templateType,
          code: templateType === "file" ? code : "",
          file_name: templateType === "file" ? fileName : "",
          github_repo_link: templateType === "dir" ? githubLink : "",
          tags,
          pre_cmds: preCmds,
          post_cmds: postCmds,
        },
        "ADD_TEMPLATE_FAILED",
      );
      sessionStorage.setItem(
        "app_notice",
        JSON.stringify({
          title: "Template published",
          message: `${result.template_name} is live in the registry.`,
          tone: "success",
        }),
      );
      navigate("/home", { replace: true });
    } catch (err) {
      const code = err instanceof Error ? err.message : "";
      setNotice({
        title: "Couldn't publish the template",
        message:
          code === "TEMPLATE_NAME_TAKEN"
            ? "You already have a template with this name. Pick another."
            : "Something went wrong on our side. Try again.",
        tone: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewName = templateName.trim() || "<template-name>";
  const preview = (
    <VStack gap={4}>
      <VStack gap={1}>
        <Heading level={2}>How others will use it</Heading>
        <Text type="supporting" color="secondary">
          Updates as you fill in the form.
        </Text>
      </VStack>
      <CodeBlock
        title="Terminal"
        hasLanguageLabel={false}
        hasCopyButton={false}
        language="bash"
        width="100%"
        size="sm"
        code={[
          `bp clone ${username ?? "you"}/${previewName} --alias ${templateName.trim() || "app"}`,
          `bp gen ${templateName.trim() || "app"}`,
          ...preCmds.map((c) => `# before: ${c}`),
          templateType === "file"
            ? `# writes ${fileName || "<file>"}`
            : `# copies ${githubLink || "<repository>"}`,
          ...postCmds.map((c) => `# after: ${c}`),
        ].join("\n")}
      />
      {tags.length > 0 && (
        <HStack gap={1} wrap="wrap">
          {tags.map((tag) => (
            <Token key={tag} label={tag} size="sm" color={tagColor(tag)} />
          ))}
        </HStack>
      )}
    </VStack>
  );

  return (
    <>
    <Snackbar notice={notice} onClose={() => setNotice(null)} />
    <Layout
      height="auto"
      contentWidth={1120}
      header={
        <LayoutHeader padding={6} paddingBlockEnd={0}>
          <VStack gap={1}>
            <Heading level={1}>Add a template</Heading>
            <Text type="body" color="secondary">
              Publish one file or a whole repository. Anyone can clone it with{" "}
              <Text type="code">bp clone</Text>.
            </Text>
          </VStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={6} isScrollable={false}>
          <form onSubmit={handleSubmit} noValidate>
            <VStack gap={6} maxWidth={680}>
              <FormLayout>
                <TextInput
                  label="Template name"
                  description="Lowercase with dashes reads best on the command line. Must be unique in your account."
                  isRequired
                  value={templateName}
                  onChange={setTemplateName}
                  placeholder="react-vite-starter"
                  status={statusFor("name")}
                  width="100%"
                />
                <VStack gap={2}>
                  <Text type="label">What are you sharing?</Text>
                  <SegmentedControl
                    label="Template type"
                    value={templateType}
                    onChange={(v) => handleTypeChange(v as TemplateType)}
                  >
                    <SegmentedControlItem value="file" label="A single file" icon={<Icon icon={FileCode2} />} />
                    <SegmentedControlItem value="dir" label="A repository" icon={<Icon icon={FolderGit2} />} />
                  </SegmentedControl>
                </VStack>

                {templateType === "file" ? (
                  <>
                    <FileInput
                      label="Upload the file"
                      description="Or paste its contents below."
                      mode="dropzone"
                      value={file}
                      onChange={handleFile}
                      isOptional
                      width="100%"
                    />
                    <TextInput
                      label="File name"
                      description="The name bp writes the file under."
                      isRequired
                      value={fileName}
                      onChange={setFileName}
                      placeholder="main.go"
                      status={statusFor("fileName")}
                      width="100%"
                    />
                    <TextArea
                      label="Contents"
                      isRequired
                      value={code}
                      onChange={setCode}
                      rows={10}
                      hasSpellCheck={false}
                      placeholder="package main"
                      status={statusFor("code")}
                      width="100%"
                    />
                  </>
                ) : (
                  <TextInput
                    label="Repository link"
                    description="A public GitHub repository. bp copies its files when the template is generated."
                    isRequired
                    type="url"
                    value={githubLink}
                    onChange={setGithubLink}
                    placeholder="https://github.com/you/repo"
                    status={statusFor("github")}
                    width="100%"
                  />
                )}
              </FormLayout>

              <Divider />

              <FormLayout>
                <CommandField
                  label="Before generating"
                  description="Commands bp runs first, such as creating a folder."
                  placeholder="mkdir -p src"
                  commands={preCmds}
                  onChange={setPreCmds}
                />
                <CommandField
                  label="After generating"
                  description="Commands bp runs once the files exist, such as installing dependencies."
                  placeholder="npm install"
                  commands={postCmds}
                  onChange={setPostCmds}
                />
                <VStack gap={2}>
                  <TextInput
                    label="Tags"
                    description="Languages and frameworks help people find it. Press Enter or comma to add."
                    isOptional
                    value={tagInput}
                    onChange={(v) => (v.endsWith(",") ? addTags(v) : setTagInput(v))}
                    onEnter={() => addTags(tagInput)}
                    placeholder="react, vite, typescript"
                    width="100%"
                  />
                  {tags.length > 0 && (
                    <HStack gap={1} wrap="wrap">
                      {tags.map((tag) => (
                        <Token
                          key={tag}
                          label={tag}
                          color={tagColor(tag)}
                          onRemove={() => setTags((prev) => prev.filter((t) => t !== tag))}
                        />
                      ))}
                    </HStack>
                  )}
                </VStack>
              </FormLayout>

              {!isWide && preview}

              <HStack gap={3} hAlign="end">
                <Button label="Cancel" variant="ghost" href="/home" />
                <Button
                  label="Publish template"
                  variant="primary"
                  type="submit"
                  isLoading={isSubmitting}
                />
              </HStack>
            </VStack>
          </form>
        </LayoutContent>
      }
      end={
        isWide ? (
          <LayoutPanel width={380} padding={6} isScrollable={false} label="Preview">
            {preview}
          </LayoutPanel>
        ) : undefined
      }
    />
    </>
  );
}
