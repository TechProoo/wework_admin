import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchUser } from "../api/users";

export default function UserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    fetchUser(id).then((u) => setUser(u));
  }, [id]);

  if (!user) return <div className="py-8">Loading...</div>;

  return (
    <section className="py-8">
      <h2 className="text-2xl font-semibold">
        {user.firstName} {user.lastName}
      </h2>
      <div className="mt-4 card">
        <div>
          <strong>Email:</strong> {user.email}
        </div>
        <div>
          <strong>ID:</strong> {user.id}
        </div>
      </div>
    </section>
  );
}
