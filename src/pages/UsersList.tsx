import { useEffect, useState } from "react";
import { fetchUsers } from "../api/users";
import { Link } from "react-router-dom";

export default function UsersList() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers()
      .then((data) => setUsers(data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Users</h2>
        <Link to="/users/new" className="comic-button">
          New User
        </Link>
      </div>

      {loading ? (
        <div>Loading users…</div>
      ) : (
        <div className="grid gap-4">
          {users.map((u) => (
            <div key={u.id} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {u.firstName} {u.lastName}
                  </div>
                  <div className="text-sm text-muted">{u.email}</div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/users/${u.id}`} className="link">
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
