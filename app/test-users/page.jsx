"use client";

import { useState, useEffect } from "react";

export default function UsersTestPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/users?page=${page}&limit=5`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch users");
      }

      if (result.success) {
        setUsers(result.data.users);
        setPagination(result.data.pagination);
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      const response = await fetch("/api/users", { method: "HEAD" });
      const status = response.headers.get("X-Database-Status");
      alert(
        `Database Status: ${
          status || (response.ok ? "connected" : "disconnected")
        }`
      );
    } catch (error) {
      alert("Connection test failed: " + error.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Users API Test
          </h1>
          <div className="flex gap-2">
            <button
              onClick={testConnection}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Test Connection
            </button>
            <button
              onClick={() => fetchUsers()}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded">
            <h3 className="font-semibold">Error:</h3>
            <p>{error}</p>
            {error.includes("Database connection") && (
              <div className="mt-2 text-sm">
                <p className="font-semibold">Troubleshooting:</p>
                <ul className="list-disc ml-5">
                  <li>Check if your IP is whitelisted in MongoDB Atlas</li>
                  <li>Verify your cluster is running (not paused)</li>
                  <li>Check your network connection</li>
                  <li>Verify DATABASE_URL in environment variables</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Loading users...
            </p>
          </div>
        )}

        {!loading && !error && users.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No users found. Database might be empty or connection failed.</p>
          </div>
        )}

        {!loading && users.length > 0 && (
          <>
            <div className="grid gap-4 mb-6">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700"
                >
                  <div className="flex items-center gap-4">
                    {user.image && (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {user.name || "No name"}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {user.email}
                      </p>
                      <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span>Role: {user.role}</span>
                        <span>
                          Enrollments: {user._count?.enrollments || 0}
                        </span>
                        <span>Reviews: {user._count?.reviews || 0}</span>
                      </div>
                    </div>
                  </div>
                  {user.bio && (
                    <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                      {user.bio}
                    </p>
                  )}
                  {user.expertise && user.expertise.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {user.expertise.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={() => fetchUsers(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage || loading}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  Previous
                </button>
                <span className="text-gray-600 dark:text-gray-400">
                  Page {pagination.currentPage} of {pagination.totalPages} (
                  {pagination.totalCount} total)
                </span>
                <button
                  onClick={() => fetchUsers(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage || loading}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* API Examples */}
        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
            API Examples:
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <div>
              <code>GET /api/users</code> - Get all users
            </div>
            <div>
              <code>GET /api/users?page=1&limit=10</code> - Paginated users
            </div>
            <div>
              <code>GET /api/users?search=john</code> - Search users
            </div>
            <div>
              <code>GET /api/users?role=admin</code> - Filter by role
            </div>
            <div>
              <code>HEAD /api/users</code> - Test connection
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
