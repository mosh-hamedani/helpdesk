import { type FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { signIn, useSession } from "../lib/auth-client";

export default function LoginPage() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isPending) {
    return <div className="loading">Loading...</div>;
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn.email({ email, password });

    if (error) {
      setError(error.message ?? "Login failed");
      setLoading(false);
      return;
    }

    navigate("/", { replace: true });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Helpdesk</h1>
        <p className="login-subtitle">Sign in to your account</p>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            required
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
