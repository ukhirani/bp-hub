import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, UploadCloud, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import Snackbar, { type SnackbarNotice } from "@/components/ui/snackbar";

import useToken from "../../hooks/useToken";

type TemplateType = "file" | "dir";

type TemplateCreateResponse = {
  template_name: string;
  template_id: string;
  username: string;
};

type AuthErrorResponse = {
  error?: {
    message?: string;
  };
};

const tagSeparator = /[\s,]+/;

export default function AddTemplate() {
  const { token } = useToken();
  const navigate = useNavigate();

  const [templateName, setTemplateName] = useState("");
  const [templateType, setTemplateType] = useState<TemplateType>("file");
  const [code, setCode] = useState("");
  const [fileName, setFileName] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [notice, setNotice] = useState<SnackbarNotice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    if (templateType === "dir") {
      setFileName("");
      setCode("");
    } else {
      setGithubLink("");
    }
  }, [templateType]);

  const normalizedTags = useMemo(() => tags.map((tag) => tag.toLowerCase()), [tags]);

  const handleAddTags = (value: string) => {
    const next = value
      .split(tagSeparator)
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (!next.length) return;

    setTags((prev) => {
      const merged = new Set(prev.map((tag) => tag.toLowerCase()));
      next.forEach((tag) => merged.add(tag.toLowerCase()));
      return Array.from(merged);
    });
    setTagInput("");
  };

  const handleTagKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      handleAddTags(tagInput);
    }
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((item) => item !== tag));
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setCode(String(reader.result ?? ""));
      setFileName(file.name);
    };
    reader.readAsText(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const validate = () => {
    if (!templateName.trim()) {
      setNotice({
        title: "Template name required",
        message: "Give your template a clear, unique name.",
        tone: "warning",
      });
      return false;
    }

    if (templateType === "file") {
      if (!fileName.trim()) {
        setNotice({
          title: "File name required",
          message: "Add a file name like template.cpp.",
          tone: "warning",
        });
        return false;
      }
      if (!code.trim()) {
        setNotice({
          title: "Code required",
          message: "Paste your file contents or upload a file.",
          tone: "warning",
        });
        return false;
      }
    }

    if (templateType === "dir") {
      if (!githubLink.trim().startsWith("http")) {
        setNotice({
          title: "GitHub link required",
          message: "Upload a file to continue.",
          tone: "warning",
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    setNotice(null);
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:8080/addTemplate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idToken: token,
          template_name: templateName,
          type: templateType,
          code: templateType === "file" ? code : "",
          file_name: templateType === "file" ? fileName : "",
          github_repo_link: templateType === "dir" ? githubLink : "",
          tags: normalizedTags,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as
        | TemplateCreateResponse
        | AuthErrorResponse;

      if (!response.ok) {
        const code = (data as AuthErrorResponse)?.error?.message;
        if (code === "TEMPLATE_NAME_TAKEN") {
          throw new Error("This template name is already in use.");
        }
        throw new Error("Unable to save template. Try again.");
      }

      const result = data as TemplateCreateResponse;
      sessionStorage.setItem(
        "app_notice",
        JSON.stringify({
          title: "Template created",
          message: `${result.template_name} is now in your library.`,
          tone: "success",
        }),
      );
      navigate("/", { replace: true });
    } catch (err) {
      setNotice({
        title: "Unable to create template",
        message: err instanceof Error ? err.message : "Try again.",
        tone: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white">
      <Snackbar notice={notice} onClose={() => setNotice(null)} />
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-12">
        <div>
          <h1 className="text-2xl font-semibold">Add a new template</h1>
          <p className="text-sm text-gray-400">
            Share a single-file snippet or a full repository.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="templateName">Template name</FieldLabel>
              <Input
                id="templateName"
                value={templateName}
                onChange={(event) => setTemplateName(event.target.value)}
                placeholder="my-react-starter"
                required
              />
              <FieldDescription>
                Names must be unique within your account.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="templateType">Template type</FieldLabel>
              <div className="relative">
                <select
                  id="templateType"
                  value={templateType}
                  onChange={(event) =>
                    setTemplateType(event.target.value as TemplateType)
                  }
                  className="h-10 w-full appearance-none rounded-md border border-gray-800 bg-[#0f1117] px-3 pr-9 text-sm text-white focus:outline-none"
                >
                  <option value="file">File</option>
                  <option value="dir">Directory</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </Field>

            {templateType === "file" && (
              <div className="space-y-4">
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`rounded-xl border border-dashed px-4 py-6 text-center transition ${
                    isDragging
                      ? "border-blue-400/70 bg-blue-500/10"
                      : "border-gray-700 bg-[#0f1117]"
                  }`}
                >
                  <div className="flex flex-col items-center gap-3 text-gray-300">
                    <UploadCloud className="h-8 w-8" />
                    <div className="text-sm font-medium">
                      Drag a file here or upload from your device
                    </div>
                    <div className="text-xs text-gray-500">
                      Only one file is supported.
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose file
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) handleFile(file);
                      }}
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-gray-800 bg-[#0f1117] px-4 py-3 text-sm text-gray-300">
                  {fileName ? (
                    <div className="flex items-center justify-between">
                      <span className="truncate">Selected: {fileName}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFileName("");
                          setCode("");
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        className="text-xs text-gray-400 hover:text-white"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <span>No file selected yet.</span>
                  )}
                </div>
              </div>
            )}

            {templateType === "dir" && (
              <Field>
                <FieldLabel htmlFor="github">GitHub repo link</FieldLabel>
                <Input
                  id="github"
                  value={githubLink}
                  onChange={(event) => setGithubLink(event.target.value)}
                  placeholder="https://github.com/you/repo"
                  required
                />
              </Field>
            )}

            <Field>
              <FieldLabel>Tags</FieldLabel>
              <Input
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => handleAddTags(tagInput)}
                placeholder="react, vite, auth"
              />
              <FieldDescription>
                Press enter or comma to add a tag.
              </FieldDescription>
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-2 rounded-full border border-gray-700 bg-gray-800 px-3 py-1 text-xs text-gray-200"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </Field>

            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/", { replace: true })}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Plus className="mr-2 h-4 w-4" />
                Create template
              </Button>
            </div>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
