import { Link } from "react-router-dom";

export default function AdminFooter() {
  return (
    <footer className="w-full bg-[#f4f2f3] bottom  border-t border-[#64766a] mt-12 text-[#3c4d42]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-lg">WEWORK Admin</span>
          <span className="px-2 py-1 rounded-full bg-[#64766a] text-white text-xs font-bold">
            Dashboard
          </span>
        </div>
        <div className="flex gap-4">
          <Link to="/" className="muted">
            Home
          </Link>
          <Link to="/courses" className="muted">
            Courses
          </Link>
          <Link to="/contact" className="muted">
            Contact
          </Link>
        </div>
        <div className="text-sm muted">
          © {new Date().getFullYear()} WeWork — Admin
        </div>
      </div>
    </footer>
  );
}
