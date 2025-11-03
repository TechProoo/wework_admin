import { httpClient } from "./axiosClient";

export const getTotalUsers = async (): Promise<number> => {
  try {
    const res = await httpClient.get("/students/count");
    const body = res.data as any;
    if (body && typeof body.data?.total === "number") return body.data.total;
    if (typeof body === "number") return body;
    console.log("Total users", res)
    return 0;
  } catch (error: unknown) {
    console.error("Failed to fetch total students:", error);
    return 0;
  }
};

export const fetchUsers = async (): Promise<any[]> => {
  try {
    const res = await httpClient.get("/students");
    const body = res.data as any;
    // controller typically returns { statusCode, message, data }
    return body?.data ?? [];
  } catch (error: unknown) {
    console.error("Failed to fetch users:", error);
    return [];
  }
};

export const fetchUser = async (id: string): Promise<any | null> => {
  try {
    const res = await httpClient.get(`/students/${id}`);
    const body = res.data as any;
    return body?.data ?? null;
  } catch (error: unknown) {
    console.error("Failed to fetch user:", error);
    return null;
  }
};
