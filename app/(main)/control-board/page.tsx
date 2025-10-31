// page.tsx
import { checkTokenValidity } from "@/actions/auth-actions";
import { redirect } from "next/navigation";
import { getCurrentWeek } from "@/lib/utils";
import { getWeekData } from "@/actions/activities";
import ControlPanelClient from "@/components/Control-Board/ControlPanelClient";

export default async function ControlPanelPage() {
  const User = await checkTokenValidity();
  if (!User.isValid || User.groups.includes("Student")) {
    redirect("/auth");
  }

  // Get current week to start
  const { start, end } = getCurrentWeek();
  const result = await getWeekData(start, end);

  if (!result.success && result.error?.includes("access token")) {
    redirect("/auth");
  }

  // Format the data to match the expected interface
  // Handle nested users structure: result.users might be {success, users} or just users[]
  const formattedData = {
    success: result.success,
    users: Array.isArray(result.users) ? result.users : (result.users?.users || []),
    categories: result.categories || [],
    activities: result.activities || {},
    error: result.error,
  };

  return (
    <ControlPanelClient
      Data={formattedData}
    />
  );
}