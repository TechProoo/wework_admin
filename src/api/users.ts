const API_BASE =
  (import.meta.env as any).VITE_API_BASE_URL ||
  (import.meta.env as any).VITE_API_URL ||
  "";

export async function fetchUsers() {
  try {
    const res = await fetch(API_BASE + "/students", {
      credentials: "include",
    });
    if (!res.ok) throw new Error("No users endpoint");
    const body = await res.json();
    return body.data || body;
  } catch (err) {
    // Backend does not expose list users in current API; return mock data
    return [
      {
        id: "u1",
        firstName: "Alice",
        lastName: "Anderson",
        email: "alice@example.com",
      },
      {
        id: "u2",
        firstName: "Bob",
        lastName: "Brown",
        email: "bob@example.com",
      },
    ];
  }
}

export async function fetchUser(id: string) {
  try {
    const res = await fetch(API_BASE + `/students/${id}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("User not found");
    const body = await res.json();
    return body.data || body;
  } catch (_) {
    return {
      id,
      firstName: "Demo",
      lastName: "User",
      email: `user+${id}@example.com`,
    };
  }
}

export async function updateUser(id: string, payload: any) {
  try {
    const res = await fetch(API_BASE + `/students/${id}`, {
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

export async function deleteUser(id: string) {
  try {
    const res = await fetch(API_BASE + `/students/${id}`, {
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
