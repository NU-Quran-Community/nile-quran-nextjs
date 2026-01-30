"use server";

import { getUserRole, Login } from "@/lib/user";
import createUser from "@/lib/user";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtDecode, JwtPayload } from "jwt-decode";
const API_BASE = process.env.Base_URL;

const COOKIE_NAME1 = "access";
const COOKIE_NAME2 = "refresh";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
interface FormState {
  errors: {
    firstName?: string;
    lastName?: string;
    email?: string;
    referrer?: string;
    username?: string;
    password?: string;
  };
}
interface SignupErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  referrer?: string;
  username?: string;
  password?: string;
}

export async function login(
  prevState: { errors: Record<string, string> },
  formData: FormData,
) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const existingUser = await Login(username, password);

  console.log(existingUser);

  if (!existingUser.access) {
    return {
      errors: {
        email: existingUser?.detail || "فشل تسجيل الدخول، تحقق من بياناتك.",
      },
    };
  }

  if (existingUser.access) {
    const cookieStore = await cookies();
    // This will overwrite any old/invalid tokens
    await cookieStore.set(COOKIE_NAME1, existingUser.access, COOKIE_OPTIONS);
    await cookieStore.set(COOKIE_NAME2, existingUser.refresh, COOKIE_OPTIONS);
    redirect("/");
  } else {
    return {
      errors: {
        email: `Error fetching user by email: ${existingUser.detail}`,
      },
    };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("access");
  cookieStore.delete("refresh");
  redirect("/auth");
}

function isAccessTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const now = Date.now() / 1000;

    // `exp` is optional in JwtPayload, so handle it safely
    if (!decoded.exp) return true;

    return decoded.exp < now;
  } catch {
    return true;
  }
}

async function refreshAccessToken() {
  const cookieStore = await cookies();
  const refresh = cookieStore.get("refresh");
  if (!refresh) throw new Error("No refresh token");

  const res = await fetch(`${API_BASE}auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refresh.value }),
  });

  if (!res.ok) throw new Error("Refresh token expired or invalid");

  const data = await res.json();
  await cookieStore.set("access", data.access, COOKIE_OPTIONS);
  return data.access;
}

// This function just checks validity, doesn't modify cookies
export async function checkTokenValidity() {
  const cookieStore = await cookies();
  const access = cookieStore.get("access");
  const refresh = cookieStore.get("refresh");
  const user = access ? await getUserRole(access.value) : undefined;
  if (!refresh) {
    console.log("❌ No refresh token — user must log in again");
    return {
      isValid: false,
      user: user,
    };
  }

  if (access && !isAccessTokenExpired(access.value)) {
    console.log("✅ Access token still valid");
    return {
      isValid: true,
      user: user,
    };
  }

  try {
    await refreshAccessToken();
    console.log("🔄 Access token refreshed successfully");
    return {
      isValid: true,
      user: user,
    };
  } catch {
    console.log("❌ Both tokens invalid — must log in again");
    // Don't delete cookies here - just return false
    // User will be redirected to /auth where login will overwrite them
    return {
      isValid: false,
      user: user,
    };
  }
}

export async function signup(prevState: FormState, formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const referrer = formData.get("referrer") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const errors: SignupErrors = {};

  // First Name validation
  if (!firstName || firstName.trim().length === 0) {
    errors.firstName = "First name is required";
  } else if (firstName.trim().length < 2) {
    errors.firstName = "First name must be at least 2 characters long";
  } else if (firstName.trim().length > 50) {
    errors.firstName = "First name must be less than 50 characters";
  } else if (
    !/^[\u0621-\u064A\u0660-\u0669a-zA-Z\s'-]+$/.test(firstName.trim())
  ) {
    errors.firstName =
      "Only Arabic or English letters, spaces, hyphens, and apostrophes are allowed";
  }

  // Last Name validation
  if (!lastName || lastName.trim().length === 0) {
    errors.lastName = "Last name is required";
  } else if (lastName.trim().length < 2) {
    errors.lastName = "Last name must be at least 2 characters long";
  } else if (lastName.trim().length > 50) {
    errors.lastName = "Last name must be less than 50 characters";
  } else if (
    !/^[\u0621-\u064A\u0660-\u0669a-zA-Z\s'-]+$/.test(lastName.trim())
  ) {
    errors.lastName =
      "Only Arabic or English letters, spaces, hyphens, and apostrophes are allowed";
  }

  // Email validation
  if (!email || email.trim().length === 0) {
    errors.email = "Email address is required";
  } else if (!email.includes("@")) {
    errors.email = "Please enter a valid email address";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Please enter a valid email address";
  } else if (email.trim().length > 254) {
    errors.email = "Email address is too long";
  }

  // Referrer validation
  if (!referrer || referrer.trim().length === 0) {
    errors.referrer = "Referrer selection is required";
  }

  // Phone Number validation
  if (!username || username.trim().length === 0) {
    errors.username = "username is required";
  }

  // Password validation
  if (!password || password.length === 0) {
    errors.password = "Password is required";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters long";
  } else if (password.length > 128) {
    errors.password = "Password must be less than 128 characters";
  } else if (!/(?=.*[a-z])/.test(password)) {
    errors.password = "Password must contain at least one lowercase letter";
  } else if (!/(?=.*[A-Z])/.test(password)) {
    errors.password = "Password must contain at least one uppercase letter";
  } else if (!/(?=.*\d)/.test(password)) {
    errors.password = "Password must contain at least one number";
  } else if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
    errors.password = "Password must contain at least one special character";
  }

  if (Object.keys(errors).length > 0) {
    return {
      errors,
    };
  }

  try {
    const result = await createUser({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      referrer: referrer.toLowerCase(),
      username: username.trim(),
    });

    if (result?.errors) {
      return result; // handle backend validation errors
    }

    redirect("/auth"); // will throw NEXT_REDIRECT internally
  } catch (error: unknown) {
    // ✅ Ignore NEXT_REDIRECT (it's expected)
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      typeof (error as { digest?: string }).digest === "string" &&
      (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error; // Let Next.js handle redirect
    }

    console.error("Signup error:", error);

    return {
      errors: {
        email: "An unexpected error occurred. Please try again.",
      },
    };
  }
}
