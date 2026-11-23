import type { Template } from "@/types/Template";

export type TokenColor =
  | "default"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "teal"
  | "cyan"
  | "blue"
  | "purple"
  | "pink"
  | "gray";

const LANGUAGE_COLORS: Record<string, TokenColor> = {
  go: "cyan",
  golang: "cyan",
  typescript: "blue",
  ts: "blue",
  tsx: "blue",
  javascript: "yellow",
  js: "yellow",
  python: "teal",
  py: "teal",
  rust: "orange",
  ruby: "red",
  java: "red",
  cpp: "pink",
  "c++": "pink",
  c: "gray",
};

/** A tag's token color: languages get their usual hue, other tags stay neutral. */
export function tagColor(tag: string): TokenColor {
  return LANGUAGE_COLORS[tag.toLowerCase()] ?? "default";
}

/** The backend has shipped a few field spellings over time. */
export function templateName(t: Template): string {
  return t.TemplateName || (t as { Name?: string }).Name || "";
}

export function templateOwner(t: Template): string {
  return t.Username || (t as { username?: string }).username || "";
}

export function templatePath(t: Template): string {
  return `/home/templates/${templateOwner(t)}/${templateName(t)}`;
}

export const TYPE_LABELS: Record<string, string> = {
  file: "File",
  dir: "Directory",
  boilerplate: "Boilerplate",
};

/** Map a template's primary tag to a CodeBlock language name. */
export function codeLanguage(tag?: string): string {
  if (!tag) return "plaintext";
  const map: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    py: "python",
    rb: "ruby",
    rs: "rust",
    golang: "go",
    sh: "bash",
    "c++": "cpp",
  };
  const key = tag.toLowerCase();
  return map[key] ?? key;
}
