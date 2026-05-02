import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function NotFoundPage() {
  return (
    <>
      <Navbar />
      <main className="container auth-wrap">
        <section className="panel auth-card">
          <h1>Page Not Found</h1>
          <p className="muted">The page you are looking for does not exist.</p>
          <Link to="/login" className="btn btn-primary">
            Go to Login
          </Link>
        </section>
      </main>
    </>
  );
}
