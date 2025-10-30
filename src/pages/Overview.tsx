import { useEffect, useMemo, useState } from "react";
import { fetchCourses } from "../api/courses";
import { fetchUsers } from "../api/users";
import { fetchCompanies } from "../api/companies";
import { Link } from "react-router-dom";

function MetricCard({ title, value, subtitle, icon }: any) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <div>
          <div className="text-sm text-muted">{title}</div>
          <div className="text-2xl font-bold">{value}</div>
          {subtitle && <div className="text-sm text-muted">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}

function ItemRow({ children, to }: any) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
      <div>{children}</div>
      {to && (
        <Link to={to} className="link">
          View
        </Link>
      )}
    </div>
  );
}

export default function Overview() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [apiStatus, setApiStatus] = useState<string>("checking");

  useEffect(() => {
    let mounted = true;

    async function loadAll() {
      setLoading(true);
      try {
        const [c, u, cmp] = await Promise.allSettled([
          fetchCourses(),
          fetchUsers(),
          fetchCompanies(),
        ]);

        if (!mounted) return;

        if (c.status === "fulfilled") setCourses(c.value ?? []);
        if (u.status === "fulfilled") setUsers(u.value ?? []);
        if (cmp.status === "fulfilled") setCompanies(cmp.value ?? []);

        // simple api status based on courses endpoint
        setApiStatus(c.status === "fulfilled" ? "ok" : "error");
      } catch (err) {
        console.error(err);
        if (mounted) setApiStatus("error");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadAll();
    return () => {
      mounted = false;
    };
  }, []);

  const totals = useMemo(() => {
    const totalCourses = courses.length;
    const published = courses.filter((c) => c.published).length;
    const drafts = totalCourses - published;
    return { totalCourses, published, drafts };
  }, [courses]);

  return (
    <div className="p-6">
      <header className="flex items-start justify-between mt-10 mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Admin Overview</h1>
          <p className="text-sm text-muted mt-1">
            Quick snapshot of courses, users and companies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1 rounded-md font-medium ${
              apiStatus === "ok"
                ? "bg-green-100 text-green-800"
                : apiStatus === "checking"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {apiStatus === "checking"
              ? "Checking API…"
              : apiStatus === "ok"
              ? "API OK"
              : "API Error"}
          </div>
          <Link to="/courses/new" className="comic-button">
            New Course
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Total courses"
          value={loading ? "—" : totals.totalCourses}
          subtitle={`${loading ? "..." : totals.published} published · ${
            loading ? "..." : totals.drafts
          } drafts`}
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 7h18M3 12h18M3 17h18"
                stroke="#0f172a"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />

        <MetricCard
          title="Students"
          value={loading ? "—" : users.length}
          subtitle="Active learners"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 12a4 4 0 100-8 4 4 0 000 8zM6 20v-1a4 4 0 014-4h4a4 4 0 014 4v1"
                stroke="#0f172a"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />

        <MetricCard
          title="Companies"
          value={loading ? "—" : companies.length}
          subtitle="Employers & partners"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="4"
                width="18"
                height="14"
                rx="2"
                stroke="#0f172a"
                strokeWidth="1.5"
              />
            </svg>
          }
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-semibold">Recent Courses</h3>
            <Link to="/courses" className="link">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="text-sm text-muted">Loading courses…</div>
          ) : courses.length === 0 ? (
            <div className="text-sm text-muted">
              No courses yet. Create one with the button above.
            </div>
          ) : (
            <div>
              {courses.slice(0, 6).map((c) => (
                <ItemRow key={c.id} to={`/courses/${c.id}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-surface rounded-md flex items-center justify-center text-sm font-medium">
                      {(c.title || "").charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{c.title}</div>
                      <div className="text-sm text-muted">
                        {c.description?.slice(0, 80) ?? ""}
                      </div>
                    </div>
                  </div>
                </ItemRow>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card p-4">
            <h4 className="font-semibold mb-2">Recent Users</h4>
            {loading ? (
              <div className="text-sm text-muted">Loading users…</div>
            ) : (
              users.slice(0, 5).map((u: any) => (
                <ItemRow key={u.id} to={`/users/${u.id}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-surface rounded-full flex items-center justify-center text-sm">
                      {(u.firstName || "U").charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">
                        {u.firstName} {u.lastName}
                      </div>
                      <div className="text-sm text-muted">{u.email}</div>
                    </div>
                  </div>
                </ItemRow>
              ))
            )}
          </div>

          <div className="card p-4">
            <h4 className="font-semibold mb-2">Companies</h4>
            {loading ? (
              <div className="text-sm text-muted">Loading companies…</div>
            ) : (
              companies.slice(0, 5).map((c: any) => (
                <ItemRow key={c.id} to={`/companies/${c.id}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-surface rounded-md flex items-center justify-center text-sm">
                      {(c.name || "C").charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-sm text-muted">{c.email}</div>
                    </div>
                  </div>
                </ItemRow>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
