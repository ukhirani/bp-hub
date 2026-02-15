import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight, X, Menu } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import bpLogo from "@/assets/white.png";
import { useState } from "react";

export interface DocsSection {
  id: string;
  title: string;
}

export interface DocsChapter {
  id: string;
  title: string;
  icon?: LucideIcon;
  sections: DocsSection[];
}

interface DocsSidebarProps {
  chapters: DocsChapter[];
  activeSection: string;
  onSectionClick: (chapterId: string, sectionId: string) => void;
}

export default function DocsSidebar({
  chapters,
  activeSection,
  onSectionClick,
}: DocsSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set(chapters.map((c) => c.id))
  );

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  const handleSectionClick = (chapterId: string, sectionId: string) => {
    onSectionClick(chapterId, sectionId);
    setSidebarOpen(false);
  };

  const isDocsPage = location.pathname.startsWith("/docs");

  return (
    <>
      {/* Mobile menu button - only show on docs pages */}
      {isDocsPage && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-40 lg:hidden p-2 bg-[#0f1117] border border-gray-800 rounded-lg text-gray-400 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:fixed inset-y-0 left-0 z-50
          w-72 bg-[#0f1117] border-r border-gray-800
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          flex flex-col h-screen overflow-hidden
        `}
      >
        {/* Logo & Header */}
        <div className="p-4 flex items-center justify-between flex-shrink-0 border-b border-gray-800">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img className="w-8 h-8" src={bpLogo} alt="Logo" />
            <span className="text-white font-semibold">Boilerplate</span>
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Docs label */}
        <div className="px-4 py-3 border-b border-gray-800">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Documentation
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {chapters.map((chapter) => (
            <div key={chapter.id} className="mb-2">
              {/* Chapter header */}
              <button
                onClick={() => toggleChapter(chapter.id)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {chapter.icon && <chapter.icon className="w-4 h-4" />}
                  <span>{chapter.title}</span>
                </div>
                {expandedChapters.has(chapter.id) ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {/* Sections */}
              {expandedChapters.has(chapter.id) && (
                <div className="ml-4 mt-1 space-y-0.5">
                  {chapter.sections.map((section) => {
                    const sectionKey = `${chapter.id}-${section.id}`;
                    const isActive = activeSection === sectionKey;

                    return (
                      <button
                        key={section.id}
                        onClick={() => handleSectionClick(chapter.id, section.id)}
                        className={`
                          w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors
                          ${
                            isActive
                              ? "bg-blue-500/10 text-blue-400 border-l-2 border-blue-400"
                              : "text-gray-400 hover:text-white hover:bg-gray-800/30"
                          }
                        `}
                      >
                        {section.title}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 flex-shrink-0">
          <a
            href="https://github.com/ukhirani/boilerplate"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            <span>View on GitHub</span>
          </a>
        </div>
      </aside>
    </>
  );
}
