import { useState, useEffect } from "react";
import type { Template } from "@/types/Template";
import TemplateItem from "@/components/templates/TemplateItem";

export default function Home() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setTemplates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, []);

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
      {templates.map((template) => (
        <TemplateItem key={template.TemplateID} template={template} />
      ))}
    </div>
  );
}
