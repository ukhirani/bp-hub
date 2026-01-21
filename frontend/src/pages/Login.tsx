import { useState, type ChangeEvent, type FormEvent } from "react";
import "./Login.css";
type LoginProps = {
  setToken: (token: string) => void;
};

type Credentials = {
  username: string;
  password: string;
};

async function loginUser(credentials: Credentials) {
  return fetch("http://localhost:8080/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  }).then((data) => data.json());
}

export default function Login({ setToken }: LoginProps) {
  const [username, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = await loginUser({
      username,
      password,
    });
    setToken(token);
  };
  return (
    <div className="login-wrapper">
      <h1>Please Log In</h1>
      <form onSubmit={handleSubmit}>
        <label>
          <p>Username</p>
          <input type="text" onChange={(e) => setUserName(e.target.value)} />
        </label>

        <label>
          <p>Password</p>
          <input
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <div>
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
}
