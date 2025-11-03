import { httpClient } from "./axiosClient";

export const getTotalCompanies = async (): Promise<number> => {
  try {
    const res = await httpClient.get("/companies/count");
    const body = res.data as any;
    if (body && typeof body.data?.total === "number") return body.data.total;
    if (typeof body === "number") return body;
    console.log(res)
    return 0;
  } catch (error: unknown) {
    console.error("Failed to fetch total companies:", error);
    return 0;
  }
};

export const fetchCompanies = async (): Promise<any[]> => {
  try {
    const res = await httpClient.get("/companies");
    const body = res.data as any;
    return body?.data ?? [];
  } catch (error: unknown) {
    console.error("Failed to fetch companies:", error);
    return [];
  }
};

export const fetchCompany = async (id: string): Promise<any | null> => {
  try {
    const res = await httpClient.get(`/companies/${id}`);
    const body = res.data as any;
    return body?.data ?? null;
  } catch (error: unknown) {
    console.error("Failed to fetch company:", error);
    return null;
  }
};
