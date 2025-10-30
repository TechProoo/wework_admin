import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchCompany } from "../api/companies";

export default function CompanyDetail() {
  const { id } = useParams();
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    fetchCompany(id).then((c) => setCompany(c));
  }, [id]);

  if (!company) return <div className="py-8">Loading...</div>;

  return (
    <section className="py-8">
      <h2 className="text-2xl font-semibold">{company.name}</h2>
      <div className="mt-4 card">
        <div>
          <strong>Email:</strong> {company.email}
        </div>
        <div>
          <strong>ID:</strong> {company.id}
        </div>
      </div>
    </section>
  );
}
