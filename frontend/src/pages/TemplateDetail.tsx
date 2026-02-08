import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Star,
  GitFork,
  Copy,
  Check,
  FileCode,
  BookOpen,
  Terminal,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import type { Template } from "@/types/Template";
import { formatRelativeTime } from "@/lib/utils";

// Language color mapping for tags
const tagColors: Record<string, string> = {
  go: "bg-cyan-400",
  golang: "bg-cyan-400",
  typescript: "bg-blue-500",
  ts: "bg-blue-500",
  javascript: "bg-yellow-400",
  js: "bg-yellow-400",
  python: "bg-blue-400",
  rust: "bg-orange-500",
  ruby: "bg-red-500",
  java: "bg-red-400",
  cpp: "bg-pink-500",
  c: "bg-gray-400",
  default: "bg-gray-500",
};

function getTagColor(tag: string): string {
  return tagColors[tag.toLowerCase()] || tagColors.default;
}

// Code block component with syntax highlighting colors
function CodeBlock({
  code,
  language,
  title,
}: {
  code: string;
  language?: string;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-gray-700 overflow-hidden">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">{title}</span>
            {language && (
              <span className="text-xs text-gray-500">({language})</span>
            )}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}
      <pre className="p-4 bg-[#0d1117] overflow-x-auto">
        <code className="text-sm text-gray-300 font-mono whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  );
}

// Command list component
function CommandList({
  commands,
  title,
}: {
  commands: string[];
  title: string;
}) {
  if (!commands || commands.length === 0) return null;

  return (
    <div className="rounded-lg border border-gray-700 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700">
        <Terminal className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-300">{title}</span>
      </div>
      <div className="p-4 bg-[#0d1117] space-y-2">
        {commands.map((cmd, index) => (
          <div
            key={index}
            className="flex items-center gap-2 font-mono text-sm"
          >
            <span className="text-gray-500">$</span>
            <span className="text-green-400">{cmd}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TemplateDetail() {
  const { username, templateName } = useParams();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTemplate() {
      try {
        setLoading(true);
        // Fetch all templates and find the matching one
        const response = await fetch(
          "https://bp-hub-render-service.onrender.com/getTemplates",
        );
        if (!response.ok) {
          throw new Error("Failed to fetch template");
        }
        const data: Template[] = await response.json();
        const found = data.find(
          (t) => t.Username === username && t.TemplateName === templateName,
        );
        if (!found) {
          throw new Error("Template not found");
        }
        setTemplate(found);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchTemplate();
  }, [username, templateName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-red-400">{error || "Template not found"}</p>
        <Link
          to="/"
          className="flex items-center gap-2 text-blue-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to templates
        </Link>
      </div>
    );
  }

  const primaryTag = template.Tags?.[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Back link */}
      {/* <Link */}
      {/*   to="/" */}
      {/*   className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors" */}
      {/* > */}
      {/*   <ArrowLeft className="w-4 h-4" /> */}
      {/*   <span>Back to templates</span> */}
      {/* </Link> */}

      {/* Header */}
      <div className="border-b border-gray-800 pb-6 mb-6">
        {/* Title row */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-xl sm:text-2xl">
              <span className="text-blue-400 font-medium">
                {template.Username}
              </span>
              <span className="text-gray-500">/</span>
              <span className="text-blue-400 font-semibold">
                {template.TemplateName}
              </span>
            </div>

            {/* Type badge */}
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-0.5 text-xs font-medium text-gray-400 border border-gray-700 rounded-full">
                {template.Type}
              </span>
              {template.GithubRepoLink && (
                <a
                  href={template.GithubRepoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  GitHub
                </a>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 border border-gray-700 rounded-md hover:bg-gray-800 transition-colors">
              <Star className="w-4 h-4" />
              <span>Star</span>
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-800 rounded-xl">
                {template.Stars}
              </span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 border border-gray-700 rounded-md hover:bg-gray-800 transition-colors">
              <GitFork className="w-4 h-4" />
              <span>Fork</span>
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-800 rounded-xl">
                {template.Clones}
              </span>
            </button>
          </div>
        </div>

        {/* Description */}
        {template.Description && (
          <p className="mt-4 text-gray-400">{template.Description}</p>
        )}

        {/* Tags */}
        {template.Tags && template.Tags.length > 0 && (
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {template.Tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/30 rounded-full hover:bg-blue-500/20 transition-colors cursor-pointer"
              >
                {index === 0 && (
                  <span className={`w-2 h-2 rounded-full ${getTagColor(tag)}`} />
                )}
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Meta info */}
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
          <span>Created {formatRelativeTime(template.CreatedAt)}</span>
          <span>Updated {formatRelativeTime(template.UpdatedAt)}</span>
        </div>
      </div>

      {/* Content sections */}
      <div className="space-y-8">
        {/* Usage section */}
        {template.Usage && (
          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
              <Terminal className="w-5 h-5" />
              Usage
            </h2>
            <CodeBlock code={template.Usage} title="Quick start" />
          </section>
        )}

        {/* Pre-commands */}
        {template.PreCmds && template.PreCmds.length > 0 && (
          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
              <Terminal className="w-5 h-5" />
              Pre-Generation Commands
            </h2>
            <CommandList
              commands={template.PreCmds}
              title="Runs before generation"
            />
          </section>
        )}

        {/* Post-commands */}
        {template.PostCmds && template.PostCmds.length > 0 && (
          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
              <Terminal className="w-5 h-5" />
              Post-Generation Commands
            </h2>
            <CommandList
              commands={template.PostCmds}
              title="Runs after generation"
            />
          </section>
        )}

        {/* Code section */}
        {template.Type === "file" && template.Code && (
          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
              <FileCode className="w-5 h-5" />
              Source Code
            </h2>
            <CodeBlock
              code={template.Code}
              language={primaryTag}
              title={template.FileName || `main.${primaryTag || "txt"}`}
            />
          </section>
        )}

        {/* Repo section */}
        {template.Type === "dir" && template.GithubRepoLink && (
          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
              <ExternalLink className="w-5 h-5" />
              Repository
            </h2>
            <a
              href={template.GithubRepoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-400 hover:underline break-all"
            >
              {template.GithubRepoLink}
            </a>
          </section>
        )}

        {/* Documentation */}
        {template.Documentation && (
          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
              <BookOpen className="w-5 h-5" />
              Documentation
            </h2>
            <div className="prose prose-invert max-w-none">
              <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">
                  {template.Documentation}
                </pre>
              </div>
            </div>
          </section>
        )}

        {/* Fork info 
        {!!template.ForkOf && (
          <section className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
            <p className="text-sm text-gray-400">
              <GitFork className="w-4 h-4 inline mr-1" />
              Forked from template ID:{" "}
              <span className="text-blue-400">{template.ForkOf}</span>
            </p>
          </section>
        )}*/}
      </div>
    </div>
  );
}
