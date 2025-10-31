'use server'

import { cookies } from "next/headers";
const API_BASE =
  process.env.Base_URL ;

export async function getGoalOfTheMonth() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access");

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_BASE}api/v1/goals/`, {
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
        "Content-Type": "application/json",
      },
      cache: "no-store", // Always fetch fresh data
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch leaderboard data: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Log the response to see the actual structure
    console.log("API Response:", data);

    // Handle different possible response structures
   
    if (!data) {
      console.log("No results found in API response");
      return {
        success: true,
        data: [],
      };
    }


    return {
      success: true,
      data: data,
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