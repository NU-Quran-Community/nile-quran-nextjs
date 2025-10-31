"use server";

import { cookies } from "next/headers";

const API_BASE = process.env.Base_URL;

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  supervisor: string;
  phone_number: string;
  date_joined: string;
  groups: string[];
}

// Updated to match actual API response
interface Activity {
  id?: number;
  type?: string;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

interface LeaderboardItem {
  user: number; // Just the user ID, not the full object
  points: number;
  activities: Activity[];
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: LeaderboardItem[];
}

interface MappedLeaderboardUser {
  id: number;
  name: string;
  username: string;
  points: number;
  groups: string[];
}

type APIResponse = LeaderboardItem[] | PaginatedResponse | LeaderboardItem;

export async function getLeaderboardData() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access");

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_BASE}api/v1/users/points/`, {
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch leaderboard data: ${response.status} - ${errorText}`
      );
    }

    const data: APIResponse = await response.json();

    console.log("API Response:", JSON.stringify(data, null, 2));

    // Handle different possible response structures
    let results: LeaderboardItem[] = [];

    if (Array.isArray(data)) {
      results = data;
    } else if ("results" in data && Array.isArray(data.results)) {
      results = data.results;
    } else if ("user" in data && "points" in data) {
      results = [data];
    }

    if (results.length === 0) {
      console.log("No results found in API response");
      return {
        success: true,
        data: [],
      };
    }

    // Sort by points descending
    const sortedResults = results.sort((a, b) => {
      const aPoints = a.points || 0;
      const bPoints = b.points || 0;
      return bPoints - aPoints;
    });

    // Fetch user details for each user ID
    const mappedData: MappedLeaderboardUser[] = await Promise.all(
      sortedResults.map(async (item) => {
        const userId = item.user;
        
        // Fetch user details
        const userDetailsResponse = await getUserDetails(userId);
        
        if (userDetailsResponse.success && userDetailsResponse.user) {
          return {
            id: userDetailsResponse.user.id,
            name: userDetailsResponse.user.name,
            username: userDetailsResponse.user.username,
            points: item.points || 0,
            groups: userDetailsResponse.user.groups || [],
          };
        }
        
        // Fallback if user details fetch fails
        return {
          id: userId,
          name: "مستخدم",
          username: "",
          points: item.points || 0,
          groups: [],
        };
      })
    );

    return {
      success: true,
      data: mappedData,
    };
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getUserDetails(userId: number) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access");

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_BASE}api/v1/users/${userId}/`, {
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user details");
    }

    const user: User = await response.json();

    return {
      success: true,
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        username: user.username,
        email: user.email,
        groups: user.groups,
      },
    };
  } catch (error) {
    console.error("Error fetching user details:", error);
    return {
      success: false,
      user: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}