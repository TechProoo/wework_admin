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
    <div className="md:p-6 max-w-7xl mx-auto p-3">
      {/* Header */}
      <header className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Welcome back! Here's what's happening with your platform.
            </p>
          </div>

          <button
            onClick={() => newCourse?.open()}
            className="comic-button w-full sm:w-auto justify-center"
          >
            <svg
              className="w-5 h-5 mr-1.5 inline-block"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Course
          </button>
        </div>
      </header>

      {/* Metrics Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-10">
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
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          }
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title="Students"
          value={loading ? "—" : apiTotalUsers ?? users.length}
          subtitle="Active learners"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
          trend={{ value: 8, isPositive: true }}
        />
        <MetricCard
          title="Companies"
          value={loading ? "—" : apiTotalCompanies ?? companies.length}
          subtitle="Employer partners"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          }
          trend={{ value: 3, isPositive: true }}
        />
      </section>

      {/* Content Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Recent Courses */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-base md:text-lg font-bold text-gray-800">
                Recent Courses
              </h3>
            </div>
            <Link
              to="/courses"
              className="text-primary text-sm font-semibold hover:underline flex items-center gap-1"
            >
              View all
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-100 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <EmptyState
              icon={
                <svg
                  className="w-16 h-16 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              }
              title="No courses yet"
              message="Create your first course to get started"
              action={
                <button onClick={() => newCourse?.open()} className="btn mt-3">
                  Create Course
                </button>
              }
            />
          ) : (
            <div className="space-y-2">
              {courses.slice(0, 6).map((c) => (
                <CourseItemRow key={c.id} course={c} />
              ))}
            </div>
          )}
        </Card>

        {/* Users & Companies */}
        <div className="space-y-4 md:space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h4 className="text-base font-bold text-gray-800">
                  Recent Users
                </h4>
              </div>
              <Link
                to="/users"
                className="text-blue-600 text-sm font-semibold hover:underline"
              >
                View all
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-12 bg-gray-100 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <EmptyState
                icon={
                  <svg
                    className="w-12 h-12 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                }
                title="No users"
                message="Users will appear here"
                compact
              />
            ) : (
              <div className="space-y-1">
                {users.slice(0, 5).map((u) => (
                  <UserItemRow key={u.id} user={u} />
                ))}
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h4 className="text-base font-bold text-gray-800">Companies</h4>
              </div>
              <Link
                to="/companies"
                className="text-purple-600 text-sm font-semibold hover:underline"
              >
                View all
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-12 bg-gray-100 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : companies.length === 0 ? (
              <EmptyState
                icon={
                  <svg
                    className="w-12 h-12 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                }
                title="No companies"
                message="Companies will appear here"
                compact
              />
            ) : (
              <div className="space-y-1">
                {companies.slice(0, 5).map((c) => (
                  <CompanyItemRow key={c.id} company={c} />
                ))}
              </div>
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
  trend,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 md:p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide">
            {title}
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-2xl md:text-3xl font-extrabold text-gray-900">
              {value}
            </p>
            {trend && (
              <span
                className={`text-xs font-semibold flex items-center ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                <svg
                  className="w-3 h-3 mr-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d={
                      trend.isPositive
                        ? "M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                        : "M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                    }
                    clipRule="evenodd"
                  />
                </svg>
                {trend.value}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1.5">{subtitle}</p>
          )}
        </div>
        <div className="ml-3 p-2.5 md:p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl text-primary group-hover:scale-110 transition-transform duration-200">
          {icon}
        </div>
      </div>
    </div>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white border border-gray-100 rounded-xl shadow-sm p-4 md:p-5 hover:shadow-md transition-shadow ${className}`}
    >
      {children}
    </div>
  );
}

function CourseItemRow({ course }: { course: any }) {
  const isPublished = course.isPublished || course.published;

  return (
    <Link
      to={`/courses/${course.id}`}
      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
    >
      <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg shadow-sm">
        {course.title ? course.title.charAt(0).toUpperCase() : "C"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold text-gray-900 truncate text-sm md:text-base">
            {course.title}
          </h4>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              isPublished
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {isPublished ? "Published" : "Draft"}
          </span>
        </div>
        <p className="text-xs md:text-sm text-gray-500 truncate mt-0.5">
          {course.description || "No description"}
        </p>
      </div>
      <svg
        className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </Link>
  );
}

function UserItemRow({ user }: { user: any }) {
  return (
    <Link
      to={`/users/${user.id}`}
      className="flex items-center gap-3 p-2.5 hover:bg-blue-50 rounded-lg transition-colors group"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
        {user.firstName ? user.firstName.charAt(0).toUpperCase() : "U"}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate text-sm">
          {user.firstName} {user.lastName}
        </h4>
        <p className="text-xs text-gray-500 truncate">{user.email}</p>
      </div>
      <svg
        className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </Link>
  );
}

function CompanyItemRow({ company }: { company: any }) {
  return (
    <Link
      to={`/companies/${company.id}`}
      className="flex items-center gap-3 p-2.5 hover:bg-purple-50 rounded-lg transition-colors group"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
        {company.name ? company.name.charAt(0).toUpperCase() : "C"}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate text-sm">
          {company.name}
        </h4>
        <p className="text-xs text-gray-500 truncate">
          {company.email || "No email"}
        </p>
      </div>
      <svg
        className="w-4 h-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </Link>
  );
}

function EmptyState({
  icon,
  title,
  message,
  action,
  compact = false,
}: {
  icon?: React.ReactNode;
  title?: string;
  message: string;
  action?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={`text-center ${compact ? "py-6" : "py-8 md:py-12"}`}>
      {icon && <div className="flex justify-center mb-3">{icon}</div>}
      {title && (
        <h3 className="text-sm md:text-base font-semibold text-gray-700 mb-1">
          {title}
        </h3>
      )}
      <p className="text-xs md:text-sm text-gray-500">{message}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
