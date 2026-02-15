import { useState, useEffect, useMemo } from "react";
import type { Template } from "@/types/Template";
import TemplateItem from "@/components/templates/TemplateItem";
import SearchBar from "@/components/templates/SearchBar";

export default function Home() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch templates from API
  useEffect(() => {
    async function fetchTemplates() {
      try {
        setLoading(true);
        const response = await fetch(
          "https://bp-hub-render-service.onrender.com/getTemplates",
        );
        if (!response.ok) {
          throw new Error("Failed to fetch templates");
        }
        const data = await response.json();
        const templatesFromApi = Array.isArray(data)
          ? data
          : Array.isArray(data?.templates)
            ? data.templates
            : [];
        setTemplates(templatesFromApi);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, []);

  // Filter templates based on search query
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) {
      return templates;
    }

    const query = searchQuery.trim().toLowerCase();
    return templates.filter((template) => {
      const rawTemplateName =
        template.TemplateName || (template as { Name?: string }).Name || "";
      const rawUsername =
        template.Username || (template as { username?: string }).username || "";

      const templateName = rawTemplateName.toLowerCase();
      const username = rawUsername.toLowerCase();
      const combined = `${username}/${templateName}`;

      return (
        templateName.includes(query) ||
        username.includes(query) ||
        combined.includes(query)
      );
    });
  }, [templates, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12 text-red-400">
        {error}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        No templates found
      </div>
    );
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="px-4 sm:px-6 pb-4 border-b border-gray-800">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Templates List */}
      <div>
        {filteredTemplates.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            No templates found matching "{searchQuery}"
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <TemplateItem key={template.TemplateID} template={template} />
          ))
        )}
      </div>
    </div>
  );
}
