import { useEffect, useState } from "react";
import { fetchUsers } from "../api/users";
import { Link } from "react-router-dom";

export default function UsersList() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers()
      .then((data) => {
        console.log("Fetched users:", data); // Debug log
        // Show all users for now - can filter later if needed
        setUsers(data || []);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setUsers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter users based on search
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-3 ">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-6 md:mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center">
                <svg
                  className="w-6 h-6 md:w-7 md:h-7 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                  Users Management
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Manage and view all registered users
                </p>
              </div>
            </div>

            <Link
              to="/users/new"
              className="w-full md:w-auto px-4 md:px-6 py-2 md:py-3 bg-linear-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add New Student
            </Link>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 md:p-4">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center">
            {/* Search Input */}
            <div className="flex-1 relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm md:text-base"
              />
            </div>

            {/* Users Count */}
            <div className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-linear-to-r from-primary to-accent text-white rounded-lg text-sm font-semibold">
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span>
                {filteredUsers.length}{" "}
                {filteredUsers.length === 1 ? "user" : "users"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          /* Loading Skeleton */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6"
              >
                <div className="animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 bg-linear-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 md:w-10 md:h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                {searchQuery ? "No users found" : "No users yet"}
              </h3>
              <p className="text-sm md:text-base text-gray-500 mb-6">
                {searchQuery
                  ? "Try adjusting your search criteria"
                  : "Get started by adding your first user"}
              </p>
              {!searchQuery && (
                <Link
                  to="/users/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add First Student
                </Link>
              )}
            </div>
          </div>
        ) : (
          /* Users Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden group"
              >
                <div className="p-4 md:p-6">
                  {/* User Avatar and Info */}
                  <div className="flex items-start gap-3 md:gap-4 mb-4">
                    <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg md:text-xl">
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base md:text-lg truncate">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-500 truncate">
                        {user.email}
                      </p>
                      {user.role && (
                        <span
                          className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-semibold ${
                            user.role === "ADMIN"
                              ? "bg-purple-100 text-purple-700"
                              : user.role === "COMPANY"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* User Stats */}
                  {user.role === "STUDENT" && (
                    <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg md:text-xl font-bold text-gray-900">
                          {user._count?.enrollments || 0}
                        </div>
                        <div className="text-xs text-gray-500">Courses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg md:text-xl font-bold text-gray-900">
                          {user._count?.progress || 0}
                        </div>
                        <div className="text-xs text-gray-500">Progress</div>
                      </div>
                    </div>
                  )}

                  {user.role === "COMPANY" && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-600 font-medium">
                          Company Account
                        </span>
                        <div className="text-lg font-bold text-blue-700">
                          {user._count?.employees || 0} employees
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Link
                    to={`/users/${user.id}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all text-sm group-hover:border-primary group-hover:text-primary"
                  >
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
