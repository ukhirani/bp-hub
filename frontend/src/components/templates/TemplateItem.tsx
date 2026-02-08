import { useNavigate } from "react-router-dom";
import { ChevronRight, Star, GitFork } from "lucide-react";
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

interface TemplateItemProps {
  template: Template;
}

export default function TemplateItem({ template }: TemplateItemProps) {
  const navigate = useNavigate();
  const primaryTag = template.Tags?.[0];

  const handleClick = () => {
    navigate(`/templates/${template.Username}/${template.TemplateName}`);
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-start justify-between py-5 px-4 sm:px-6 hover:bg-gray-800/30 transition-colors cursor-pointer group border-b border-gray-800"
    >
      <div className="flex-1 min-w-0">
        {/* Username / Template Name + Tags */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-base sm:text-lg">
            <span className="text-blue-400 hover:underline font-medium">
              {template.Username}
            </span>
            <span className="text-gray-500">/</span>
            <span className="text-blue-400 hover:underline font-semibold">
              {template.TemplateName}
            </span>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 text-xs font-medium text-gray-400 border border-gray-700 rounded-full">
              {template.Type}
            </span>
            {template.Tags?.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 text-xs font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-full hover:bg-gray-700 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        <p className="mt-2 text-sm text-gray-400 line-clamp-2 max-w-2xl">
          {template.Description || "No description provided"}
        </p>

        {/* Meta info row */}
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          {/* Primary language indicator */}
          {primaryTag && (
            <div className="flex items-center gap-1.5">
              <span
                className={`w-3 h-3 rounded-full ${getTagColor(primaryTag)}`}
              />
              <span className="lowercase">{primaryTag}</span>
            </div>
          )}

          {/* Stars */}
          <div className="flex items-center gap-1 hover:text-blue-400 transition-colors">
            <Star className="w-4 h-4" />
            <span>{template.Stars}</span>
          </div>

          {/* Forks/Clones */}
          <div className="flex items-center gap-1 hover:text-blue-400 transition-colors">
            <GitFork className="w-4 h-4" />
            <span>{template.Clones}</span>
          </div>

          {/* Updated time */}
          <span>Updated {formatRelativeTime(template.UpdatedAt)}</span>
        </div>
      </div>

      {/* Arrow indicator */}
      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors mt-1 flex-shrink-0" />
    </div>
  );
}
