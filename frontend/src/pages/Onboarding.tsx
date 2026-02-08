import "../index.css";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { RandomAvatar } from "react-random-avatars";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "../components/ui/field";
import MarkdownEditor from "@/components/ui/markdown-editor";
import Snackbar, { type SnackbarNotice } from "@/components/ui/snackbar";

import useToken from "../../hooks/useToken";

type AuthErrorResponse = {
  error?: {
    message?: string;
  };
};

type UsernameCheckResponse = {
  available: boolean;
  username: string;
};

type UserStatusResponse = {
  hasProfile: boolean;
  username?: string;
};

const usernameRegex = /^[a-z0-9_-]{3,24}$/;

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

async function checkUsername(idToken: string, username: string) {
  const response = await fetch("https://bp-hub-render-service.onrender.com/checkUsername", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken, username }),
  });

  const data = (await response.json().catch(() => ({}))) as
    | UsernameCheckResponse
    | AuthErrorResponse;

  if (!response.ok) {
    const message =
      (data as AuthErrorResponse)?.error?.message ?? "USERNAME_CHECK_FAILED";
    throw new Error(message);
  }

  return data as UsernameCheckResponse;
}

async function fetchUserStatus(idToken: string) {
  const response = await fetch("https://bp-hub-render-service.onrender.com/userStatus", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken }),
  });

  const data = (await response.json().catch(() => ({}))) as
    | UserStatusResponse
    | AuthErrorResponse;

  if (!response.ok) {
    const message =
      (data as AuthErrorResponse)?.error?.message ?? "USER_STATUS_FAILED";
    throw new Error(message);
  }

  return data as UserStatusResponse;
}

async function registerUserDetails(
  idToken: string,
  username: string,
  githubLink: string,
  profileDescription: string,
) {
  const response = await fetch("https://bp-hub-render-service.onrender.com/registerUserDetails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      idToken,
      username,
      github_link: githubLink,
      profile_description: profileDescription,
    }),
  });

  const data = (await response.json().catch(() => ({}))) as
    | UsernameCheckResponse
    | AuthErrorResponse;

  if (!response.ok) {
    const message =
      (data as AuthErrorResponse)?.error?.message ?? "USER_REGISTER_FAILED";
    throw new Error(message);
  }

  return data as UsernameCheckResponse;
}

export default function Onboarding() {
  const { token } = useToken();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [profileDescription, setProfileDescription] = useState("");
  const [checking, setChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availability, setAvailability] = useState<
    "idle" | "valid" | "invalid" | "checking" | "available" | "taken"
  >("idle");
  const [notice, setNotice] = useState<SnackbarNotice | null>(null);

  const normalizedUsername = useMemo(() => normalizeUsername(username), [username]);
  const isUsernameValid = usernameRegex.test(normalizedUsername);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    fetchUserStatus(token)
      .then((status) => {
        if (status.hasProfile) {
          navigate("/", { replace: true });
        }
      })
      .catch(() => {
        setNotice({
          title: "Unable to verify account",
          message: "Please sign in again.",
          tone: "error",
        });
      });
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;

    if (!normalizedUsername) {
      setAvailability("idle");
      return;
    }

    if (!isUsernameValid) {
      setAvailability("invalid");
      return;
    }

    setAvailability("checking");
    setChecking(true);

    const timeout = window.setTimeout(() => {
      checkUsername(token, normalizedUsername)
        .then((result) => {
          setAvailability(result.available ? "available" : "taken");
        })
        .catch(() => {
          setAvailability("valid");
        })
        .finally(() => setChecking(false));
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [token, normalizedUsername, isUsernameValid]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setNotice(null);

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    if (!isUsernameValid) {
      setNotice({
        title: "Username not valid",
        message: "Use 3-24 characters, letters, numbers, underscore, or dash.",
        tone: "warning",
      });
      return;
    }

    if (availability === "taken") {
      setNotice({
        title: "Username already taken",
        message: "Try another username.",
        tone: "warning",
      });
      return;
    }

    if (!githubLink || !githubLink.startsWith("http")) {
      setNotice({
        title: "Add a valid GitHub link",
        message: "Include https://github.com/your-handle.",
        tone: "warning",
      });
      return;
    }

    if (!profileDescription.trim()) {
      setNotice({
        title: "Profile description required",
        message: "Add a short bio in markdown.",
        tone: "warning",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await registerUserDetails(
        token,
        normalizedUsername,
        githubLink,
        profileDescription,
      );

      sessionStorage.setItem(
        "app_notice",
        JSON.stringify({
          title: `Welcome, ${result.username}`,
          message: "Your profile is ready.",
          tone: "success",
        }),
      );
      navigate("/", { replace: true });
    } catch (err) {
      const code = err instanceof Error ? err.message : "USER_REGISTER_FAILED";
      const message =
        code === "USERNAME_TAKEN"
          ? "That username is already taken."
          : code === "USER_ALREADY_REGISTERED"
            ? "Your profile already exists."
            : "Something went wrong. Please try again.";
      setNotice({
        title: "Unable to create profile",
        message,
        tone: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white">
      <Snackbar notice={notice} onClose={() => setNotice(null)} />
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-6 py-12">
        <div className="w-full rounded-2xl border border-gray-800 bg-[#0f1117] p-8 shadow-2xl">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-semibold">Welcome to Boilerplate</h1>
              <p className="text-sm text-gray-400">
                Tell us a little about yourself to personalize your workspace.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-full border border-gray-800 bg-[#0a0b0f] p-2">
                <RandomAvatar
                  key={normalizedUsername || "bp-user"}
                  name={normalizedUsername || "bp-user"}
                  size={56}
                />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-200">
                  Your new identity
                </div>
                <div className="text-xs text-gray-500">
                  Avatar updates as you type your username.
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="username">Username</FieldLabel>
                  <Input
                    id="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="umang-hirani"
                    required
                  />
                  <FieldDescription
                    className={
                      availability === "available"
                        ? "text-emerald-400"
                        : availability === "taken" || availability === "invalid"
                          ? "text-amber-400"
                          : ""
                    }
                  >
                    {availability === "invalid" &&
                      "Use 3-24 characters with letters, numbers, underscore, or dash."}
                    {availability === "checking" && "Checking availability..."}
                    {availability === "available" && "Username available."}
                    {availability === "taken" && "That username is taken."}
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="github">GitHub link</FieldLabel>
                  <Input
                    id="github"
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

                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-gray-500">
                    {checking ? "Validating username" : ""}
                  </div>
                  <Button type="submit" disabled={isSubmitting}>
                    Save profile
                  </Button>
                </div>
              </FieldGroup>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
