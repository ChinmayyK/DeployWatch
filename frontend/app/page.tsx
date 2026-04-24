import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE } from "@/config/constants";

export default async function HomePage() {
  redirect("/login");
}
