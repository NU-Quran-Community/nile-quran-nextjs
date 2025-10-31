import { cookies } from "next/headers";



export async function destroySession() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("auth-token");

  if (!tokenCookie) {
    return {
      error: "No active session found",
    };
  }

  cookieStore.delete("access");
  cookieStore.delete("refresh");

  return {
    success: true,
  };
}