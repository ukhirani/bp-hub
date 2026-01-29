import { useEffect, useState, type FormEvent } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import useToken from "../../hooks/useToken";

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

export default function Login() {
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
