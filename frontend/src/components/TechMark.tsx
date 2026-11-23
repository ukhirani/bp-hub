import {
  siC,
  siCplusplus,
  siDart,
  siDjango,
  siDocker,
  siExpress,
  siFastapi,
  siFlask,
  siFlutter,
  siGnubash,
  siGo,
  siJavascript,
  siKotlin,
  siNextdotjs,
  siNodedotjs,
  siOpenjdk,
  siPhp,
  siPostgresql,
  siPython,
  siReact,
  siRuby,
  siRust,
  siSvelte,
  siSwift,
  siTailwindcss,
  siTypescript,
  siVite,
  siVuedotjs,
  type SimpleIcon,
} from "simple-icons";

/** Tags people use on templates, mapped to the real logo of the language or tool. */
const MARKS: Record<string, SimpleIcon> = {
  go: siGo,
  golang: siGo,
  typescript: siTypescript,
  ts: siTypescript,
  tsx: siTypescript,
  javascript: siJavascript,
  js: siJavascript,
  python: siPython,
  py: siPython,
  rust: siRust,
  ruby: siRuby,
  java: siOpenjdk,
  cpp: siCplusplus,
  "c++": siCplusplus,
  c: siC,
  docker: siDocker,
  dockerfile: siDocker,
  react: siReact,
  vite: siVite,
  fastapi: siFastapi,
  node: siNodedotjs,
  nodejs: siNodedotjs,
  tailwind: siTailwindcss,
  tailwindcss: siTailwindcss,
  next: siNextdotjs,
  nextjs: siNextdotjs,
  vue: siVuedotjs,
  svelte: siSvelte,
  bash: siGnubash,
  shell: siGnubash,
  sh: siGnubash,
  kotlin: siKotlin,
  swift: siSwift,
  php: siPhp,
  django: siDjango,
  flask: siFlask,
  express: siExpress,
  postgres: siPostgresql,
  postgresql: siPostgresql,
  dart: siDart,
  flutter: siFlutter,
};

/** Near-black brand colours (Rust, Next.js…) follow the text colour so they read in dark mode. */
function fillFor(hex: string): string {
  const n = parseInt(hex, 16);
  const lum = 0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255);
  return lum < 48 ? "currentColor" : `#${hex}`;
}

/** The first tag that has a known logo, drawn in its brand colour. Renders nothing otherwise. */
export default function TechMark({
  tags,
  size = 16,
}: {
  tags: string[] | undefined;
  size?: number;
}) {
  const icon = tags?.map((t) => MARKS[t.toLowerCase()]).find(Boolean);
  if (!icon) return null;
  return (
    <svg
      role="img"
      aria-label={icon.title}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={fillFor(icon.hex)}
      className="shrink-0"
    >
      <title>{icon.title}</title>
      <path d={icon.path} />
    </svg>
  );
}
