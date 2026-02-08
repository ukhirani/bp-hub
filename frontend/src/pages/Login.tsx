import "../index.css";

import bpLogo from "@/assets/white.png";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "../components/ui/field";
import { Input } from "@/components/ui/input";
import Snackbar, { type SnackbarNotice } from "@/components/ui/snackbar";

import { useEffect, useState, type FormEvent } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import useToken from "../../hooks/useToken";

type Credentials = {
  email: string;
  password: string;
};

type AuthSuccessResponse = {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
};

type AuthErrorResponse = {
  error?: {
    message?: string;
  };
};

type UserStatusResponse = {
  hasProfile: boolean;
  username?: string;
};

function mapAuthError(code: string): SnackbarNotice {
  switch (code) {
    case "EMAIL_NOT_VERIFIED":
      return {
        title: "Verify your email",
        message:
          "Check your inbox and click the verification link to continue.",
        tone: "warning",
      };
    case "INVALID_LOGIN_CREDENTIALS":
    case "INVALID_PASSWORD":
    case "EMAIL_NOT_FOUND":
      return {
        title: "Incorrect email or password",
        message:
          "Double-check your details and try again. If you forgot your password, reset it.",
        tone: "error",
      };
    case "USER_DISABLED":
      return {
        title: "Account disabled",
        message: "This account is disabled. Contact support to restore access.",
        tone: "error",
      };
    case "TOO_MANY_ATTEMPTS_TRY_LATER":
      return {
        title: "Too many attempts",
        message: "Please wait a few minutes before trying again.",
        tone: "error",
      };
    default:
      return {
        title: "Unable to sign in",
        message: "Please try again. If the issue persists, try later.",
        tone: "error",
      };
  }
}

async function loginUser(credentials: Credentials) {
  const response = await fetch("http://localhost:8080/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = (await response.json().catch(() => ({}))) as
    | AuthSuccessResponse
    | AuthErrorResponse;

  if (!response.ok) {
    const message =
      (data as AuthErrorResponse)?.error?.message ?? "LOGIN_FAILED";
    throw new Error(message);
  }

  return data as AuthSuccessResponse;
}

async function fetchUserStatus(idToken: string) {
  const response = await fetch("http://localhost:8080/userStatus", {
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

export default function Login({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { token, setToken } = useToken();
  const navigate = useNavigate();

  // If the user is already authenticated, send them to the landing page.
  useEffect(() => {
    if (token) {
      navigate("/", { replace: true });
    }
  }, [token, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState<SnackbarNotice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setNotice(null);
    setIsSubmitting(true);

    try {
      const auth = await loginUser({ email, password });
      setToken({ token: auth.idToken });
      const status = await fetchUserStatus(auth.idToken);
      if (!status.hasProfile) {
        navigate("/onboarding", { replace: true });
        return;
      }

      const username = status.username ?? auth.email?.split("@")[0] ?? "there";
      sessionStorage.setItem(
        "app_notice",
        JSON.stringify({
          title: `Welcome back, ${username}`,
          message: "You are signed in and ready to go.",
          tone: "success",
        }),
      );
      navigate("/", { replace: true });
    } catch (err) {
      const code = err instanceof Error ? err.message : "LOGIN_FAILED";
      setNotice(mapAuthError(code));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <Snackbar notice={notice} onClose={() => setNotice(null)} />
      <div className="w-full max-w-sm">
        <div className={cn("flex flex-col gap-3", className)} {...props}>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-1 text-center">
                <a
                  href="#"
                  className="flex flex-col items-center gap-1 font-medium"
                >
                  <div className="flex  items-center justify-center rounded-md">
                    <img className="bp-logo" src={bpLogo} alt="" />
                  </div>
                  <span className="sr-only">Boilerplate</span>
                </a>
                <h2 className="text-xl font-bold">Welcome to Boilerplate</h2>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  onChange={(e) => setEmail(e.target.value)}
                  id="email"
                  type="email"
                  placeholder="umang@boilerplate.com"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  onChange={(e) => setPassword(e.target.value)}
                  id="password"
                  type="password"
                  placeholder="•••••••••••••••••"
                  required
                />
              </Field>

              <Field>
                <Button
                  className="mt-2"
                  variant="default"
                  type="submit"
                  disabled={isSubmitting}
                >
                  Login
                </Button>
              </Field>
              <div className="flex flex-col items-center mt-2 gap-1 text-center">
                <FieldDescription>
                  Don&apos;t have an account? <Link to="/signup">Sign up</Link>
                </FieldDescription>
              </div>
            </FieldGroup>
          </form>
        </div>
      </div>
    </div>
  );
}
