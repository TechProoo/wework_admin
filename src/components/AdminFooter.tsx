import { Link } from "react-router-dom";

export default function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{width: "cover"}} className=" sticky bottom-0 left-0 right-0 bg-[#f4f2f3] border-t border-[#64766a] text-[#3c4d42] py-6 z-50">
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 px-6 md:px-8 lg:px-12">
        {/* Left Section */}
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-lg tracking-tight">
            WEWORK Admin
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#64766a] text-white text-xs font-semibold">
            Dashboard
          </span>
        </div>

        {/* Middle Section (Navigation) */}
        <nav className="flex gap-5 text-sm font-medium">
          {[
            { to: "/", label: "Home" },
            { to: "/courses", label: "Courses" },
            { to: "/contact", label: "Contact" },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="transition-colors text-[#3c4d42] hover:text-[#64766a] focus:text-[#64766a] outline-none"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="text-xs text-[#64766a]">
          © {currentYear} WeWork — Admin Panel
        </div>
      </div>
    </footer>
  );
}
