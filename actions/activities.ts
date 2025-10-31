"use server";

import { revalidatePath } from "next/cache";
import { getWeekByOffset } from "@/lib/utils";
import { cookies } from "next/headers";

const API_BASE =
  process.env.Base_URL;
  type Activity = {
  id: number;
  category: number;
  date: string;
  points?: number;
};
type UserSummary = {
  user: number;
  points: number;
  activities: Activity[];
};



// ===============================
// ADD USER ACTIVITY
// ===============================
export async function addUserActivity(uid: number, category: number, date: string) {
  try {
    const cookieStore = await cookies();
    const access = cookieStore.get("access")?.value;

    await fetch(`${API_BASE}api/v1/users/${uid}/activities/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ category, date }),
    });

    revalidatePath("/control-panel");
    return { success: true };
  } catch (error) {
    console.error("Error adding activity:", error);
    return { success: false, error: "فشل إضافة النشاط" };
  }
}

// ===============================
// DELETE USER ACTIVITY
// ===============================
export async function deleteUserActivity(uid: number, activityId: number) {
  try {
    const cookieStore = await cookies();
    const access = cookieStore.get("access")?.value;

    await fetch(`${API_BASE}api/v1/users/${uid}/activities/${activityId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${access}`,
        "Content-Type": "application/json",
      },
    });

    revalidatePath("/control-panel");
    return { success: true };
  } catch (error) {
    console.error("Error deleting activity:", error);
    return { success: false, error: "فشل حذف النشاط" };
  }
}

// ===============================
// GET CATEGORIES (WITH DATES)
// ===============================
export async function getCategories(start?: string, end?: string) {
  const cookieStore = await cookies();
  const access = cookieStore.get("access")?.value;

  if (!access) throw new Error("No access token found in cookies");

  // ✅ Pass week range as query params if backend supports it
  const query = start && end ? `?start=${start}&end=${end}` : "";

  const response = await fetch(`${API_BASE}api/v1/users/points/categories/${query}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${access}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch categories: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log("Categories API Response:", data);

  if (Array.isArray(data)) return data;
  if (data.results && Array.isArray(data.results)) return data.results;
  return [];
}

// ===============================
// GET USERS WITH DETAILS (WITH DATES)
// ===============================
export async function getUsersWithDetails(start?: string, end?: string) {
  try {
    const cookieStore = await cookies();
    const access = cookieStore.get("access")?.value;

    if (!access) throw new Error("No access token found in cookies");

    // ✅ Include week range if supported by your backend
    const query = start && end ? `?start=${start}&end=${end}` : "";

    const summaryRes = await fetch(`${API_BASE}api/v1/users/points/${query}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const summaryData = await summaryRes.json();

    if (!summaryRes.ok) {
      throw new Error("Failed to fetch user activities");
    }
    if (!summaryData.results) {
      throw new Error("No users found");
    }

    const users = await Promise.all(
      summaryData.results.map(async (item: UserSummary) => {
        try {
          const userRes = await fetch(`${API_BASE}api/v1/users/${item.user}`);
          const userData = await userRes.json();

          return {
            id: item.user,
            ...userData,
            points: item.points,
            activities: item.activities,
          };
        } catch (err) {
          console.error(`Error fetching user ${item.user}:`, err);
          return null;
        }
      })
    );

    const validUsers = users.filter(Boolean);
    return { success: true, users: validUsers };
  } catch (error) {
    console.error("Error in getUsersWithDetails:", error);
    return { success: false, error: "فشل في جلب بيانات المستخدمين" };
  }
}

// ===============================
// GET WEEK DATA
// ===============================
export async function getWeekData(start: string, end: string) {
  try {
    const [users, categories] = await Promise.all([
      getUsersWithDetails(start, end),
      getCategories(start, end),
    ]);

    const activitiesMap: Record<string, Activity[]> = {};

    return {
      success: true,
      users: users || [],
      activities: activitiesMap,
      categories: categories || [],
    };
  } catch (error) {
    console.error("Error fetching week data:", error);
    return {
      success: false,
      users: [],
      activities: {},
      categories: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ===============================
// FETCH WEEK DATA ACTION
// ===============================
export async function fetchWeekDataAction(weekOffset: number) {
  try {
    const { start, end } = getWeekByOffset(weekOffset);
    return await getWeekData(start, end);
  } catch (error) {
    console.error("Error fetching week data:", error);
    return {
      success: false,
      users: [],
      activities: {},
      categories: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
