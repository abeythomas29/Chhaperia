import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [identity, setIdentity] = useState("manager1");
  const [password, setPassword] = useState("manager123");
  const [error, setError] = useState("");
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", { identity, password });
      if (!["ADMIN", "SUPER_ADMIN"].includes(data.user.role)) {
        setError("Only admin users can access this panel.");
        return;
      }
      setAuth(data.token, data.user);
      navigate("/dashboard");
    } catch {
      setError("Invalid credentials");
    }
  }

  return (
    <div className="centered login-screen">
      <form onSubmit={onSubmit} className="card login-card">
        <h2>Chhaperia Cables</h2>
        <p>Admin sign-in for internal production tracking</p>

        <label htmlFor="identity">Username or Employee ID</label>
        <input
          id="identity"
          value={identity}
          onChange={(e) => setIdentity(e.target.value)}
          placeholder="manager1"
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
        />

        {error && <p className="error">{error}</p>}
        <button className="primary" type="submit">Login</button>
      </form>
    </div>
  );
}
