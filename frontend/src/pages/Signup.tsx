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

type SignupSuccessResponse = {
  status: string;
  email?: string;
};

type AuthErrorResponse = {
  error?: {
    message?: string;
  };
};

function mapSignupError(code: string): SnackbarNotice {
  switch (code) {
    case "PASSWORD_MISMATCH":
      return {
        title: "Passwords do not match",
        message: "Make sure both password fields are the same.",
        tone: "warning",
      };
    case "EMAIL_EXISTS":
      return {
        title: "Email already in use",
        message: "Try logging in instead, or use a different email.",
        tone: "warning",
      };
    case "WEAK_PASSWORD":
      return {
        title: "Password too weak",
        message: "Use at least 6 characters with a mix of letters and numbers.",
        tone: "warning",
      };
    default:
      return {
        title: "Unable to create account",
        message: "Please try again. If the issue persists, try later.",
        tone: "error",
      };
  }
}

async function signupUser(credentials: Credentials) {
  const response = await fetch("https://bp-hub-render-service.onrender.com/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = (await response.json().catch(() => ({}))) as
    | SignupSuccessResponse
    | AuthErrorResponse;

  if (!response.ok) {
    const message =
      (data as AuthErrorResponse)?.error?.message ?? "SIGNUP_FAILED";
    throw new Error(message);
  }

  return data as SignupSuccessResponse;
}

export default function Signup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { token } = useToken();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate("/", { replace: true });
    }
  }, [token, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notice, setNotice] = useState<SnackbarNotice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setNotice(null);

    if (password !== confirmPassword) {
      setNotice(mapSignupError("PASSWORD_MISMATCH"));
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signupUser({ email, password });
      if (result.status === "VERIFICATION_EMAIL_SENT") {
        setNotice({
          title: "Verify your email",
          message: `We sent a verification link to ${result.email ?? email}.`,
          tone: "success",
        });
      } else {
        setNotice({
          title: "Signup complete",
          message: "Please check your email for the verification link.",
          tone: "success",
        });
      }
    } catch (err) {
      const code = err instanceof Error ? err.message : "SIGNUP_FAILED";
      setNotice(mapSignupError(code));
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
                <h2 className="text-xl font-bold">Create your account</h2>
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
                <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
                <Input
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  id="confirmPassword"
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
                  Sign up
                </Button>
              </Field>
              <div className="flex flex-col items-center mt-2 gap-1 text-center">
                <FieldDescription>
                  Already have an account? <Link to="/login">Log in</Link>
                </FieldDescription>
              </div>
            </FieldGroup>
          </form>
        </div>
      </div>
    </div>
  );
}
