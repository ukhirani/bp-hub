import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { RandomAvatar } from "react-random-avatars";
import { Center } from "@astryxdesign/core/Center";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Button } from "@astryxdesign/core/Button";
import { Banner } from "@astryxdesign/core/Banner";

import BrandMark from "@/components/BrandMark";
import MarkdownEditor from "@/components/ui/markdown-editor";
import Snackbar, { type SnackbarNotice } from "@/components/ui/snackbar";
import { useAuth } from "@/context/auth-context";
import { fetchUserStatus, postJSON } from "@/lib/api";

type UsernameCheckResponse = {
  available: boolean;
  username: string;
};

type Availability = "idle" | "valid" | "invalid" | "checking" | "available" | "taken";

const usernameRegex = /^[a-z0-9_-]{3,24}$/;

export default function Onboarding() {
  const { token, setUsername: setAuthUsername } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [profileDescription, setProfileDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availability, setAvailability] = useState<Availability>("idle");
  const [attempted, setAttempted] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [notice, setNotice] = useState<SnackbarNotice | null>(null);

  const normalizedUsername = useMemo(() => username.trim().toLowerCase(), [username]);
  const isUsernameValid = usernameRegex.test(normalizedUsername);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    fetchUserStatus(token)
      .then((status) => {
        if (status.hasProfile) navigate("/home", { replace: true });
      })
      .catch(() => {
        setNotice({
          title: "Couldn't check your account",
          message: "Sign in again to continue.",
          tone: "error",
        });
      });
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;
    if (!normalizedUsername) return setAvailability("idle");
    if (!isUsernameValid) return setAvailability("invalid");

    setAvailability("checking");
    const timeout = window.setTimeout(() => {
      postJSON<UsernameCheckResponse>(
        "/checkUsername",
        { idToken: token, username: normalizedUsername },
        "USERNAME_CHECK_FAILED",
      )
        .then((result) => setAvailability(result.available ? "available" : "taken"))
        .catch(() => setAvailability("valid"));
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [token, normalizedUsername, isUsernameValid]);

  const usernameStatus = (() => {
    switch (availability) {
      case "invalid":
        return { type: "warning" as const, message: "3–24 characters: lowercase letters, numbers, - or _." };
      case "available":
        return { type: "success" as const, message: `${normalizedUsername} is yours if you want it.` };
      case "taken":
        return { type: "error" as const, message: "That username is taken. Try another." };
      default:
        return attempted && !normalizedUsername
          ? { type: "error" as const, message: "Pick a username." }
          : undefined;
    }
  })();

  const githubInvalid = attempted && !githubLink.trim().startsWith("http");
  const bioMissing = attempted && !profileDescription.trim();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttempted(true);
    setProblem(null);
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    if (
      !isUsernameValid ||
      availability === "taken" ||
      !githubLink.trim().startsWith("http") ||
      !profileDescription.trim()
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await postJSON<UsernameCheckResponse>(
        "/registerUserDetails",
        {
          idToken: token,
          username: normalizedUsername,
          github_link: githubLink,
          profile_description: profileDescription,
        },
        "USER_REGISTER_FAILED",
      );
      setAuthUsername(result.username);
      sessionStorage.setItem(
        "app_notice",
        JSON.stringify({
          title: `Welcome, ${result.username}`,
          message: "Your profile is ready.",
          tone: "success",
        }),
      );
      navigate("/home", { replace: true });
    } catch (err) {
      const code = err instanceof Error ? err.message : "";
      setProblem(
        code === "USERNAME_TAKEN"
          ? "That username was just taken. Pick another."
          : code === "USER_ALREADY_REGISTERED"
            ? "Your profile already exists. Head to the registry."
            : "Something went wrong on our side. Try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Center axis="horizontal" padding={6} minHeight="100dvh">
      <Snackbar notice={notice} onClose={() => setNotice(null)} />
      <VStack gap={6} width="100%" maxWidth={640} paddingBlock={8}>
        <HStack gap={2} vAlign="center">
          <BrandMark size={32} label="" />
          <Text type="body" weight="semibold">
            BP Hub
          </Text>
        </HStack>
        <VStack gap={2}>
          <Heading level={1}>Set up your profile</Heading>
          <Text type="body" color="secondary">
            Your username is how people clone your templates:{" "}
            <Text type="code">bp clone {normalizedUsername || "you"}/template</Text>
          </Text>
        </VStack>

        <Card padding={6}>
          <form onSubmit={handleSubmit} noValidate>
            <VStack gap={5}>
              {problem && <Banner status="error" title="Couldn't save your profile" description={problem} />}
              <HStack gap={4} vAlign="center">
                <RandomAvatar
                  key={normalizedUsername || "bp-user"}
                  name={normalizedUsername || "bp-user"}
                  size={56}
                />
                <VStack gap={0.5}>
                  <Text type="body" weight="semibold">
                    {normalizedUsername || "Your avatar"}
                  </Text>
                  <Text type="supporting" color="secondary">
                    Generated from your username, so it changes as you type.
                  </Text>
                </VStack>
              </HStack>

              <TextInput
                label="Username"
                value={username}
                onChange={setUsername}
                placeholder="ada-lovelace"
                isRequired
                isLoading={availability === "checking"}
                status={usernameStatus}
                autoCapitalize="none"
                hasAutoCorrect={false}
                width="100%"
              />
              <TextInput
                label="GitHub profile"
                type="url"
                value={githubLink}
                onChange={setGithubLink}
                placeholder="https://github.com/your-handle"
                isRequired
                status={
                  githubInvalid
                    ? { type: "error", message: "Use the full address, starting with https://" }
                    : undefined
                }
                width="100%"
              />
              <VStack gap={1}>
                <MarkdownEditor
                  label="Bio"
                  value={profileDescription}
                  onChange={setProfileDescription}
                  isRequired
                />
                {bioMissing && (
                  <Text type="supporting" color="secondary">
                    Add a sentence or two about what you build.
                  </Text>
                )}
              </VStack>

              <HStack hAlign="end">
                <Button label="Save profile" variant="primary" type="submit" isLoading={isSubmitting} />
              </HStack>
            </VStack>
          </form>
        </Card>
      </VStack>
    </Center>
  );
}
