import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useNewCourse } from "../contexts/NewCourseContext";
import { getTotalCourses, fetchCourses } from "../api/courses";
import { getTotalUsers, fetchUsers } from "../api/users";
import { getTotalCompanies, fetchCompanies } from "../api/companies";

export default function Overview() {
  const [loading, setLoading] = useState(true);
  // recent lists (left empty by default; fetching full lists is optional)
  const [courses, setCourses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  // totals from API
  const [apiTotalCourses, setApiTotalCourses] = useState<number | null>(null);
  const [apiTotalUsers, setApiTotalUsers] = useState<number | null>(null);
  const [apiTotalCompanies, setApiTotalCompanies] = useState<number | null>(
    null
  );
  const [, setApiStatus] = useState<"checking" | "ok" | "error">("checking");

  const newCourse = (() => {
    try {
      return useNewCourse();
    } catch {
      return null;
    }
  })();

  // 🧠 Fetch data
  useEffect(() => {
    let mounted = true;

    const loadTotals = async () => {
      setLoading(true);
      try {
        // fetch totals and recent lists in parallel
        const [
          coursesCountRes,
          usersCountRes,
          companiesCountRes,
          coursesRes,
          usersRes,
          companiesRes,
        ] = await Promise.all([
          getTotalCourses().catch((e) => {
            console.error("getTotalCourses failed", e);
            return null;
          }),
          getTotalUsers().catch((e) => {
            console.error("getTotalUsers failed", e);
            return null;
          }),
          getTotalCompanies().catch((e) => {
            console.error("getTotalCompanies failed", e);
            return null;
          }),
          fetchCourses().catch((e) => {
            console.error("fetchCourses failed", e);
            return [] as any[];
          }),
          fetchUsers().catch((e) => {
            console.error("fetchUsers failed", e);
            return [] as any[];
          }),
          fetchCompanies().catch((e) => {
            console.error("fetchCompanies failed", e);
            return [] as any[];
          }),
        ]);

        if (!mounted) return;

        if (coursesCountRes != null)
          setApiTotalCourses(coursesCountRes as number);
        if (usersCountRes != null) setApiTotalUsers(usersCountRes as number);
        if (companiesCountRes != null)
          setApiTotalCompanies(companiesCountRes as number);

        // set recent lists
        setCourses((coursesRes as any[]) ?? []);
        setUsers((usersRes as any[]) ?? []);
        setCompanies((companiesRes as any[]) ?? []);

        // We only check one result for api health here — courses count
        setApiStatus(coursesCountRes != null ? "ok" : "error");
      } catch (err) {
        console.error(err);
        if (mounted) setApiStatus("error");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadTotals();
    return () => {
      mounted = false;
    };
  }, []);

  const totals = useMemo(() => {
    const totalCourses = apiTotalCourses ?? courses.length;
    const published = courses.filter((c) => c.published).length;
    return {
      totalCourses,
      published,
      drafts: Number(totalCourses) - published,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses, apiTotalCourses]);

  return (
    <div className="p-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your platform content, users, and partners.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => newCourse?.open()}
            className="px-4 py-2 bg-primary text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            + New Course
          </button>
        </div>
      </header>

      {/* Metrics Section */}
      <section className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <MetricCard
          title="Total Courses"
          value={loading ? "—" : apiTotalCourses ?? totals.totalCourses}
          subtitle={
            loading
              ? "Loading..."
              : `${totals.published} published · ${totals.drafts} drafts`
          }
          icon={
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M3 7h18M3 12h18M3 17h18" strokeLinecap="round" />
            </svg>
          }
        />
        <MetricCard
          title="Students"
          value={loading ? "—" : apiTotalUsers ?? users.length}
          subtitle="Active learners"
          icon={
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                d="M12 12a4 4 0 100-8 4 4 0 000 8zM6 20v-1a4 4 0 014-4h4a4 4 0 014 4v1"
                strokeLinecap="round"
              />
            </svg>
          }
        />
        <MetricCard
          title="Companies"
          value={loading ? "—" : apiTotalCompanies ?? companies.length}
          subtitle="Employers & partners"
          icon={
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="4" width="18" height="14" rx="2" />
            </svg>
          }
        />
      </section>

      {/* Content Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Courses */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Recent Courses
            </h3>
            <Link
              to="/courses"
              className="text-primary text-sm font-medium hover:underline"
            >
              View all
            </Link>
          </div>
          {loading ? (
            <EmptyState message="Loading courses…" />
          ) : courses.length === 0 ? (
            <EmptyState message="No courses yet. Create one using the button above." />
          ) : (
            <ul>
              {courses.slice(0, 6).map((c) => (
                <ItemRow
                  key={c.id}
                  title={c.title}
                  subtitle={c.description}
                  to={`/courses/${c.id}`}
                />
              ))}
            </ul>
          )}
        </Card>

        {/* Users & Companies */}
        <div className="space-y-6">
          <Card title="Recent Users">
            {loading ? (
              <EmptyState message="Loading users…" />
            ) : (
              users
                .slice(0, 5)
                .map((u) => (
                  <ItemRow
                    key={u.id}
                    title={`${u.firstName} ${u.lastName}`}
                    subtitle={u.email}
                    to={`/users/${u.id}`}
                  />
                ))
            )}
          </Card>

          <Card title="Companies">
            {loading ? (
              <EmptyState message="Loading companies…" />
            ) : (
              companies
                .slice(0, 5)
                .map((c) => (
                  <ItemRow
                    key={c.id}
                    title={c.name}
                    subtitle={c.email}
                    to={`/companies/${c.id}`}
                  />
                ))
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}

/* --- Components --- */

function MetricCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-white/70 backdrop-blur-md border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-3xl font-semibold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl text-primary">
        {icon}
      </div>
    </div>
  );
}

function Card({
  children,
  title,
  className = "",
}: {
  children: React.ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm p-5 ${className}`}
    >
      {title && (
        <h4 className="text-lg font-semibold mb-3 text-gray-800">{title}</h4>
      )}
      {children}
    </div>
  );
}

function ItemRow({
  title,
  subtitle,
  to,
}: {
  title: string;
  subtitle?: string;
  to?: string;
}) {
  return (
    <Link
      to={to || "#"}
      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-md transition-colors px-2"
    >
      <div>
        <div className="font-medium text-gray-800">{title}</div>
        {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
      </div>
      <span className="text-primary text-sm font-medium">View</span>
    </Link>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="text-sm text-gray-500 italic">{message}</p>;
}
