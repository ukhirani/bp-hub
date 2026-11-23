import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { VStack } from "@astryxdesign/core/Stack";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Button } from "@astryxdesign/core/Button";
import { Banner } from "@astryxdesign/core/Banner";
import { Text } from "@astryxdesign/core/Text";
import { Link } from "@astryxdesign/core/Link";

import AuthFrame from "@/components/AuthFrame";
import { useAuth } from "@/context/AuthContext";
import { postJSON } from "@/lib/api";

type SignupSuccessResponse = {
  status: string;
  email?: string;
};

type Problem = { title: string; message: string; status: "warning" | "error" };

function mapSignupError(code: string): Problem {
  switch (code) {
    case "EMAIL_EXISTS":
      return {
        title: "That email already has an account",
        message: "Sign in instead, or use a different email.",
        status: "warning",
      };
    case "WEAK_PASSWORD":
      return {
        title: "Choose a stronger password",
        message: "Use at least 6 characters with letters and numbers.",
        status: "warning",
      };
    default:
      return {
        title: "Couldn't create your account",
        message: "Something went wrong on our side. Try again in a moment.",
        status: "error",
      };
  }
}

export default function Signup() {
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) navigate("/home", { replace: true });
  }, [token, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [problem, setProblem] = useState<Problem | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProblem(null);
    if (password !== confirmPassword) return;

    setIsSubmitting(true);
    try {
      const result = await postJSON<SignupSuccessResponse>(
        "/signup",
        { email, password },
        "SIGNUP_FAILED",
      );
      setSentTo(result.email ?? email);
    } catch (err) {
      setProblem(mapSignupError(err instanceof Error ? err.message : "SIGNUP_FAILED"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sentTo) {
    return (
      <AuthFrame
        title="Check your inbox"
        description={`We sent a verification link to ${sentTo}. Open it, then sign in.`}
      >
        <Button label="Go to sign in" variant="primary" size="lg" href="/login" width="100%" />
      </AuthFrame>
    );
  }

  return (
    <AuthFrame
      title="Create your account"
      description="Publish your templates and clone anyone's."
      footer={
        <Text type="supporting" color="secondary">
          Already have an account? <Link href="/login" type="supporting">Sign in</Link>
        </Text>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <VStack gap={4}>
          {problem && (
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
            autoComplete="new-password"
            description="At least 6 characters."
            value={password}
            onChange={setPassword}
            size="lg"
            isRequired
            width="100%"
          />
          <TextInput
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            size="lg"
            isRequired
            width="100%"
            status={mismatch ? { type: "error", message: "Passwords don't match." } : undefined}
          />
          <Button
            label="Create account"
            variant="primary"
            size="lg"
            type="submit"
            isLoading={isSubmitting}
            isDisabled={!email || !password || !confirmPassword || mismatch}
            width="100%"
          />
        </VStack>
      </form>
    </AuthFrame>
  );
}
