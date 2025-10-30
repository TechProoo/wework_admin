import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function AdminNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const links = [
    ["/", "Overview"],
    ["/courses", "Courses"],
    ["/users", "Users"],
    ["/companies", "Companies"],
  ];

  return (
    <header className="admin-navbar">
      <div className="admin-navbar-inner">
        <div className="left">
          <Link to="/" className="brand">
            <span className="brand-main">WEWORK</span>
            <span className="brand-sub">Admin</span>
          </Link>

          <button
            className="hamburger md-hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((s) => !s)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="#3c4d42"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <nav className={"nav-links md-visible"} aria-label="Primary">
            {links.map(([to, label]) => (
              <Link key={String(to)} to={String(to)} className="nav-link">
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="right">
          <div className="search-wrap md-visible">
            <input
              className="search-input"
              placeholder="Search courses, users…"
            />
          </div>

          <button
            className="comic-button"
            onClick={() => setMenuOpen((s) => !s)}
            aria-haspopup
          >
            +
          </button>

          <div className="avatar-wrap" ref={menuRef}>
            <button
              className="avatar-button"
              onClick={() => setMenuOpen((s) => !s)}
              aria-expanded={menuOpen}
            >
              <div className="avatar">A</div>
            </button>
            {menuOpen && (
              <div className="avatar-menu card">
                <Link to="/" className="menu-item">
                  Profile
                </Link>
                <button className="menu-item">Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile overlay menu */}
      <div
        className={`mobile-menu ${mobileOpen ? "open" : ""}`}
        role="dialog"
        aria-modal={mobileOpen}
      >
        <div className="mobile-menu-inner card">
          <div className="mobile-links">
            {links.map(([to, label]) => (
              <Link
                key={String(to)}
                to={String(to)}
                className="mobile-link"
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="mobile-actions">
            <button className="btn">New Course</button>
          </div>
        </div>
      </div>
    </header>
  );
}
