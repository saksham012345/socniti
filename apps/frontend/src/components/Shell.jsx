import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/events", label: "Events" },
  { to: "/donations", label: "Donations" },
  { to: "/contact", label: "Contact" }
];

export default function Shell({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-ink/10 bg-mist/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <NavLink to="/" className="font-display text-2xl font-bold text-ink">
            SOCNITI
          </NavLink>
          <nav className="hidden gap-6 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-semibold ${isActive ? "text-ink" : "text-ink/60"}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <NavLink
                  to={user.role === "organizer" ? "/organizer" : "/dashboard"}
                  className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
                >
                  Dashboard
                </NavLink>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold text-ink"
                >
                  Logout
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
              >
                Login
              </NavLink>
            )}
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
