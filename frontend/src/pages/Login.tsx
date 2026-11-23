import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { VStack } from "@astryxdesign/core/Stack";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Button } from "@astryxdesign/core/Button";
import { Banner } from "@astryxdesign/core/Banner";
import { Text } from "@astryxdesign/core/Text";
import { Link } from "@astryxdesign/core/Link";

import AuthFrame from "@/components/AuthFrame";
import { useAuth } from "@/context/auth-context";
import { fetchUserStatus, postJSON } from "@/lib/api";

type AuthSuccessResponse = {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
};

type Problem = {
  title: string;
  message: string;
  status: "warning" | "error";
  field?: "email" | "password";
};

function mapAuthError(code: string): Problem {
  switch (code) {
    case "EMAIL_NOT_VERIFIED":
      return {
        title: "Verify your email first",
        message: "Open the verification link we sent you, then sign in again.",
        status: "warning",
      };
    case "INVALID_LOGIN_CREDENTIALS":
    case "INVALID_PASSWORD":
    case "EMAIL_NOT_FOUND":
      return {
        title: "Incorrect email or password",
        message: "Check both and try again.",
        status: "error",
        field: "password",
      };
    case "USER_DISABLED":
      return {
        title: "This account is disabled",
        message: "Contact support to restore access.",
        status: "error",
      };
    case "TOO_MANY_ATTEMPTS_TRY_LATER":
      return {
        title: "Too many attempts",
        message: "Wait a few minutes before trying again.",
        status: "error",
      };
    default:
      return {
        title: "Couldn't sign you in",
        message: "Something went wrong on our side. Try again in a moment.",
        status: "error",
      };
  }
}

export default function Login() {
  const { token, setToken, setUsername: setAuthUsername } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [problem, setProblem] = useState<Problem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Already signed in: go straight to the registry.
  useEffect(() => {
    if (token) navigate("/home", { replace: true });
  }, [token, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProblem(null);
    setIsSubmitting(true);

    try {
      const auth = await postJSON<AuthSuccessResponse>(
        "/login",
        { email, password },
        "LOGIN_FAILED",
      );
      setToken({ token: auth.idToken, refreshToken: auth.refreshToken });
      const status = await fetchUserStatus(auth.idToken);
      if (!status.hasProfile) {
        navigate("/onboarding", { replace: true });
        return;
      }

      const username = status.username ?? auth.email?.split("@")[0] ?? "there";
      setAuthUsername(username);
      sessionStorage.setItem(
        "app_notice",
        JSON.stringify({
          title: `Welcome back, ${username}`,
          message: "You're signed in.",
          tone: "success",
        }),
      );
      navigate("/home", { replace: true });
    } catch (err) {
      setProblem(mapAuthError(err instanceof Error ? err.message : "LOGIN_FAILED"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthFrame
      title="Sign in to BP Hub"
      description="Browse, publish and clone templates."
      footer={
        <Text type="supporting" color="secondary">
          New here? <Link href="/signup" type="supporting">Create an account</Link>
        </Text>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <VStack gap={4}>
          {problem && !problem.field && (
            <Banner status={problem.status} title={problem.title} description={problem.message} />
          )}
          <TextInput
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            size="lg"
            isRequired
            width="100%"
          />
          <TextInput
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(v) => {
              setPassword(v);
              if (problem?.field) setProblem(null);
            }}
            size="lg"
            isRequired
            width="100%"
            status={
              problem?.field === "password"
                ? { type: "error", message: `${problem.title}. ${problem.message}` }
                : undefined
            }
          />
          <Button
            label="Sign in"
            variant="primary"
            size="lg"
            type="submit"
            isLoading={isSubmitting}
            isDisabled={!email || !password}
            width="100%"
          />
        </VStack>
      </form>
    </AuthFrame>
  );
}
