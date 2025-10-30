const API_BASE =
  (import.meta.env as any).VITE_API_BASE_URL ||
  (import.meta.env as any).VITE_API_URL ||
  "";

export async function fetchCompanies() {
  try {
    const res = await fetch(API_BASE + "/companies", {
      credentials: "include",
    });
    if (!res.ok) throw new Error("No companies endpoint");
    const body = await res.json();
    return body.data || body;
  } catch (_) {
    return [
      { id: "c1", name: "Acme Inc", email: "hello@acme.com" },
      { id: "c2", name: "Globex", email: "contact@globex.com" },
    ];
  }
}

export async function fetchCompany(id: string) {
  try {
    const res = await fetch(API_BASE + `/companies/${id}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Company not found");
    const body = await res.json();
    return body.data || body;
  } catch (_) {
    return { id, name: "Demo Company", email: `company+${id}@example.com` };
  }
}

export async function updateCompany(id: string, payload: any) {
  try {
    const res = await fetch(API_BASE + `/companies/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Update failed");
    const body = await res.json();
    return body.data || body;
  } catch (err) {
    throw err;
  }
}

export async function deleteCompany(id: string) {
  try {
    const res = await fetch(API_BASE + `/companies/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Delete failed");
    const body = await res.json();
    return body;
  } catch (_) {
    return { success: true };
  }
}
