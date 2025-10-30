import { useEffect, useState } from "react";
import { fetchCompanies } from "../api/companies";
import { Link } from "react-router-dom";

export default function CompaniesList() {
  const [companies, setCompanies] = useState<any[]>([]);
  useEffect(() => {
    fetchCompanies().then((c) => setCompanies(c || []));
  }, []);

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Companies</h2>
      </div>
      <div className="grid gap-4">
        {companies.map((c) => (
          <div key={c.id} className="card flex items-center justify-between">
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-sm text-muted">{c.email}</div>
            </div>
            <div>
              <Link to={`/companies/${c.id}`} className="link">
                View
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
