import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME } from "@/lib/session";

export default async function RootPage() {
  const cookieStore = await cookies();
  const hasSession = cookieStore.has(SESSION_COOKIE_NAME);
  redirect(hasSession ? "/budgets" : "/login");
}
