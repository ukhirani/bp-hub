import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout, LayoutContent } from "@astryxdesign/core/Layout";
import { HStack, VStack, StackItem } from "@astryxdesign/core/Stack";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Link } from "@astryxdesign/core/Link";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Markdown } from "@astryxdesign/core/Markdown";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { Icon } from "@astryxdesign/core/Icon";
import { Pencil, UserX, PackageOpen } from "lucide-react";
import { RandomAvatar } from "react-random-avatars";

import MarkdownEditor from "@/components/ui/markdown-editor";
import Snackbar, { type SnackbarNotice } from "@/components/ui/snackbar";
import TemplateTable from "@/components/templates/TemplateTable";
import type { Template } from "@/types/Template";
import { useAuth } from "@/context/AuthContext";
import { API_BASE, postJSON } from "@/lib/api";

type UserProfile = {
  username: string;
  github_link: string;
  profile_description: string;
  created_at: number;
};

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function githubHandle(link: string): string {
  const match = link.match(/github\.com\/([^/?#]+)/i);
  return match ? `@${match[1]}` : link.replace(/^https?:\/\//, "");
}

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const { token, username: authUsername } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [templates, setTemplates] = useState<Template[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<SnackbarNotice | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [githubLink, setGithubLink] = useState("");
  const [profileDescription, setProfileDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const isOwner = useMemo(
    () => !!authUsername && authUsername === profile?.username,
    [authUsername, profile],
  );

  useEffect(() => {
    if (!username) return;
    const controller = new AbortController();
    setLoading(true);
    setIsEditing(false);
    fetch(`${API_BASE}/getUserProfile?username=${encodeURIComponent(username)}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Profile not found");
        return response.json() as Promise<UserProfile>;
      })
      .then((data) => {
        setProfile(data);
        setGithubLink(data.github_link || "");
        setProfileDescription(data.profile_description || "");
      })
      .catch((err) => {
        if (isAbortError(err)) return;
        setProfile(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [username]);

  useEffect(() => {
    if (!username) return;
    const controller = new AbortController();
    setTemplates(null);
    fetch(`${API_BASE}/getUserTemplates?username=${encodeURIComponent(username)}`, {
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((data: Template[]) => setTemplates(Array.isArray(data) ? data : []))
      .catch((err) => {
        if (isAbortError(err)) return;
        setTemplates([]);
      });
    return () => controller.abort();
  }, [username]);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    if (!githubLink.trim().startsWith("http")) {
      setNotice({
        title: "Check your GitHub link",
        message: "Use the full address, like https://github.com/your-handle.",
        tone: "warning",
      });
      return;
    }
    if (!profileDescription.trim()) {
      setNotice({
        title: "Add a short bio",
        message: "A sentence or two is enough. Markdown works.",
        tone: "warning",
      });
      return;
    }

    setIsSaving(true);
    try {
      await postJSON(
        "/updateUserProfile",
        { idToken: token, github_link: githubLink, profile_description: profileDescription },
        "UPDATE_FAILED",
      );
      setProfile((prev) =>
        prev ? { ...prev, github_link: githubLink, profile_description: profileDescription } : prev,
      );
      setIsEditing(false);
      setNotice({ title: "Profile updated", message: "Your changes are live.", tone: "success" });
    } catch {
      setNotice({
        title: "Couldn't save your profile",
        message: "Something went wrong on our side. Try again.",
        tone: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <VStack gap={4} padding={6}>
        <HStack gap={4} vAlign="center">
          <Skeleton width={72} height={72} radius="rounded" />
          <VStack gap={2}>
            <Skeleton width={180} height={22} />
            <Skeleton width={120} height={12} />
          </VStack>
        </HStack>
        <Skeleton width="70%" height={14} />
        <Skeleton width="50%" height={14} />
      </VStack>
    );
  }

  if (!username || !profile) {
    return (
      <EmptyState
        icon={<Icon icon={UserX} size="lg" color="secondary" />}
        title="Profile not found"
        description={`No one goes by ${username ?? "that name"} on BP Hub.`}
        actions={<Button label="Back to templates" variant="primary" href="/home" />}
      />
    );
  }

  return (
    <Layout
      height="auto"
      contentWidth={960}
      content={
        <LayoutContent padding={6} isScrollable={false}>
          <Snackbar notice={notice} onClose={() => setNotice(null)} />
          <VStack gap={8}>
            <HStack gap={5} vAlign="center" wrap="wrap">
              <RandomAvatar name={profile.username} size={72} />
              <StackItem size="fill">
                <VStack gap={1}>
                  <Heading level={1}>{profile.username}</Heading>
                  {profile.github_link && (
                    <Link href={profile.github_link} isExternalLink color="secondary">
                      {githubHandle(profile.github_link)}
                    </Link>
                  )}
                </VStack>
              </StackItem>
              {isOwner && !isEditing && (
                <Button
                  label="Edit profile"
                  icon={<Icon icon={Pencil} />}
                  onClick={() => setIsEditing(true)}
                />
              )}
            </HStack>

            {isEditing ? (
              <Card padding={6}>
                <form onSubmit={handleSave}>
                  <VStack gap={5}>
                    <Heading level={2}>Edit profile</Heading>
                    <TextInput
                      label="GitHub link"
                      type="url"
                      value={githubLink}
                      onChange={setGithubLink}
                      placeholder="https://github.com/your-handle"
                      isRequired
                      width="100%"
                    />
                    <MarkdownEditor
                      label="Bio"
                      value={profileDescription}
                      onChange={setProfileDescription}
                      isRequired
                    />
                    <HStack gap={3} hAlign="end">
                      <Button label="Cancel" variant="ghost" onClick={() => setIsEditing(false)} />
                      <Button label="Save changes" variant="primary" type="submit" isLoading={isSaving} />
                    </HStack>
                  </VStack>
                </form>
              </Card>
            ) : profile.profile_description ? (
              <Markdown headingLevelStart={2}>{profile.profile_description}</Markdown>
            ) : (
              <Text type="body" color="secondary">
                {isOwner ? "You haven't written a bio yet." : "No bio yet."}
              </Text>
            )}

            <VStack gap={3}>
              <HStack gap={2} vAlign="center">
                <Heading level={2}>Templates</Heading>
                {templates && templates.length > 0 && (
                  <Text type="body" color="secondary" hasTabularNumbers>
                    {templates.length}
                  </Text>
                )}
              </HStack>
              {templates === null ? (
                <VStack gap={3}>
                  <Skeleton width="60%" height={14} />
                  <Skeleton width="40%" height={14} />
                </VStack>
              ) : (
                <TemplateTable
                  templates={templates}
                  hasOwner={false}
                  emptyState={
                    <EmptyState
                      isCompact
                      icon={<Icon icon={PackageOpen} color="secondary" />}
                      title={isOwner ? "You haven't published a template yet" : "No templates yet"}
                      actions={
                        isOwner ? (
                          <Button label="Add template" variant="primary" href="/home/templates/new" />
                        ) : undefined
                      }
                    />
                  }
                />
              )}
            </VStack>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
