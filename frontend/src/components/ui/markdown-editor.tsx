import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export default function MarkdownEditor({
  value,
  onChange,
  className,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  return (
    <div className={cn("rounded-lg border border-gray-800 bg-[#0f1117]", className)}>
      <div className="flex items-center justify-between border-b border-gray-800 px-3 py-2">
        <div className="text-xs font-medium text-gray-400">Profile description</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={cn(
              "rounded-md px-2 py-1 text-xs",
              mode === "edit"
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:text-white",
            )}
            onClick={() => setMode("edit")}
          >
            Edit
          </button>
          <button
            type="button"
            className={cn(
              "rounded-md px-2 py-1 text-xs",
              mode === "preview"
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:text-white",
            )}
            onClick={() => setMode("preview")}
          >
            Preview
          </button>
        </div>
      </div>

      {mode === "edit" ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={8}
          className="w-full bg-transparent px-3 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none"
          placeholder="Write something about yourself. Markdown supported."
        />
      ) : (
        <div className="markdown-content px-3 py-3 text-sm text-gray-200">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || "_Nothing yet._"}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
