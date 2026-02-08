import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { RandomAvatar } from "react-random-avatars";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import MarkdownEditor from "@/components/ui/markdown-editor";
import Snackbar, { type SnackbarNotice } from "@/components/ui/snackbar";
import TemplateItem from "@/components/templates/TemplateItem";
import type { Template } from "@/types/Template";

import useToken from "../../hooks/useToken";

type UserProfile = {
  username: string;
  github_link: string;
  profile_description: string;
  created_at: number;
};

type AuthErrorResponse = {
  error?: {
    message?: string;
  };
};

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const { token } = useToken();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<SnackbarNotice | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [githubLink, setGithubLink] = useState("");
  const [profileDescription, setProfileDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [viewerUsername, setViewerUsername] = useState<string | null>(null);

  const isOwner = useMemo(() => {
    if (!viewerUsername || !profile?.username) return false;
    return viewerUsername === profile.username;
  }, [viewerUsername, profile]);

  useEffect(() => {
    if (!username) return;

    const safeUsername = username;

    const controller = new AbortController();

    async function fetchProfile() {
      try {
        setLoading(true);
        const response = await fetch(
          `https://bp-hub-render-service.onrender.com/getUserProfile?username=${encodeURIComponent(safeUsername)}`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error("Profile not found");
        }
        const data = (await response.json()) as UserProfile;
        setProfile(data);
        setGithubLink(data.github_link || "");
        setProfileDescription(data.profile_description || "");
      } catch (err) {
        if (isAbortError(err)) return;
        setNotice({
          title: "Unable to load profile",
          message: err instanceof Error ? err.message : "Try again later.",
          tone: "error",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();

    return () => controller.abort();
  }, [username]);

  useEffect(() => {
    if (!username) return;

    const safeUsername = username;

    const controller = new AbortController();

    fetch(`https://bp-hub-render-service.onrender.com/getUserTemplates?username=${encodeURIComponent(safeUsername)}`, {
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((data: Template[]) => setTemplates(data || []))
      .catch((err) => {
        if (isAbortError(err)) return;
        setTemplates([]);
      });

    return () => controller.abort();
  }, [username]);

  useEffect(() => {
    if (!token) {
      setViewerUsername(null);
      return;
    }

    fetch("https://bp-hub-render-service.onrender.com/userStatus", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken: token }),
    })
      .then((response) => response.json())
      .then((data: { username?: string }) => {
        if (data?.username) setViewerUsername(data.username);
      })
      .catch(() => {
        setViewerUsername(null);
      });
  }, [token]);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    if (!githubLink.trim().startsWith("http")) {
      setNotice({
        title: "Invalid GitHub link",
        message: "Please provide a valid GitHub URL.",
        tone: "warning",
      });
      return;
    }

    if (!profileDescription.trim()) {
      setNotice({
        title: "Profile description required",
        message: "Write a short markdown bio.",
        tone: "warning",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("https://bp-hub-render-service.onrender.com/updateUserProfile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idToken: token,
          github_link: githubLink,
          profile_description: profileDescription,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as
        | AuthErrorResponse
        | { username: string };

      if (!response.ok) {
        const message =
          (data as AuthErrorResponse)?.error?.message ?? "UPDATE_FAILED";
        throw new Error(message);
      }

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              github_link: githubLink,
              profile_description: profileDescription,
            }
          : prev,
      );
      setIsEditing(false);
      setNotice({
        title: "Profile updated",
        message: "Your changes are live.",
        tone: "success",
      });
    } catch (err) {
      setNotice({
        title: "Unable to update profile",
        message: err instanceof Error ? err.message : "Try again later.",
        tone: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!username) {
    return <div className="p-6 text-gray-400">Profile not found.</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!profile) {
    return <div className="p-6 text-gray-400">Profile not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <Snackbar notice={notice} onClose={() => setNotice(null)} />
      <div className="flex flex-col gap-6">
        <div className="rounded border border-gray-800 bg-[#0f1117] p-6">
          <div className="flex flex-wrap items-start gap-6">
            <div className="rounded-full border border-gray-800 bg-[#0a0b0f] p-3">
              <RandomAvatar name={profile.username} size={72} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold text-white">{profile.username}</h1>
                {isOwner && !isEditing && (
                  <Button
                    variant="secondary"
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-500/10 text-blue-300 border border-blue-500/30 hover:bg-blue-500/20"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit profile
                  </Button>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-400">{profile.github_link}</p>
            </div>
          </div>

          <div className="mt-6">
            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel>GitHub link</FieldLabel>
                    <Input
                      value={githubLink}
                      onChange={(event) => setGithubLink(event.target.value)}
                      placeholder="https://github.com/your-handle"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Profile description</FieldLabel>
                    <MarkdownEditor
                      value={profileDescription}
                      onChange={setProfileDescription}
                    />
                  </Field>
                  <div className="flex items-center justify-end gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      Save changes
                    </Button>
                  </div>
                </FieldGroup>
              </form>
            ) : (
              <div className="markdown-content text-sm text-gray-200">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {profile.profile_description || "_No description yet._"}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>

        <div className="rounded border border-gray-800 bg-[#0f1117]">
          <div className="border-b border-gray-800 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">Templates</h2>
            <p className="text-sm text-gray-400">Templates created by {profile.username}.</p>
          </div>
          {templates.length === 0 ? (
            <div className="px-6 py-8 text-sm text-gray-500">No templates yet.</div>
          ) : (
            templates.map((template) => (
              <TemplateItem key={template.TemplateID} template={template} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
