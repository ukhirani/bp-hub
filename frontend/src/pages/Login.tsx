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

import { useEffect, useState, type FormEvent } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import useToken from "../../hooks/useToken";

type Credentials = {
  username: string;
  password: string;
};

async function loginUser(credentials: Credentials) {
  return fetch("https://bp-hub-render-service.onrender.com/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  }).then((data) => data.json());
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

  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = await loginUser({ username, password });
    setToken(token);

    navigate("/", { replace: true });
  };

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className={cn("flex flex-col gap-5", className)} {...props}>
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
                <FieldDescription>
                  Don&apos;t have an account? <a href="#">Sign up</a>
                </FieldDescription>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  onChange={(e) => setUserName(e.target.value)}
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
                <Button variant="default" type="submit">
                  Login
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </div>
      </div>
    </div>
  );
}
