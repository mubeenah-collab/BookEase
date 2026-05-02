import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebase";

export default function LoginPage() {
  const { login, authUser, profile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authUser && profile) {
      navigate(`/${profile.role}`);
    }
  }, [authUser, profile, navigate]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(form.email, form.password);
      const snapshot = await getDoc(doc(db, "users", user.uid));
      const userProfile = snapshot.data();
      navigate(`/${userProfile?.role || "patient"}`);
    } catch (err) {
      setError(err.message || "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="container auth-wrap login-shell">
        <section className="login-hero panel">
          <p className="login-kicker">Clinic Booking Simplified</p>
          <h1>Welcome Back to BookEase</h1>
          <p className="muted">
            Access your dashboard to book appointments, manage slots, and stay on top of your care.
          </p>

          <div className="login-feature-grid">
            <article className="login-feature-card">
              <h3>Smart Scheduling</h3>
              <p className="small-text muted">Pick available time slots instantly with real-time updates.</p>
            </article>
            <article className="login-feature-card">
              <h3>Role Dashboards</h3>
              <p className="small-text muted">Separate views for patients, doctors, and admins.</p>
            </article>
          </div>
        </section>

        <section className="panel auth-card login-card">
          <div>
            <p className="login-kicker">Secure Access</p>
            <h2 className="login-title">Sign In</h2>
            <p className="muted">Use your account credentials to continue.</p>
          </div>

          <form className="form login-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={onChange}
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={onChange}
              required
            />

            {error && <p className="error">{error}</p>}

            <button className="btn btn-primary login-submit" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="small-text">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </section>
      </main>
    </>
  );
}
