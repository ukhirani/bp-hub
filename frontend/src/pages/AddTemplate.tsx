import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, UploadCloud, X } from "lucide-react";
// import { Plus} from "lucide-react";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import Snackbar, { type SnackbarNotice } from "@/components/ui/snackbar";

import { useAuth } from "@/context/AuthContext";

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
  const { token } = useAuth();
  const navigate = useNavigate();

  const [templateName, setTemplateName] = useState("");
  const [templateType, setTemplateType] = useState<TemplateType>("file");
  const [code, setCode] = useState("");
  const [fileName, setFileName] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [preCmds, setPreCmds] = useState<string[]>([]);
  const [preCmdInput, setPreCmdInput] = useState("");
  const [postCmds, setPostCmds] = useState<string[]>([]);
  const [postCmdInput, setPostCmdInput] = useState("");
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

  const addCommand = (
    value: string,
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    setInput: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setList((prev) => [...prev, trimmed]);
    setInput("");
  };

  const handleCommandKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    onAdd: () => void,
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onAdd();
    }
  };

  const removeCommand = (
    index: number,
    setList: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setList((prev) => prev.filter((_, i) => i !== index));
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
      const response = await fetch("https://bp-hub-render-service.onrender.com/addTemplate", {
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
          pre_cmds: preCmds,
          post_cmds: postCmds,
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
              <FieldLabel>Pre-generation commands</FieldLabel>
              <FieldDescription>
                Commands to run before template generation (e.g., npm install)
              </FieldDescription>
              <div className="flex gap-2">
                <Input
                  value={preCmdInput}
                  onChange={(event) => setPreCmdInput(event.target.value)}
                  onKeyDown={(event) =>
                    handleCommandKeyDown(event, () =>
                      addCommand(preCmdInput, setPreCmds, setPreCmdInput),
                    )
                  }
                  placeholder="npm install"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    addCommand(preCmdInput, setPreCmds, setPreCmdInput)
                  }
                >
                  Add
                </Button>
              </div>
              {preCmds.length > 0 && (
                <div className="mt-3 rounded-lg border border-gray-700 bg-[#0d1117] p-3">
                  <div className="text-xs font-medium text-gray-400 mb-2">Preview:</div>
                  <div className="space-y-1.5">
                    {preCmds.map((cmd, index) => (
                      <div
                        key={`${cmd}-${index}`}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <div className="flex items-center gap-2 font-mono flex-1 min-w-0">
                          <span className="text-gray-500">$</span>
                          <span className="text-green-400 truncate">{cmd}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCommand(index, setPreCmds)}
                          className="text-gray-400 hover:text-white shrink-0"
                          aria-label="Remove command"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Field>

            <Field>
              <FieldLabel>Post-generation commands</FieldLabel>
              <FieldDescription>
                Commands to run after template generation (e.g., npm run build)
              </FieldDescription>
              <div className="flex gap-2">
                <Input
                  value={postCmdInput}
                  onChange={(event) => setPostCmdInput(event.target.value)}
                  onKeyDown={(event) =>
                    handleCommandKeyDown(event, () =>
                      addCommand(postCmdInput, setPostCmds, setPostCmdInput),
                    )
                  }
                  placeholder="npm run build"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    addCommand(postCmdInput, setPostCmds, setPostCmdInput)
                  }
                >
                  Add
                </Button>
              </div>
              {postCmds.length > 0 && (
                <div className="mt-3 rounded-lg border border-gray-700 bg-[#0d1117] p-3">
                  <div className="text-xs font-medium text-gray-400 mb-2">Preview:</div>
                  <div className="space-y-1.5">
                    {postCmds.map((cmd, index) => (
                      <div
                        key={`${cmd}-${index}`}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <div className="flex items-center gap-2 font-mono flex-1 min-w-0">
                          <span className="text-gray-500">$</span>
                          <span className="text-green-400 truncate">{cmd}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCommand(index, setPostCmds)}
                          className="text-gray-400 hover:text-white shrink-0"
                          aria-label="Remove command"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Field>

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
                {/* <Plus className="mr-2 h-4 w-4" /> */}
                Create template
              </Button>
            </div>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
