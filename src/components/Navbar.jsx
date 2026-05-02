import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { authUser, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const dashboardPath = profile ? `/${profile.role}` : "/login";

  return (
    <header className="nav-shell">
      <nav className="nav container">
        <Link to={dashboardPath} className="brand">
          BookEase
        </Link>

        <div className="nav-links">
          {authUser && (
            <>
              <NavLink to={dashboardPath}>Dashboard</NavLink>
              {profile?.role === "patient" && <NavLink to="/doctors">Doctors</NavLink>}
              {profile?.role === "patient" && <NavLink to="/appointments">My Bookings</NavLink>}
            </>
          )}
        </div>

        <div className="nav-actions">
          {authUser ? (
            <button className="btn btn-danger" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <>
              <Link className="btn btn-ghost" to="/login">
                Login
              </Link>
              <Link className="btn btn-primary" to="/register">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
